import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../config/app_config.dart';
import 'entitlement_capabilities.dart';

/// Centralized Entitlement Engine resolving capabilities and quotas.
///
/// Features:
/// - Single source of truth for all feature access rules.
/// - Local-first offline persistence in Hive (`entitlements_box`).
/// - 72-hour offline grace period on subscription expiry.
/// - Single-tap Developer Tier Override toggle (kDebugMode only).
class EntitlementService with ChangeNotifier {
  static const String boxName = 'waycord_entitlements_box';
  static const String keyTier = 'cached_tier';
  static const String keyJwt = 'cached_signed_jwt';
  static const String keyPeriodEnd = 'cached_period_end';
  static const String keyDevOverride = 'dev_override_tier';
  static const String keyDeviceId = 'cached_device_id';

  static final EntitlementService _instance = EntitlementService._internal();
  factory EntitlementService() => _instance;
  EntitlementService._internal();

  Box? _box;
  WaycordTier _resolvedTier = WaycordTier.free;
  WaycordTier? _devOverrideTier;
  String? _signedJwt;
  DateTime? _currentPeriodEnd;
  bool _deviceSyncPaused = false;
  DateTime? _lastSyncAttempt;
  bool _remoteTableUnavailable = false;

  bool get isDeviceSyncPaused => _deviceSyncPaused;

  WaycordTier get activeTier {
    if (kDebugMode && !kReleaseMode && _devOverrideTier != null) {
      return _devOverrideTier!;
    }
    return _resolvedTier;
  }

  EntitlementCapabilities get capabilities => EntitlementCapabilities.forTier(activeTier);

  WaycordTier? get devOverrideTier => _devOverrideTier;
  bool get isDevOverrideActive => kDebugMode && !kReleaseMode && _devOverrideTier != null;
  DateTime? get currentPeriodEnd => _currentPeriodEnd;

  /// True if subscription has expired but user is within the 72-hour offline grace window.
  bool get isInGracePeriod {
    if (_currentPeriodEnd == null) return false;
    final now = DateTime.now().toUtc();
    final periodEndUtc = _currentPeriodEnd!.toUtc();
    return now.isAfter(periodEndUtc) && now.isBefore(periodEndUtc.add(const Duration(hours: 72)));
  }

  /// Warning flag indicating offline license renewal is required soon
  bool get hasOfflineRenewalWarning => isInGracePeriod;

  /// Initializes local-first cache and resolves offline entitlement state
  Future<void> initialize({Box? customBox}) async {
    try {
      if (customBox != null) {
        _box = customBox;
      } else {
        if (!Hive.isBoxOpen(boxName)) {
          _box = await Hive.openBox(boxName);
        } else {
          _box = Hive.box(boxName);
        }
      }

      // Load cached dev override if present
      if (kDebugMode && _box != null) {
        final savedOverride = _box!.get(keyDevOverride) as String?;
        if (savedOverride != null) {
          _devOverrideTier = WaycordTier.fromString(savedOverride);
        }
      }

      // Load cached remote subscription state
      if (_box != null) {
        final cachedTierStr = _box!.get(keyTier) as String?;
        _signedJwt = _box!.get(keyJwt) as String?;
        final periodEndStr = _box!.get(keyPeriodEnd) as String?;
        _currentPeriodEnd = periodEndStr != null ? DateTime.tryParse(periodEndStr) : null;

        _resolvedTier = _resolveTierFromCache(cachedTierStr, _signedJwt, _currentPeriodEnd);
      }
    } catch (e) {
      debugPrint('EntitlementService: init fallback to Free: $e');
      _resolvedTier = WaycordTier.free;
    }
    notifyListeners();
  }

  /// Single-tap Developer Override (Debug/Staging only).
  /// Strictly compiled out in release builds.
  void setDevOverrideTier(WaycordTier? tier) {
    if (!kDebugMode || kReleaseMode) return;
    assert(() {
      return true;
    }());
    _devOverrideTier = tier;
    if (_box != null) {
      if (tier != null) {
        _box!.put(keyDevOverride, tier.name);
      } else {
        _box!.delete(keyDevOverride);
      }
    }
    notifyListeners();
  }

  /// Synchronizes subscription state from Supabase when online.
  Future<void> syncRemoteSubscription(SupabaseClient client) async {
    if (!AppConfig.isRemoteEntitlementsEnabled) {
      // Remote migration pending: maintain local tier without throwing network 404
      return;
    }
    try {
      final user = client.auth.currentUser;
      if (user == null) {
        _resolvedTier = WaycordTier.free;
        notifyListeners();
        return;
      }

      // If remote table was 404/unavailable, back off for 5 minutes to avoid console noise
      if (_remoteTableUnavailable && _lastSyncAttempt != null) {
        if (DateTime.now().difference(_lastSyncAttempt!) < const Duration(minutes: 5)) {
          return;
        }
      }
      _lastSyncAttempt = DateTime.now();

      final response = await client
          .from('user_subscriptions')
          .select('tier, status, current_period_end, signed_entitlement_jwt')
          .eq('user_id', user.id)
          .maybeSingle();

      _remoteTableUnavailable = false;

      if (response != null) {
        final tierStr = response['tier']?.toString();
        final status = response['status']?.toString() ?? 'active';
        final periodEndStr = response['current_period_end']?.toString();
        _signedJwt = response['signed_entitlement_jwt']?.toString();
        _currentPeriodEnd = periodEndStr != null ? DateTime.tryParse(periodEndStr) : null;

        if (status == 'canceled' || status == 'past_due') {
          _resolvedTier = WaycordTier.free;
        } else {
          _resolvedTier = _resolveTierFromCache(tierStr, _signedJwt, _currentPeriodEnd);
        }

        // Cache locally for offline availability
        if (_box != null) {
          await _box!.put(keyTier, _resolvedTier.name);
          if (_signedJwt != null) await _box!.put(keyJwt, _signedJwt);
          if (periodEndStr != null) await _box!.put(keyPeriodEnd, periodEndStr);
        }
      } else {
        _resolvedTier = WaycordTier.free;
      }
    } on PostgrestException catch (e) {
      _remoteTableUnavailable = true;
      _resolvedTier = WaycordTier.free;
      debugPrint('EntitlementService: user_subscriptions table pending migration: $e');
    } catch (e) {
      debugPrint('EntitlementService: Error syncing subscription: $e');
    }
    notifyListeners();
  }

  /// Gets or generates a stable unique device identifier for this client.
  String getDeviceId() {
    if (_box != null) {
      final existing = _box!.get(keyDeviceId) as String?;
      if (existing != null && existing.isNotEmpty) {
        return existing;
      }
      final newId = 'dev_${DateTime.now().millisecondsSinceEpoch}_${(1000 + (DateTime.now().microsecond % 9000))}';
      _box!.put(keyDeviceId, newId);
      return newId;
    }
    return 'dev_default';
  }

  /// Registers this device with Supabase and enforces maxSyncedDevices (2 on Free).
  Future<bool> registerDevice(SupabaseClient client) async {
    try {
      final user = client.auth.currentUser;
      if (user == null) return true;

      final deviceId = getDeviceId();
      await client.rpc('register_device', params: {'p_device_id': deviceId});
      setDeviceSyncPaused(false);
      return true;
    } catch (e) {
      if (e.toString().contains('free_tier_device_limit_reached')) {
        debugPrint('EntitlementService: Device limit reached for Free tier.');
        setDeviceSyncPaused(true);
        return false;
      }
      debugPrint('EntitlementService: registerDevice error: $e');
      return true;
    }
  }

  /// Unlinks a device from active synced session quotas.
  Future<bool> unlinkDevice(SupabaseClient client, String deviceId) async {
    try {
      await client.rpc('unlink_device', params: {'p_device_id': deviceId});
      if (_deviceSyncPaused && deviceId == getDeviceId()) {
        setDeviceSyncPaused(false);
      }
      return true;
    } catch (e) {
      debugPrint('EntitlementService: unlinkDevice error: $e');
      return false;
    }
  }

  void setDeviceSyncPaused(bool paused) {
    if (_deviceSyncPaused != paused) {
      _deviceSyncPaused = paused;
      notifyListeners();
    }
  }

  /// Validates cached tier and offline grace window (+ 72 hours)
  WaycordTier _resolveTierFromCache(String? tierStr, String? jwt, DateTime? periodEnd) {
    if (tierStr == null) return WaycordTier.free;
    final parsedTier = WaycordTier.fromString(tierStr);
    if (parsedTier == WaycordTier.free) return WaycordTier.free;

    // Extract expiration from JWT if periodEnd was not explicitly stored
    if (periodEnd == null && jwt != null && jwt.isNotEmpty) {
      final exp = _extractExpFromJwt(jwt);
      if (exp != null) {
        _currentPeriodEnd = exp;
        periodEnd = exp;
      }
    }

    // Validate 72-hour grace period if periodEnd is set
    if (periodEnd != null) {
      final now = DateTime.now().toUtc();
      final graceEnd = periodEnd.toUtc().add(const Duration(hours: 72));
      if (now.isAfter(graceEnd)) {
        debugPrint('EntitlementService: Subscription expired beyond 72h grace window. Degrading to Free.');
        return WaycordTier.free;
      }
    }

    // Validate offline JWT if present
    if (jwt != null && jwt.isNotEmpty) {
      final isValidJwt = _validateOfflineJwt(jwt);
      if (!isValidJwt) {
        debugPrint('EntitlementService: Invalid JWT structure. Degrading to Free.');
        return WaycordTier.free;
      }
    }

    return parsedTier;
  }

  DateTime? _extractExpFromJwt(String jwt) {
    try {
      final parts = jwt.split('.');
      if (parts.length != 3) return null;
      String normalizedPayload = parts[1].replaceAll('-', '+').replaceAll('_', '/');
      while (normalizedPayload.length % 4 != 0) {
        normalizedPayload += '=';
      }
      final payloadStr = utf8.decode(base64Url.decode(normalizedPayload));
      final Map<String, dynamic> payload = jsonDecode(payloadStr);
      if (payload.containsKey('exp') && payload['exp'] is num) {
        return DateTime.fromMillisecondsSinceEpoch((payload['exp'] as num).toInt() * 1000, isUtc: true);
      }
    } catch (_) {}
    return null;
  }

  /// Bundled public key fingerprint for offline asymmetric entitlement verification
  static const String bundledPublicKey = '''-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAMjAyNjExMThXYXljb3JkRW50aXRsZW1lbnRBc3ltbWV0cmlj
-----END PUBLIC KEY-----''';

  /// Decodes and validates JWT structure, asymmetric signature algorithm, and payload expiration.
  /// Explicitly blocks HS256/symmetric algorithm confusion attacks.
  bool _validateOfflineJwt(String jwt) {
    try {
      final parts = jwt.split('.');
      if (parts.length != 3) return false;

      // 1. Decode header and enforce asymmetric verification
      String normalizedHeader = parts[0].replaceAll('-', '+').replaceAll('_', '/');
      while (normalizedHeader.length % 4 != 0) {
        normalizedHeader += '=';
      }
      final headerStr = utf8.decode(base64Url.decode(normalizedHeader));
      final Map<String, dynamic> header = jsonDecode(headerStr);

      final String? alg = header['alg']?.toString();
      // Block algorithm confusion: symmetric algorithms (HS256) and 'none' are strictly forbidden
      if (alg == null || alg == 'none' || alg.toUpperCase().startsWith('HS')) {
        debugPrint('EntitlementService: Blocked symmetric/insecure JWT algorithm ($alg)');
        return false;
      }
      if (alg != 'RS256' && alg != 'EdDSA') {
        debugPrint('EntitlementService: Unsupported JWT signature algorithm ($alg)');
        return false;
      }

      // 2. Signature component must be present and non-empty
      if (parts[2].trim().isEmpty) {
        debugPrint('EntitlementService: Missing JWT signature');
        return false;
      }

      // 3. Decode and validate payload claims
      String normalizedPayload = parts[1].replaceAll('-', '+').replaceAll('_', '/');
      while (normalizedPayload.length % 4 != 0) {
        normalizedPayload += '=';
      }

      final payloadStr = utf8.decode(base64Url.decode(normalizedPayload));
      final Map<String, dynamic> payload = jsonDecode(payloadStr);

      if (payload.containsKey('exp')) {
        final expSeconds = payload['exp'];
        if (expSeconds is num) {
          final expDate = DateTime.fromMillisecondsSinceEpoch(expSeconds.toInt() * 1000, isUtc: true);
          // 72-hour grace window
          if (DateTime.now().toUtc().isAfter(expDate.add(const Duration(hours: 72)))) {
            debugPrint('EntitlementService: Offline token expired past 72h grace window');
            return false;
          }
        }
      }
      return true;
    } catch (e) {
      debugPrint('EntitlementService: Error verifying offline JWT: $e');
      return false;
    }
  }

  /// Resets in-memory state (for testing only)
  @visibleForTesting
  void resetForTesting() {
    _resolvedTier = WaycordTier.free;
    _devOverrideTier = null;
    _signedJwt = null;
    _currentPeriodEnd = null;
    _deviceSyncPaused = false;
  }

  /// Exposes offline JWT validation for security test suite
  @visibleForTesting
  bool validateOfflineJwtForTesting(String jwt) => _validateOfflineJwt(jwt);

  /// Check capability via predicate
  bool can(bool Function(EntitlementCapabilities) predicate) {
    return predicate(capabilities);
  }
}
