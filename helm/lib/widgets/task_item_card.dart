import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../core/ui/rem.dart';
import '../models/unified_task.dart';
import '../theme/app_theme.dart';

class TaskItemCard extends StatefulWidget {
  final UnifiedTask task;
  final int index;
  final VoidCallback onTap;
  final VoidCallback onToggle;
  final Function(DismissDirection) onDismiss;

  const TaskItemCard({
    super.key,
    required this.task,
    required this.index,
    required this.onTap,
    required this.onToggle,
    required this.onDismiss,
  });

  @override
  State<TaskItemCard> createState() => _TaskItemCardState();
}

class _TaskItemCardState extends State<TaskItemCard> {
  bool _isHovered = false;

  Color _getPriorityColor(Priority p) {
    switch (p) {
      case Priority.high:
        return AppTheme.priorityUrgent;
      case Priority.medium:
        return AppTheme.priorityHigh;
      case Priority.low:
        return AppTheme.priorityLow;
    }
  }

  String _getPriorityLabel(Priority p) {
    switch (p) {
      case Priority.high:
        return 'HIGH';
      case Priority.medium:
        return 'MED';
      case Priority.low:
        return 'LOW';
    }
  }

  @override
  Widget build(BuildContext context) {
    final task = widget.task;
    final isDone = task.status == Status.done || task.isCompleted;
    final priorityColor = _getPriorityColor(task.priority);
    final priorityLabel = _getPriorityLabel(task.priority);

    final due = task.dueDate ?? task.dateTime;
    final dateStr = DateFormat('EEE, MMM d • HH:mm').format(due);

    // Subtasks calculation
    final totalSubtasks = task.subtasks.length;
    final completedSubtasks = task.subtasks.where((s) => s['is_completed'] == true).length;
    final hasSubtasks = totalSubtasks > 0;

    final shortId = task.id.length >= 4 ? task.id.substring(0, 4).toUpperCase() : task.id.toUpperCase();

    final cardContent = MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: _isHovered
              ? AppTheme.surfaceContainerHighColor(context)
              : AppTheme.surface(context),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: _isHovered ? AppTheme.mint : AppTheme.borderColor(context),
            width: 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Left Priority Stripe (4px)
              Container(
                width: 4,
                color: priorityColor,
              ),

              // 2. Card Body
              Expanded(
                child: InkWell(
                  onTap: widget.onTap,
                  splashColor: AppTheme.mint.withValues(alpha: 0.05),
                  highlightColor: AppTheme.mint.withValues(alpha: 0.02),
                  child: Padding(
                    padding: context.remInsets.symmetric(horizontal: 0.875, vertical: 0.75),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Checkbox
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.lightImpact();
                            widget.onToggle();
                          },
                          child: Container(
                            margin: context.remInsets.only(top: 0.125, right: 0.75),
                            width: context.rem(1.125),
                            height: context.rem(1.125),
                            decoration: BoxDecoration(
                              color: isDone ? AppTheme.mint : AppTheme.surfaceContainerColor(context),
                              borderRadius: BorderRadius.circular(3),
                              border: Border.all(
                                color: isDone ? AppTheme.mint : AppTheme.borderColor(context),
                                width: 1.5,
                              ),
                            ),
                            child: isDone
                                ? Icon(
                                    Icons.check,
                                    size: context.rem(0.8),
                                    color: AppTheme.onMint,
                                  )
                                : null,
                          ),
                        ),

                        // Title & Metadata
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Title & Badges Row
                              Wrap(
                                crossAxisAlignment: WrapCrossAlignment.center,
                                spacing: context.rem(0.375),
                                runSpacing: context.rem(0.25),
                                children: [
                                  Text(
                                    task.title,
                                    style: TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w500,
                                      color: isDone
                                          ? AppTheme.textMuted(context).withValues(alpha: 0.6)
                                          : AppTheme.text(context),
                                      decoration: isDone ? TextDecoration.lineThrough : null,
                                    ),
                                  ),

                                  // Priority Badge
                                  Container(
                                    padding: context.remInsets.symmetric(horizontal: 0.3125, vertical: 0.1),
                                    decoration: BoxDecoration(
                                      color: priorityColor.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(2),
                                      border: Border.all(
                                        color: priorityColor.withValues(alpha: 0.35),
                                        width: 1,
                                      ),
                                    ),
                                    child: Text(
                                      priorityLabel,
                                      style: AppTheme.monoStyle(
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w600,
                                        color: priorityColor,
                                      ),
                                    ),
                                  ),

                                  // Recurrence Tag
                                  if (task.isRecurring || task.recurrenceRule != null)
                                    Container(
                                      padding: context.remInsets.symmetric(horizontal: 0.3125, vertical: 0.1),
                                      decoration: BoxDecoration(
                                        color: AppTheme.surfaceContainerColor(context),
                                        borderRadius: BorderRadius.circular(2),
                                        border: Border.all(
                                          color: AppTheme.borderColor(context),
                                          width: 1,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            Icons.repeat_rounded,
                                            size: context.rem(0.7),
                                            color: AppTheme.mint,
                                          ),
                                          context.remGapW(0.2),
                                          Text(
                                            task.recurrenceRule?.frequency.toUpperCase() ?? 'DAILY',
                                            style: AppTheme.monoStyle(
                                              fontSize: 9.5,
                                              fontWeight: FontWeight.w500,
                                              color: AppTheme.mint,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),

                              context.remGapH(0.3125),

                              // Subtasks Progress (if any)
                              if (hasSubtasks) ...[
                                Padding(
                                  padding: context.remInsets.only(top: 0.125, bottom: 0.25),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(1),
                                          child: LinearProgressIndicator(
                                            value: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) : 0,
                                            backgroundColor: AppTheme.surfaceContainerColor(context),
                                            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.mint),
                                            minHeight: context.rem(0.25),
                                          ),
                                        ),
                                      ),
                                      context.remGapW(0.5),
                                      Text(
                                        '$completedSubtasks/$totalSubtasks subtasks',
                                        style: AppTheme.monoStyle(
                                          fontSize: 10.5,
                                          color: AppTheme.textMuted(context),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              // Metadata Row (Due date, workspace, ID)
                              Wrap(
                                crossAxisAlignment: WrapCrossAlignment.center,
                                spacing: context.rem(0.625),
                                runSpacing: context.rem(0.25),
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.schedule_rounded,
                                        size: context.rem(0.8),
                                        color: AppTheme.outline,
                                      ),
                                      context.remGapW(0.2),
                                      Text(
                                        dateStr,
                                        style: AppTheme.monoStyle(
                                          fontSize: 11,
                                          color: AppTheme.textMuted(context),
                                        ),
                                      ),
                                    ],
                                  ),

                                  if (task.communityId != null)
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: context.rem(0.375),
                                          height: context.rem(0.375),
                                          decoration: BoxDecoration(
                                            color: priorityColor,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        context.remGapW(0.25),
                                        Text(
                                          'Community',
                                          style: AppTheme.monoStyle(
                                            fontSize: 11,
                                            color: AppTheme.textMuted(context),
                                          ),
                                        ),
                                      ],
                                    ),

                                  Text(
                                    '#TASK-$shortId',
                                    style: AppTheme.monoStyle(
                                      fontSize: 10,
                                      color: AppTheme.outline.withValues(alpha: 0.6),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // Action Buttons (Visible on hover or mobile tap)
                        if (_isHovered) ...[
                          const SizedBox(width: 8),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, size: 16),
                                color: AppTheme.textMuted(context),
                                hoverColor: AppTheme.surfaceContainerColor(context),
                                padding: const EdgeInsets.all(4),
                                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                tooltip: 'Edit Task',
                                onPressed: widget.onTap,
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    // Dismissible wrapper for mobile gestures
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Opacity(
        opacity: isDone ? 0.6 : 1.0,
        child: Dismissible(
          key: ValueKey('task_dismiss_${task.id}'),
          background: Container(
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.only(left: 20),
            color: isDone ? Colors.orange.shade800 : AppTheme.mint,
            child: Icon(
              isDone ? Icons.undo_rounded : Icons.check_rounded,
              color: AppTheme.onMint,
            ),
          ),
          secondaryBackground: Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(right: 20),
            color: AppTheme.priorityUrgent,
            child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
          ),
          confirmDismiss: (direction) async {
            if (direction == DismissDirection.startToEnd) {
              HapticFeedback.mediumImpact();
              widget.onToggle();
              return false;
            }
            return true;
          },
          onDismissed: widget.onDismiss,
          child: cardContent,
        ),
      ),
    );
  }
}
