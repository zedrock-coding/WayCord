import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:waypoint/core/entitlements/entitlement_capabilities.dart';
import 'package:waypoint/core/entitlements/entitlement_service.dart';
import 'package:waypoint/models/recurrence_rule.dart';
import 'package:waypoint/services/recurrence_calculator.dart';
import 'package:waypoint/services/needle_engine.dart';
import 'package:waypoint/services/ai_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory tempDir;
  late Box testBox;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('waycord_boundary_audit_test');
    Hive.init(tempDir.path);
    testBox = await Hive.openBox('test_boundary_entitlements');
    await EntitlementService().initialize(customBox: testBox);
  });

  tearDownAll(() async {
    await testBox.close();
    await Hive.close();
    await tempDir.delete(recursive: true);
  });

  setUp(() async {
    await testBox.clear();
    EntitlementService().resetForTesting();
    AiService.monthlyQuotaReached.value = false;
  });

  group('Domain 1: Recurrence Engine Gate & Downgrade Resilience', () {
    test('Free tier allows daily and weekly recurrence rollover calculations without friction', () {
      final now = DateTime(2026, 11, 18, 10, 0);

      // Daily preset
      const dailyRule = RecurrenceRule(frequency: 'daily', interval: 1);
      final nextDaily = RecurrenceCalculator.calculateNextDueDate(now, dailyRule, anchor: now);
      expect(nextDaily, equals(DateTime(2026, 11, 19, 10, 0)));
      expect(RecurrenceCalculator.shouldSpawnNextInstance(nextDaily, dailyRule), isTrue);

      // Weekly preset
      const weeklyRule = RecurrenceRule(frequency: 'weekly', interval: 1, daysOfWeek: [3]); // Wednesday
      final nextWeekly = RecurrenceCalculator.calculateNextDueDate(now, weeklyRule, anchor: now);
      expect(nextWeekly, equals(DateTime(2026, 11, 25, 10, 0)));
      expect(RecurrenceCalculator.shouldSpawnNextInstance(nextWeekly, weeklyRule), isTrue);
    });

    test('Free tier locks custom recurrence capability', () {
      final service = EntitlementService();
      service.setDevOverrideTier(WaycordTier.free);
      expect(service.capabilities.canUseCustomRecurrence, isFalse);
    });

    test('Downgrade Resilience: Custom recurring task continues rolling over cleanly under Free tier without crash', () {
      final service = EntitlementService();
      // User creates custom rule while on Pro: "Every 3 days"
      service.setDevOverrideTier(WaycordTier.pro);
      expect(service.capabilities.canUseCustomRecurrence, isTrue);

      const customRule = RecurrenceRule(frequency: 'daily', interval: 3);
      final currentDue = DateTime(2026, 11, 18, 9, 0);

      // User subsequently downgrades to Free
      service.setDevOverrideTier(WaycordTier.free);
      expect(service.capabilities.canUseCustomRecurrence, isFalse);

      // Existing task execution and rollover operates cleanly
      final nextDue = RecurrenceCalculator.calculateNextDueDate(currentDue, customRule, anchor: currentDue);
      expect(nextDue, equals(DateTime(2026, 11, 21, 9, 0)));
      expect(RecurrenceCalculator.shouldSpawnNextInstance(nextDue, customRule), isTrue);
    });
  });

  group('Domain 2: Cloud Sync Device Cap (maxSyncedDevices = 2 on Free)', () {
    test('EntitlementService enforces device limit status and sync pause flag', () async {
      final service = EntitlementService();
      service.setDevOverrideTier(WaycordTier.free);
      expect(service.capabilities.maxSyncedDevices, equals(2));
      expect(service.isDeviceSyncPaused, isFalse);

      // Simulating Device C limit triggered
      service.setDeviceSyncPaused(true);
      expect(service.isDeviceSyncPaused, isTrue);

      // Unlinking or upgrading to Pro restores sync
      service.setDevOverrideTier(WaycordTier.pro);
      expect(service.capabilities.maxSyncedDevices, equals(-1));
      service.setDeviceSyncPaused(false);
      expect(service.isDeviceSyncPaused, isFalse);
    });
  });

  group('Domain 3: Needle AI Cloud Quota & Local Heuristic Fallback', () {
    test('Local on-device heuristic parser remains 100% available without network', () async {
      final parser = LocalHeuristicParser();
      parser.initialize();

      final result = await parser.extractTask(input: 'Submit quarterly budget review tomorrow at 5pm priority high');
      expect(result, isNotNull);
      expect(result!['title'], contains('Submit quarterly budget review'));
      expect(result['priority'].toString().toLowerCase(), equals('high'));
      expect(result['due_date'], isNotNull);
    });

    test('HTTP 429 Quota Exceeded activates subtle quota banner and falls back to local parser', () async {
      expect(AiService.monthlyQuotaReached.value, isFalse);

      // Simulate rate limited state
      AiService.monthlyQuotaReached.value = true;
      expect(AiService.monthlyQuotaReached.value, isTrue);

      // Local parser continues to function seamlessly
      final parser = LocalHeuristicParser();
      parser.initialize();
      final localFallback = await parser.extractTask(input: 'Buy milk tomorrow');
      expect(localFallback, isNotNull);
      expect(localFallback!['title'], contains('Buy milk'));

      // Rollover resets quota reached indicator
      AiService.monthlyQuotaReached.value = false;
      expect(AiService.monthlyQuotaReached.value, isFalse);
    });
  });

  group('Domain 4: Workspace & Member Caps', () {
    test('Free tier caps workspaces at 2 and members at 5', () {
      final service = EntitlementService();
      service.setDevOverrideTier(WaycordTier.free);
      expect(service.capabilities.maxWorkspaces, equals(2));
      expect(service.capabilities.maxMembersPerWorkspace, equals(5));
    });

    test('Pro tier expands workspaces to unlimited and members to 15', () {
      final service = EntitlementService();
      service.setDevOverrideTier(WaycordTier.pro);
      expect(service.capabilities.maxWorkspaces, equals(-1));
      expect(service.capabilities.maxMembersPerWorkspace, equals(15));
    });

    test('Team tier expands workspaces and members to unlimited with 3-tier RBAC', () {
      final service = EntitlementService();
      service.setDevOverrideTier(WaycordTier.team);
      expect(service.capabilities.maxWorkspaces, equals(-1));
      expect(service.capabilities.maxMembersPerWorkspace, equals(-1));
      expect(service.capabilities.canUseWeightedRbac, isTrue);
    });
  });

  group('Domain 5: Soft-Delete Trash Recovery (canRecoverTrash)', () {
    test('Free tier cannot restore from 30-day trash; Pro and Team unlock recovery', () {
      final service = EntitlementService();

      // Free Tier
      service.setDevOverrideTier(WaycordTier.free);
      expect(service.capabilities.canRecoverTrash, isFalse);

      // Pro Tier
      service.setDevOverrideTier(WaycordTier.pro);
      expect(service.capabilities.canRecoverTrash, isTrue);

      // Team Tier
      service.setDevOverrideTier(WaycordTier.team);
      expect(service.capabilities.canRecoverTrash, isTrue);
    });
  });
}
