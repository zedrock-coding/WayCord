import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/core/entitlements/entitlement_capabilities.dart';

void main() {
  group('EntitlementCapabilities Matrix Specification Tests', () {
    test('Free Core tier capabilities and quota limits are strictly enforced', () {
      final free = EntitlementCapabilities.forTier(WaycordTier.free);

      expect(free.tier, equals(WaycordTier.free));
      expect(free.canUseCustomRecurrence, isFalse, reason: 'Free must lock custom recurrence');
      expect(free.maxSyncedDevices, equals(2), reason: 'Free is capped at 2 synced devices');
      expect(free.monthlyCloudAiLimit, equals(20), reason: 'Free is capped at 20 monthly cloud AI calls');
      expect(free.maxWorkspaces, equals(2), reason: 'Free is capped at 2 workspaces');
      expect(free.maxMembersPerWorkspace, equals(5), reason: 'Free is capped at 5 members per workspace');
      expect(free.canRecoverTrash, isFalse, reason: 'Free does not have 30-day trash recovery');
      expect(free.canUseWeightedRbac, isFalse, reason: 'Free uses basic owner/member roles only');
      expect(free.isProOrAbove, isFalse);
      expect(free.isTeam, isFalse);
    });

    test('Waycord Pro tier capabilities and quota limits are strictly enforced', () {
      final pro = EntitlementCapabilities.forTier(WaycordTier.pro);

      expect(pro.tier, equals(WaycordTier.pro));
      expect(pro.canUseCustomRecurrence, isTrue, reason: 'Pro unlocks full custom recurrence intervals');
      expect(pro.maxSyncedDevices, equals(-1), reason: 'Pro has unlimited synced devices');
      expect(pro.monthlyCloudAiLimit, equals(-1), reason: 'Pro has unlimited cloud Needle AI calls');
      expect(pro.maxWorkspaces, equals(-1), reason: 'Pro has unlimited workspaces');
      expect(pro.maxMembersPerWorkspace, equals(15), reason: 'Pro allows up to 15 members per workspace');
      expect(pro.canRecoverTrash, isTrue, reason: 'Pro includes 30-day trash restoration');
      expect(pro.canUseWeightedRbac, isFalse, reason: 'Pro does not include 3-tier weighted RBAC');
      expect(pro.isProOrAbove, isTrue);
      expect(pro.isTeam, isFalse);
    });

    test('Team / Campus tier capabilities and quota limits are strictly enforced', () {
      final team = EntitlementCapabilities.forTier(WaycordTier.team);

      expect(team.tier, equals(WaycordTier.team));
      expect(team.canUseCustomRecurrence, isTrue, reason: 'Team unlocks full custom recurrence');
      expect(team.maxSyncedDevices, equals(-1), reason: 'Team has unlimited synced devices');
      expect(team.monthlyCloudAiLimit, equals(-1), reason: 'Team has unlimited cloud Needle AI calls');
      expect(team.maxWorkspaces, equals(-1), reason: 'Team has unlimited workspaces');
      expect(team.maxMembersPerWorkspace, equals(-1), reason: 'Team has unlimited members per workspace');
      expect(team.canRecoverTrash, isTrue, reason: 'Team includes trash recovery with audit trail');
      expect(team.canUseWeightedRbac, isTrue, reason: 'Team unlocks 3-tier weighted RBAC');
      expect(team.isProOrAbove, isTrue);
      expect(team.isTeam, isTrue);
    });

    test('WaycordTier string parser accurately resolves aliases and fallbacks', () {
      expect(WaycordTier.fromString('free'), equals(WaycordTier.free));
      expect(WaycordTier.fromString('pro'), equals(WaycordTier.pro));
      expect(WaycordTier.fromString('PRO'), equals(WaycordTier.pro));
      expect(WaycordTier.fromString('team'), equals(WaycordTier.team));
      expect(WaycordTier.fromString('campus'), equals(WaycordTier.team));
      expect(WaycordTier.fromString('unknown_tier'), equals(WaycordTier.free));
      expect(WaycordTier.fromString(null), equals(WaycordTier.free));
    });
  });
}
