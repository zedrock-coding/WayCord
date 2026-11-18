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
    tempDir = await Directory.systemTemp.createTemp('waycord_entitlement_test');
    Hive.init(tempDir.path);
    testBox = await Hive.openBox('test_entitlements');
  });

  tearDownAll(() async {
    await Hive.close();
    await tempDir.delete(recursive: true);
  });

  setUp(() async {
    await testBox.clear();
    EntitlementService().resetForTesting();
  });

  group('EntitlementCapabilities Matrix', () {
    test('Free Core matrix adheres to strict limits', () {
      final caps = EntitlementCapabilities.forTier(WaycordTier.free);
      expect(caps.canUseCustomRecurrence, isFalse);
      expect(caps.maxSyncedDevices, equals(2));
      expect(caps.monthlyCloudAiLimit, equals(20));
      expect(caps.maxWorkspaces, equals(2));
      expect(caps.maxMembersPerWorkspace, equals(5));
      expect(caps.canRecoverTrash, isFalse);
      expect(caps.canUseWeightedRbac, isFalse);
    });

    test('Waycord Pro matrix unlocks custom recurrence, unlimited AI, and 30-day trash', () {
      final caps = EntitlementCapabilities.forTier(WaycordTier.pro);
      expect(caps.canUseCustomRecurrence, isTrue);
      expect(caps.maxSyncedDevices, equals(-1));
      expect(caps.monthlyCloudAiLimit, equals(-1));
      expect(caps.maxWorkspaces, equals(-1));
      expect(caps.maxMembersPerWorkspace, equals(15));
      expect(caps.canRecoverTrash, isTrue);
      expect(caps.canUseWeightedRbac, isFalse);
    });

    test('Team / Campus matrix unlocks 3-tier weighted RBAC and unlimited seats', () {
      final caps = EntitlementCapabilities.forTier(WaycordTier.team);
      expect(caps.canUseCustomRecurrence, isTrue);
      expect(caps.maxSyncedDevices, equals(-1));
      expect(caps.monthlyCloudAiLimit, equals(-1));
      expect(caps.maxWorkspaces, equals(-1));
      expect(caps.maxMembersPerWorkspace, equals(-1));
      expect(caps.canRecoverTrash, isTrue);
      expect(caps.canUseWeightedRbac, isTrue);
    });
  });

  group('Developer Tier Switcher', () {
    test('Flipping developer override immediately alters active tier and capabilities without restart', () async {
      final service = EntitlementService();
      await service.initialize(customBox: testBox);

      expect(service.activeTier, equals(WaycordTier.free));
      expect(service.capabilities.canUseCustomRecurrence, isFalse);
      expect(service.capabilities.maxWorkspaces, equals(2));

      int notificationCount = 0;
      service.addListener(() => notificationCount++);

      // Switch to Pro
      service.setDevOverrideTier(WaycordTier.pro);
      expect(service.activeTier, equals(WaycordTier.pro));
      expect(service.isDevOverrideActive, isTrue);
      expect(service.capabilities.canUseCustomRecurrence, isTrue);
      expect(service.capabilities.maxWorkspaces, equals(-1));
      expect(service.capabilities.monthlyCloudAiLimit, equals(-1));
      expect(service.capabilities.canRecoverTrash, isTrue);
      expect(notificationCount, equals(1));

      // Switch to Team
      service.setDevOverrideTier(WaycordTier.team);
      expect(service.activeTier, equals(WaycordTier.team));
      expect(service.capabilities.canUseWeightedRbac, isTrue);
      expect(service.capabilities.maxMembersPerWorkspace, equals(-1));
      expect(notificationCount, equals(2));

      // Revert to Default (null)
      service.setDevOverrideTier(null);
      expect(service.activeTier, equals(WaycordTier.free));
      expect(service.isDevOverrideActive, isFalse);
      expect(service.capabilities.canUseCustomRecurrence, isFalse);
      expect(notificationCount, equals(3));
    });
  });

  group('Offline Grace Window & JWT Resolution', () {
    test('Subscription expired within 72-hour grace window remains active', () async {
      final service = EntitlementService();
      // Period ended 24 hours ago (within 72h grace)
      final periodEnd = DateTime.now().toUtc().subtract(const Duration(hours: 24));
      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyPeriodEnd, periodEnd.toIso8601String());

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.pro));
      expect(service.capabilities.canUseCustomRecurrence, isTrue);
    });

    test('Subscription expired beyond 72-hour grace window degrades to Free Core', () async {
      final service = EntitlementService();
      // Period ended 80 hours ago (past 72h grace)
      final periodEnd = DateTime.now().toUtc().subtract(const Duration(hours: 80));
      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyPeriodEnd, periodEnd.toIso8601String());

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.free));
      expect(service.capabilities.canUseCustomRecurrence, isFalse);
    });

    test('Valid offline JWT within grace period resolves tier', () async {
      final service = EntitlementService();
      final header = base64Url.encode(utf8.encode(jsonEncode({'alg': 'RS256', 'typ': 'JWT'})));
      final expTimestamp = (DateTime.now().toUtc().millisecondsSinceEpoch ~/ 1000) + 3600; // 1h in future
      final payload = base64Url.encode(utf8.encode(jsonEncode({
        'sub': 'user-123',
        'tier': 'pro',
        'exp': expTimestamp,
      })));
      final mockJwt = '$header.$payload.mock_signature';

      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, mockJwt);

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.pro));
    });

    test('Malformed offline JWT degrades to Free Core', () async {
      final service = EntitlementService();
      await testBox.put(EntitlementService.keyTier, 'pro');
      await testBox.put(EntitlementService.keyJwt, 'invalid.jwt');

      await service.initialize(customBox: testBox);
      expect(service.activeTier, equals(WaycordTier.free));
    });
  });

  group('Device Identity & Sync Management', () {
    test('getDeviceId generates and caches a stable device ID in Hive', () async {
      final service = EntitlementService();
      await service.initialize(customBox: testBox);

      final id1 = service.getDeviceId();
      expect(id1, isNotEmpty);
      expect(id1.startsWith('dev_'), isTrue);

      final id2 = service.getDeviceId();
      expect(id2, equals(id1));
      expect(testBox.get(EntitlementService.keyDeviceId), equals(id1));
    });
  });
}
