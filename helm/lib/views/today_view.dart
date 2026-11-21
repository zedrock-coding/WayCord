import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../core/ui/rem.dart';
import '../models/unified_task.dart';
import '../providers/task_provider.dart';
import '../features/task/domain/controllers/today_view_controller.dart';
import '../theme/app_theme.dart';
import '../widgets/task_item_card.dart';

class TodayView extends StatefulWidget {
  final Function(UnifiedTask) onTaskTap;

  const TodayView({super.key, required this.onTaskTap});

  @override
  State<TodayView> createState() => _TodayViewState();
}

class _TodayViewState extends State<TodayView> {
  TodayViewController? _controller;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _controller ??= TodayViewController(
      taskProvider: context.read<TaskProvider>(),
    )..addListener(_onControllerUpdate);
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller?.removeListener(_onControllerUpdate);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = _controller;
    if (ctrl == null) return const SizedBox.shrink();

    final state = ctrl.computeState();
    final todayFormatted = DateFormat('EEEE, MMM d').format(DateTime.now());

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 896), // max-w-4xl
        child: ListView(
          padding: context.remInsets.only(top: 1.0, bottom: 7.5),
          children: [
            // 1. Header Information Bar
            Padding(
              padding: context.remInsets.symmetric(horizontal: 1.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        "TODAY'S FOCUS",
                        style: AppTheme.monoStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.mint,
                          letterSpacing: 1.0,
                        ),
                      ),
                      Padding(
                        padding: context.remInsets.symmetric(horizontal: 0.375),
                        child: Text('•', style: TextStyle(color: AppTheme.borderColor(context))),
                      ),
                      Text(
                        todayFormatted,
                        style: AppTheme.monoStyle(
                          fontSize: 11,
                          color: AppTheme.textMuted(context),
                        ),
                      ),
                    ],
                  ),
                  context.remGapH(0.25),
                  Text(
                    'Active Worklist',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.text(context),
                      letterSpacing: -0.5,
                    ),
                  ),
                  context.remGapH(0.125),
                  Row(
                    children: [
                      Text(
                        '${state.activeCount} active tasks',
                        style: TextStyle(fontSize: 12, color: AppTheme.textMuted(context)),
                      ),
                      if (state.urgentCount > 0) ...[
                        Padding(
                          padding: context.remInsets.symmetric(horizontal: 0.375),
                          child: Text('•', style: TextStyle(color: AppTheme.borderColor(context))),
                        ),
                        Text(
                          '${state.urgentCount} urgent',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.priorityUrgent,
                          ),
                        ),
                      ],
                    ],
                  ),

                  context.remGapH(0.75),

                  // Filter Chips Bar
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('All Active', TodayFilter.all, state.activeCount, state.filter),
                        context.remGapW(0.375),
                        _buildFilterChip('Recurring', TodayFilter.recurring, state.recurringCount, state.filter),
                        context.remGapW(0.375),
                        _buildFilterChip('High Priority', TodayFilter.highPriority, state.urgentCount, state.filter),
                        context.remGapW(0.375),
                        _buildFilterChip('Completed', TodayFilter.completed, state.completedCount, state.filter),
                      ],
                    ),
                  ),

                  context.remGapH(0.875),
                  Divider(color: AppTheme.borderColor(context), height: 1),
                ],
              ),
            ),

            context.remGapH(0.75),

            // 2. Active Tasks List
            if (state.filteredTasks.isEmpty) ...[
              Padding(
                padding: context.remInsets.symmetric(horizontal: 1.0, vertical: 2.0),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.task_alt_rounded, size: context.rem(2.25), color: AppTheme.mint),
                      context.remGapH(0.5),
                      Text(
                        state.filter == TodayFilter.all
                            ? 'All caught up for today!'
                            : 'No tasks matching this filter.',
                        style: TextStyle(color: AppTheme.textMuted(context), fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
            ] else ...[
              ...state.filteredTasks.asMap().entries.map((entry) {
                final task = entry.value;
                final index = entry.key;
                return TaskItemCard(
                  key: ValueKey('today_${task.id}'),
                  task: task,
                  index: index,
                  onTap: () => widget.onTaskTap(task),
                  onToggle: () => ctrl.toggleTaskStatus(task),
                  onDismiss: (_) => ctrl.deleteTask(task.id),
                );
              }),
            ],

            // 3. Completed Section
            if (state.completedCount > 0 && state.filter != TodayFilter.completed) ...[
              context.remGapH(1.25),
              Padding(
                padding: context.remInsets.symmetric(horizontal: 1.0),
                child: Column(
                  children: [
                    Divider(color: AppTheme.borderColor(context), height: 1),
                    context.remGapH(0.75),
                    InkWell(
                      onTap: ctrl.toggleCompletedCollapsed,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.check_circle_rounded, size: context.rem(1.0), color: AppTheme.mint),
                              context.remGapW(0.375),
                              Text(
                                'Completed Today (${state.completedCount} tasks)',
                                style: AppTheme.monoStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.textMuted(context),
                                ),
                              ),
                            ],
                          ),
                          Icon(
                            state.completedCollapsed
                                ? Icons.keyboard_arrow_down_rounded
                                : Icons.keyboard_arrow_up_rounded,
                            size: context.rem(1.125),
                            color: AppTheme.textMuted(context),
                          ),
                        ],
                      ),
                    ),
                    if (!state.completedCollapsed) ...[
                      context.remGapH(0.5),
                      ...context.read<TaskProvider>().completedTasksToday.asMap().entries.map((entry) {
                        final task = entry.value;
                        return TaskItemCard(
                          key: ValueKey('completed_${task.id}'),
                          task: task,
                          index: entry.key,
                          onTap: () => widget.onTaskTap(task),
                          onToggle: () => ctrl.toggleTaskStatus(task),
                          onDismiss: (_) => ctrl.deleteTask(task.id),
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, TodayFilter filter, int count, TodayFilter activeFilter) {
    final isSelected = activeFilter == filter;
    return InkWell(
      onTap: () => _controller?.setFilter(filter),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: context.remInsets.symmetric(horizontal: 0.625, vertical: 0.3125),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.surfaceContainerHighColor(context)
              : AppTheme.surfaceContainerColor(context),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isSelected ? AppTheme.mint.withValues(alpha: 0.5) : AppTheme.borderColor(context),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                color: isSelected ? AppTheme.mint : AppTheme.textMuted(context),
              ),
            ),
            context.remGapW(0.375),
            Container(
              padding: context.remInsets.symmetric(horizontal: 0.25, vertical: 0.0625),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.mint.withValues(alpha: 0.2) : AppTheme.borderColor(context),
                borderRadius: BorderRadius.circular(2),
              ),
              child: Text(
                '$count',
                style: AppTheme.monoStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? AppTheme.mint : AppTheme.textMuted(context),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
