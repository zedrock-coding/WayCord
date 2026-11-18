import 'package:flutter/foundation.dart';

/// Available subscription tiers in Waycord
enum WaycordTier {
  free,
  pro,
  team;

  String get label {
    switch (this) {
      case WaycordTier.free:
        return 'Free Core';
      case WaycordTier.pro:
        return 'Waycord Pro';
      case WaycordTier.team:
        return 'Team / Campus';
    }
  }

  String get displayName => label;

  static WaycordTier fromString(String? value) {
    if (value == null) return WaycordTier.free;
    switch (value.toLowerCase().trim()) {
      case 'pro':
        return WaycordTier.pro;
      case 'team':
      case 'campus':
        return WaycordTier.team;
      default:
        return WaycordTier.free;
    }
  }
}

/// Immutable capabilities and quotas resolved for the active subscription tier.
@immutable
class EntitlementCapabilities {
  final WaycordTier tier;
  final bool canUseCustomRecurrence;
  final int maxSyncedDevices; // -1 = Unlimited
  final int monthlyCloudAiLimit; // 20 or -1 (Unlimited)
  final int maxWorkspaces; // 2 or -1 (Unlimited)
  final int maxMembersPerWorkspace; // 5, 15, or -1 (Unlimited)
  final bool canRecoverTrash;
  final bool canUseWeightedRbac;

  const EntitlementCapabilities({
    required this.tier,
    required this.canUseCustomRecurrence,
    required this.maxSyncedDevices,
    required this.monthlyCloudAiLimit,
    required this.maxWorkspaces,
    required this.maxMembersPerWorkspace,
    required this.canRecoverTrash,
    required this.canUseWeightedRbac,
  });

  /// Factory resolving capabilities strictly according to the finalized matrix.
  factory EntitlementCapabilities.forTier(WaycordTier tier) {
    switch (tier) {
      case WaycordTier.free:
        return const EntitlementCapabilities(
          tier: WaycordTier.free,
          canUseCustomRecurrence: false,
          maxSyncedDevices: 2,
          monthlyCloudAiLimit: 20,
          maxWorkspaces: 2,
          maxMembersPerWorkspace: 5,
          canRecoverTrash: false,
          canUseWeightedRbac: false,
        );
      case WaycordTier.pro:
        return const EntitlementCapabilities(
          tier: WaycordTier.pro,
          canUseCustomRecurrence: true,
          maxSyncedDevices: -1,
          monthlyCloudAiLimit: -1,
          maxWorkspaces: -1,
          maxMembersPerWorkspace: 15,
          canRecoverTrash: true,
          canUseWeightedRbac: false,
        );
      case WaycordTier.team:
        return const EntitlementCapabilities(
          tier: WaycordTier.team,
          canUseCustomRecurrence: true,
          maxSyncedDevices: -1,
          monthlyCloudAiLimit: -1,
          maxWorkspaces: -1,
          maxMembersPerWorkspace: -1,
          canRecoverTrash: true,
          canUseWeightedRbac: true,
        );
    }
  }

  bool get isProOrAbove => tier == WaycordTier.pro || tier == WaycordTier.team;
  bool get isTeam => tier == WaycordTier.team;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EntitlementCapabilities &&
          runtimeType == other.runtimeType &&
          tier == other.tier &&
          canUseCustomRecurrence == other.canUseCustomRecurrence &&
          maxSyncedDevices == other.maxSyncedDevices &&
          monthlyCloudAiLimit == other.monthlyCloudAiLimit &&
          maxWorkspaces == other.maxWorkspaces &&
          maxMembersPerWorkspace == other.maxMembersPerWorkspace &&
          canRecoverTrash == other.canRecoverTrash &&
          canUseWeightedRbac == other.canUseWeightedRbac;

  @override
  int get hashCode =>
      tier.hashCode ^
      canUseCustomRecurrence.hashCode ^
      maxSyncedDevices.hashCode ^
      monthlyCloudAiLimit.hashCode ^
      maxWorkspaces.hashCode ^
      maxMembersPerWorkspace.hashCode ^
      canRecoverTrash.hashCode ^
      canUseWeightedRbac.hashCode;
}
