import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';
import '../../widgets/waycord_logo.dart';

/// Modal bottom sheet presented when a user attempts to use a feature
/// exceeding their subscription tier's capabilities.
class WaycordUpgradeSheet extends StatelessWidget {
  final String featureName;
  final String description;
  final VoidCallback? onUpgradeTapped;

  const WaycordUpgradeSheet({
    super.key,
    this.featureName = 'Waycord Pro Feature',
    this.description = 'This feature requires a Waycord Pro or Team subscription.',
    this.onUpgradeTapped,
  });

  static Future<void> show(
    BuildContext context, {
    String featureName = 'Waycord Pro Feature',
    String description = 'This feature requires a Waycord Pro or Team subscription.',
    VoidCallback? onUpgradeTapped,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => WaycordUpgradeSheet(
        featureName: featureName,
        description: description,
        onUpgradeTapped: onUpgradeTapped,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: AppTheme.surfaceVariant, width: 1),
        ),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 32,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.surfaceVariant,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Header with Waycord Pro badge
          Row(
            children: [
              const WaycordLogo(size: 32),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Unlock Waycord Pro',
                      style: GoogleFonts.geist(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.onSurface,
                      ),
                    ),
                    Text(
                      'Precision tools for focused operators',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.onSurfaceVariant.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.mint.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.mint.withValues(alpha: 0.5)),
                ),
                child: Text(
                  'PRO TIER',
                  style: AppTheme.monoStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.mint,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Target Locked Feature Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.bgDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.surfaceVariant),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppTheme.mint.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.lock_open_rounded, color: AppTheme.mint, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        featureName,
                        style: GoogleFonts.geist(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.onSurfaceVariant.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Included Pro Capabilities Checklist
          Text(
            'INCLUDED IN WAYCORD PRO',
            style: AppTheme.monoStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: AppTheme.mint,
            ),
          ),
          const SizedBox(height: 10),
          _buildCheckItem('Custom recurrence intervals & weekday scheduling grids'),
          _buildCheckItem('Unlimited cloud-synced devices & active sessions'),
          _buildCheckItem('Unlimited cloud Needle AI voice runs & milestone decomposition'),
          _buildCheckItem('Unlimited shared workspaces (up to 15 members per workspace)'),
          _buildCheckItem('30-day soft-delete trash recovery & audit restoration'),

          const SizedBox(height: 20),

          // Payment Providers Notice (PhonePe & Patreon)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerHigh,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.surfaceVariant),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: AppTheme.onSurfaceVariant, size: 16),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'PhonePe Payment Gateway (UPI) & Patreon memberships are connecting soon. To test this feature now, switch tier in Settings > Developer Options.',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppTheme.onSurfaceVariant.withValues(alpha: 0.9),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Action Button
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              if (onUpgradeTapped != null) {
                onUpgradeTapped!();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.mint,
              foregroundColor: AppTheme.bgDark,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              'Understood',
              style: GoogleFonts.geist(
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

  Widget _buildCheckItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_rounded, color: AppTheme.mint, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
