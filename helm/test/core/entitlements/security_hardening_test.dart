import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/core/entitlements/entitlement_service.dart';

void main() {
  group('Security Hardening & Anti-Bypass Audit Tests', () {
    late EntitlementService entitlementService;

    setUp(() {
      entitlementService = EntitlementService();
      entitlementService.resetForTesting();
    });

    String createToken({
      required Map<String, dynamic> header,
      required Map<String, dynamic> payload,
      String signature = 'fake_signature_bytes_123',
    }) {
      final headerB64 = base64Url.encode(utf8.encode(jsonEncode(header))).replaceAll('=', '');
      final payloadB64 = base64Url.encode(utf8.encode(jsonEncode(payload))).replaceAll('=', '');
      return '$headerB64.$payloadB64.$signature';
    }

    test('Strictly rejects HS256 algorithm confusion attack', () {
      final token = createToken(
        header: {'alg': 'HS256', 'typ': 'JWT'},
        payload: {
          'sub': 'user-123',
          'tier': 'pro',
          'exp': DateTime.now().add(const Duration(days: 30)).millisecondsSinceEpoch ~/ 1000,
        },
      );

      final isValid = entitlementService.validateOfflineJwtForTesting(token);
      expect(isValid, isFalse, reason: 'HS256 tokens must be rejected to prevent algorithm confusion');
    });

    test('Strictly rejects HS384 and HS512 symmetric tokens', () {
      final token384 = createToken(
        header: {'alg': 'HS384', 'typ': 'JWT'},
        payload: {'sub': 'user-123', 'tier': 'pro'},
      );
      final token512 = createToken(
        header: {'alg': 'HS512', 'typ': 'JWT'},
        payload: {'sub': 'user-123', 'tier': 'team'},
      );

      expect(entitlementService.validateOfflineJwtForTesting(token384), isFalse);
      expect(entitlementService.validateOfflineJwtForTesting(token512), isFalse);
    });

    test('Strictly rejects alg: "none" unauthenticated tokens', () {
      final token = createToken(
        header: {'alg': 'none', 'typ': 'JWT'},
        payload: {'sub': 'user-123', 'tier': 'team'},
        signature: '',
      );

      final isValid = entitlementService.validateOfflineJwtForTesting(token);
      expect(isValid, isFalse, reason: 'alg: none must never be permitted');
    });

    test('Strictly rejects tokens with missing or whitespace-only signatures', () {
      final tokenEmptySig = createToken(
        header: {'alg': 'RS256', 'typ': 'JWT'},
        payload: {'sub': 'user-123', 'tier': 'pro'},
        signature: '',
      );
      final tokenWhitespaceSig = createToken(
        header: {'alg': 'RS256', 'typ': 'JWT'},
        payload: {'sub': 'user-123', 'tier': 'pro'},
        signature: '   ',
      );

      expect(entitlementService.validateOfflineJwtForTesting(tokenEmptySig), isFalse);
      expect(entitlementService.validateOfflineJwtForTesting(tokenWhitespaceSig), isFalse);
    });

    test('Strictly rejects tokens expired past 72-hour grace period', () {
      final expiredPastGrace = DateTime.now().subtract(const Duration(hours: 73)).millisecondsSinceEpoch ~/ 1000;
      final token = createToken(
        header: {'alg': 'RS256', 'typ': 'JWT'},
        payload: {
          'sub': 'user-123',
          'tier': 'pro',
          'exp': expiredPastGrace,
        },
      );

      final isValid = entitlementService.validateOfflineJwtForTesting(token);
      expect(isValid, isFalse, reason: 'Token expired beyond 72h grace window must be invalid');
    });

    test('Accepts valid RS256 token within 72-hour grace window', () {
      final validExp = DateTime.now().add(const Duration(days: 7)).millisecondsSinceEpoch ~/ 1000;
      final token = createToken(
        header: {'alg': 'RS256', 'typ': 'JWT'},
        payload: {
          'sub': 'user-123',
          'tier': 'pro',
          'exp': validExp,
        },
      );

      final isValid = entitlementService.validateOfflineJwtForTesting(token);
      expect(isValid, isTrue);
    });

    test('Accepts valid EdDSA token within 72-hour grace window', () {
      final validExp = DateTime.now().add(const Duration(days: 14)).millisecondsSinceEpoch ~/ 1000;
      final token = createToken(
        header: {'alg': 'EdDSA', 'typ': 'JWT'},
        payload: {
          'sub': 'user-123',
          'tier': 'team',
          'exp': validExp,
        },
      );

      final isValid = entitlementService.validateOfflineJwtForTesting(token);
      expect(isValid, isTrue);
    });

    test('Rejects malformed token with incorrect segment count', () {
      expect(entitlementService.validateOfflineJwtForTesting('invalid.token'), isFalse);
      expect(entitlementService.validateOfflineJwtForTesting('a.b.c.d'), isFalse);
      expect(entitlementService.validateOfflineJwtForTesting('not-a-token'), isFalse);
    });
  });
}
