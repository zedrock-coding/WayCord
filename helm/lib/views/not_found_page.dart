import 'package:flutter/material.dart';
import '../core/ui/rem.dart';
import '../theme/app_theme.dart';

class NotFoundPage extends StatelessWidget {
  final String? routeName;
  final VoidCallback? onNavigateHome;

  const NotFoundPage({
    super.key,
    this.routeName,
    this.onNavigateHome,
  });

  void _handleHome(BuildContext context) {
    if (onNavigateHome != null) {
      onNavigateHome!();
      return;
    }
    Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.bgDark : theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: context.remInsets.all(1.5),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Container(
                padding: context.remInsets.all(2.0),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceContainerLow : theme.cardColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? AppTheme.outlineVariant : theme.dividerColor,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: context.remInsets.all(1.0),
                      decoration: BoxDecoration(
                        color: AppTheme.priorityUrgent.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.travel_explore_rounded,
                        size: 48,
                        color: AppTheme.priorityUrgent,
                      ),
                    ),
                    SizedBox(height: 1.25.rem(context)),
                    Text(
                      '404',
                      style: theme.textTheme.displayMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        letterSpacing: -1.0,
                        color: isDark ? AppTheme.onSurface : null,
                      ),
                    ),
                    SizedBox(height: 0.5.rem(context)),
                    Text(
                      'Page Not Found',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppTheme.onSurface : null,
                      ),
                    ),
                    SizedBox(height: 0.75.rem(context)),
                    Text(
                      'The route you requested does not exist, has been moved, or is temporarily unavailable.',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? AppTheme.onSurfaceVariant : null,
                        height: 1.5,
                      ),
                    ),
                    if (routeName != null && routeName!.trim().isNotEmpty) ...[
                      SizedBox(height: 1.0.rem(context)),
                      Container(
                        padding: context.remInsets.symmetric(horizontal: 0.8, vertical: 0.4),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.surfaceContainerHighest : Colors.black12,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          routeName!,
                          style: theme.textTheme.labelMedium?.copyWith(
                            fontFamily: 'monospace',
                            color: isDark ? AppTheme.mint : null,
                          ),
                        ),
                      ),
                    ],
                    SizedBox(height: 1.75.rem(context)),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        key: const ValueKey('not_found_return_home_btn'),
                        onPressed: () => _handleHome(context),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.mint,
                          foregroundColor: AppTheme.onMint,
                          padding: context.remInsets.symmetric(horizontal: 1.5, vertical: 0.85),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        icon: const Icon(Icons.home_rounded, size: 20),
                        label: const Text(
                          'Return to Dashboard',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
