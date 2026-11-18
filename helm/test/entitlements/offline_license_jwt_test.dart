import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:waypoint/core/entitlements/entitlement_capabilities.dart';
import 'package:waypoint/core/entitlements/entitlement_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory tempDir;
  late Box testBox;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('waycord_jwt_test');
    Hive.init(tempDir.path);
    testBox = await Hive.openBox('test_entitlements_jwt');
  });

  tearDownAll(() async {
    await Hive.close();
    await tempDir.delete(recursive: true);
  });

  setUp(() async {
    await testBox.clear();
    EntitlementService().resetForTesting();
  });

  String createTestJwt({
    required String alg,
    required String tier,
    required int expTimestamp,
    String signature = 'valid_test_signature_bytes_123',
    String? rawPayload,
  }) {
    final header = base64Url.encode(utf8.encode(jsonEncode({'alg': alg, 'typ': 'JWT'}))).replaceAll('=', '');
    final payload = rawPayload ??
        base64Url.encode(utf8.encode(jsonEncode({
          'sub': 'usr_test_123',
          'tier': tier,
          'exp': expTimestamp,
        }))).replaceAll('=', '');
    return '$header.$payload.$signature';
  }

  group('Offline License JWT & Grace Period Verification Tests', () {
    test('Valid signed Pro JWT offline unlocks Pro capabilities with zero network access', () async {
      final service = EntitlementService();
      final validFutureExp = (DateTime.now().toUtc().millisecondsSinceEpoch ~/ 1000) + (14 * 86400); // 14 days
      final jwt = createTestJwt(alg: 'RS256', tier: 'pro', expTimestamp: validFutureExp);

      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, jwt);

      await service.initialize(customBox: testBox);

      expect(service.activeTier, equals(WaycordTier.pro));
      expect(service.capabilities.canUseCustomRecurrence, isTrue);
      expect(service.capabilities.maxSyncedDevices, equals(-1));
      expect(service.capabilities.monthlyCloudAiLimit, equals(-1));
      expect(service.hasOfflineRenewalWarning, isFalse);
    });

    test('Expired JWT within 72-hour grace window remains Pro with offline renewal warning flag', () async {
      final service = EntitlementService();
      // Expired 24 hours ago (well within the 72h grace window)
      final expiredWithinGrace = (DateTime.now().toUtc().millisecondsSinceEpoch ~/ 1000) - (24 * 3600);
      final jwt = createTestJwt(alg: 'RS256', tier: 'pro', expTimestamp: expiredWithinGrace);

      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, jwt);

      await service.initialize(customBox: testBox);

      expect(service.activeTier, equals(WaycordTier.pro), reason: 'Must remain Pro during 72h grace window');
      expect(service.capabilities.canUseCustomRecurrence, isTrue);
      expect(service.isInGracePeriod, isTrue, reason: 'Must flag grace period active');
      expect(service.hasOfflineRenewalWarning, isTrue, reason: 'Must surface renewal warning flag');
    });

    test('Expired JWT beyond 72-hour grace window cleanly downgrades to Free Core capabilities', () async {
      final service = EntitlementService();
      // Expired 73 hours ago (beyond the 72h grace window)
      final expiredPastGrace = (DateTime.now().toUtc().millisecondsSinceEpoch ~/ 1000) - (73 * 3600);
      final jwt = createTestJwt(alg: 'RS256', tier: 'pro', expTimestamp: expiredPastGrace);

      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, jwt);

      // Verify no exception thrown
      expect(() async => await service.initialize(customBox: testBox), returnsNormally);

      expect(service.activeTier, equals(WaycordTier.free), reason: 'Must downgrade to Free after 72h window');
      expect(service.capabilities.canUseCustomRecurrence, isFalse);
      expect(service.capabilities.maxSyncedDevices, equals(2));
      expect(service.capabilities.monthlyCloudAiLimit, equals(20));
      expect(service.capabilities.maxWorkspaces, equals(2));
    });

    test('Tampered JWT payload or invalid signature immediately rejected and falls back to Free', () async {
      final service = EntitlementService();
      final validExp = (DateTime.now().toUtc().millisecondsSinceEpoch ~/ 1000) + 86400;

      // 1. Missing signature
      final missingSigJwt = createTestJwt(alg: 'RS256', tier: 'pro', expTimestamp: validExp, signature: '');
      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, missingSigJwt);

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.free));

      // 2. Symmetric algorithm tampering attempt (HS256)
      service.resetForTesting();
      await testBox.clear();
      final hs256Jwt = createTestJwt(alg: 'HS256', tier: 'pro', expTimestamp: validExp);
      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, hs256Jwt);

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.free));

      // 3. Corrupted base64 payload
      service.resetForTesting();
      await testBox.clear();
      final corruptedJwt = 'eyJhbGciOiJSUzI1NiJ9.corrupted_non_json_payload.fake_sig';
      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, corruptedJwt);

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.free));
    });
  });
}
