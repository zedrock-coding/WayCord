import 'package:flutter/material.dart';
import '../../../../models/unified_task.dart';
import '../../../../providers/task_provider.dart';

enum TodayFilter { all, recurring, highPriority, completed }

/// Pure state for the Today / Active Worklist view.
class TodayViewState {
  final TodayFilter filter;
  final bool completedCollapsed;
  final List<UnifiedTask> filteredTasks;
  final int activeCount;
  final int urgentCount;
  final int recurringCount;
  final int completedCount;

  const TodayViewState({
    this.filter = TodayFilter.all,
    this.completedCollapsed = false,
    this.filteredTasks = const [],
    this.activeCount = 0,
    this.urgentCount = 0,
    this.recurringCount = 0,
    this.completedCount = 0,
  });

  TodayViewState copyWith({
    TodayFilter? filter,
    bool? completedCollapsed,
    List<UnifiedTask>? filteredTasks,
    int? activeCount,
    int? urgentCount,
    int? recurringCount,
    int? completedCount,
  }) {
    return TodayViewState(
      filter: filter ?? this.filter,
      completedCollapsed: completedCollapsed ?? this.completedCollapsed,
      filteredTasks: filteredTasks ?? this.filteredTasks,
      activeCount: activeCount ?? this.activeCount,
      urgentCount: urgentCount ?? this.urgentCount,
      recurringCount: recurringCount ?? this.recurringCount,
      completedCount: completedCount ?? this.completedCount,
    );
  }
}

/// Controller isolating business logic and filtering for [TodayView].
class TodayViewController extends ChangeNotifier {
  final TaskProvider _taskProvider;
  TodayFilter _filter = TodayFilter.all;
  bool _completedCollapsed = false;

  TodayViewController({required TaskProvider taskProvider})
      : _taskProvider = taskProvider {
    _taskProvider.addListener(_onProviderUpdate);
  }

  void _onProviderUpdate() {
    notifyListeners();
  }

  TodayFilter get filter => _filter;
  bool get completedCollapsed => _completedCollapsed;

  void setFilter(TodayFilter newFilter) {
    if (_filter != newFilter) {
      _filter = newFilter;
      notifyListeners();
    }
  }

  void toggleCompletedCollapsed() {
    _completedCollapsed = !_completedCollapsed;
    notifyListeners();
  }

  TodayViewState computeState() {
    final activeTasks = _taskProvider.tasksForToday;
    final completedTasks = _taskProvider.completedTasksToday;
    final urgentCount = activeTasks.where((t) => t.priority == Priority.high).length;
    final recurringCount = _taskProvider.recurringTasks.length;

    List<UnifiedTask> filteredTasks = activeTasks;
    if (_filter == TodayFilter.recurring) {
      filteredTasks = _taskProvider.recurringTasks;
    } else if (_filter == TodayFilter.highPriority) {
      filteredTasks = activeTasks.where((t) => t.priority == Priority.high).toList();
    } else if (_filter == TodayFilter.completed) {
      filteredTasks = completedTasks.isNotEmpty ? completedTasks : _taskProvider.allCompletedTasks;
    }

    return TodayViewState(
      filter: _filter,
      completedCollapsed: _completedCollapsed,
      filteredTasks: filteredTasks,
      activeCount: activeTasks.length,
      urgentCount: urgentCount,
      recurringCount: recurringCount,
      completedCount: completedTasks.length,
    );
  }

  Future<void> toggleTaskStatus(UnifiedTask task) async {
    final newStatus = (task.status == Status.done || task.isCompleted) ? Status.toDo : Status.done;
    await _taskProvider.updateTaskStatus(task, newStatus);
  }

  Future<void> deleteTask(String taskId) async {
    await _taskProvider.deleteTask(taskId);
  }

  @override
  void dispose() {
    _taskProvider.removeListener(_onProviderUpdate);
    super.dispose();
  }
}
