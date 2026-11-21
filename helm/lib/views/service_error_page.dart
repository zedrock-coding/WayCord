import 'package:flutter/material.dart';
import '../core/ui/rem.dart';
import '../theme/app_theme.dart';

class ServiceErrorPage extends StatefulWidget {
  final String? title;
  final String? message;
  final Object? error;
  final StackTrace? stackTrace;
  final VoidCallback? onRetry;
  final VoidCallback? onNavigateHome;

  const ServiceErrorPage({
    super.key,
    this.title,
    this.message,
    this.error,
    this.stackTrace,
    this.onRetry,
    this.onNavigateHome,
  });

  @override
  State<ServiceErrorPage> createState() => _ServiceErrorPageState();
}

class _ServiceErrorPageState extends State<ServiceErrorPage> {
  bool _showDetails = false;

  void _handleHome(BuildContext context) {
    if (widget.onNavigateHome != null) {
      widget.onNavigateHome!();
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
              constraints: const BoxConstraints(maxWidth: 540),
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
                        Icons.cloud_off_rounded,
                        size: 48,
                        color: AppTheme.priorityUrgent,
                      ),
                    ),
                    SizedBox(height: 1.25.rem(context)),
                    Text(
                      widget.title ?? 'Service Disruption',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppTheme.onSurface : null,
                      ),
                    ),
                    SizedBox(height: 0.75.rem(context)),
                    Text(
                      widget.message ??
                          'Waycord encountered an unexpected problem communicating with the service. Check your connection or retry.',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? AppTheme.onSurfaceVariant : null,
                        height: 1.5,
                      ),
                    ),
                    if (widget.error != null) ...[
                      SizedBox(height: 1.0.rem(context)),
                      GestureDetector(
                        onTap: () => setState(() => _showDetails = !_showDetails),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _showDetails ? 'Hide technical details' : 'Show technical details',
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: AppTheme.mint,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                            Icon(
                              _showDetails
                                  ? Icons.keyboard_arrow_up_rounded
                                  : Icons.keyboard_arrow_down_rounded,
                              size: 18,
                              color: AppTheme.mint,
                            ),
                          ],
                        ),
                      ),
                      if (_showDetails) ...[
                        SizedBox(height: 0.75.rem(context)),
                        Container(
                          width: double.infinity,
                          padding: context.remInsets.all(1.0),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.surfaceContainerLowest : Colors.black12,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isDark ? AppTheme.outlineVariant : Colors.black26,
                            ),
                          ),
                          child: SelectableText(
                            '${widget.error}\n\n${widget.stackTrace ?? ''}'.trim(),
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontFamily: 'monospace',
                              fontSize: 11,
                              color: isDark ? AppTheme.onSurfaceVariant : Colors.black87,
                            ),
                          ),
                        ),
                      ],
                    ],
                    SizedBox(height: 1.75.rem(context)),
                    Row(
                      children: [
                        if (widget.onRetry != null) ...[
                          Expanded(
                            child: OutlinedButton.icon(
                              key: const ValueKey('service_error_retry_btn'),
                              onPressed: widget.onRetry,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: isDark ? AppTheme.onSurface : null,
                                side: BorderSide(
                                  color: isDark ? AppTheme.outlineVariant : Colors.grey,
                                ),
                                padding: context.remInsets.symmetric(horizontal: 1.0, vertical: 0.8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              icon: const Icon(Icons.refresh_rounded, size: 18),
                              label: const Text('Retry'),
                            ),
                          ),
                          SizedBox(width: 0.75.rem(context)),
                        ],
                        Expanded(
                          child: FilledButton.icon(
                            key: const ValueKey('service_error_home_btn'),
                            onPressed: () => _handleHome(context),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppTheme.mint,
                              foregroundColor: AppTheme.onMint,
                              padding: context.remInsets.symmetric(horizontal: 1.0, vertical: 0.8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            icon: const Icon(Icons.home_rounded, size: 18),
                            label: const Text(
                              'Dashboard',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
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
