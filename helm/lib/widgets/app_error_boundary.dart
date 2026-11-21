import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../core/ui/rem.dart';
import '../theme/app_theme.dart';

/// Global error builder replacing the default red/grey crash screens.
class AppErrorWidget extends StatelessWidget {
  final FlutterErrorDetails? details;
  final VoidCallback? onReset;

  const AppErrorWidget({
    super.key,
    this.details,
    this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: context.remInsets.all(1.0),
        child: Container(
          padding: context.remInsets.all(1.25),
          constraints: const BoxConstraints(maxWidth: 460),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceContainerLow : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark ? AppTheme.outlineVariant : Colors.black12,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: context.remInsets.all(0.5),
                    decoration: BoxDecoration(
                      color: AppTheme.priorityUrgent.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.warning_amber_rounded,
                      size: 24,
                      color: AppTheme.priorityUrgent,
                    ),
                  ),
                  SizedBox(width: 0.75.rem(context)),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Something went wrong',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppTheme.onSurface : null,
                          ),
                        ),
                        SizedBox(height: 0.2.rem(context)),
                        Text(
                          'A rendering error occurred in this view.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isDark ? AppTheme.onSurfaceVariant : Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (kDebugMode && details != null) ...[
                SizedBox(height: 0.75.rem(context)),
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxHeight: 120),
                  padding: context.remInsets.all(0.6),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceContainerLowest : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: SingleChildScrollView(
                    child: SelectableText(
                      details!.exceptionAsString(),
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: AppTheme.priorityUrgent,
                      ),
                    ),
                  ),
                ),
              ],
              SizedBox(height: 1.0.rem(context)),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton.tonal(
                  key: const ValueKey('error_widget_retry_btn'),
                  onPressed: onReset ?? () {
                    // Default safe pop or refresh attempt
                    if (Navigator.of(context).canPop()) {
                      Navigator.of(context).pop();
                    }
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.mint.withValues(alpha: 0.2),
                    foregroundColor: AppTheme.mint,
                    padding: context.remInsets.symmetric(horizontal: 1.0, vertical: 0.5),
                  ),
                  child: const Text('Dismiss'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
