import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../models/unified_task.dart';
import '../../../../providers/task_provider.dart';
import '../../../../services/ai_service.dart';
import '../../../../services/supabase_service.dart';

/// State representation for the Task Detail view.
class TaskDetailState {
  final bool isReadOnly;
  final bool isLoadingPerms;
  final bool isGeneratingSubtasks;
  final String? errorMessage;
  final String? successMessage;

  const TaskDetailState({
    this.isReadOnly = false,
    this.isLoadingPerms = true,
    this.isGeneratingSubtasks = false,
    this.errorMessage,
    this.successMessage,
  });

  TaskDetailState copyWith({
    bool? isReadOnly,
    bool? isLoadingPerms,
    bool? isGeneratingSubtasks,
    String? errorMessage,
    String? successMessage,
    bool clearMessages = false,
  }) {
    return TaskDetailState(
      isReadOnly: isReadOnly ?? this.isReadOnly,
      isLoadingPerms: isLoadingPerms ?? this.isLoadingPerms,
      isGeneratingSubtasks: isGeneratingSubtasks ?? this.isGeneratingSubtasks,
      errorMessage: clearMessages ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearMessages ? null : (successMessage ?? this.successMessage),
    );
  }
}

/// Controller responsible for handling business actions and permissions
/// for a specific [UnifiedTask] separate from presentation widgets.
class TaskDetailController extends ChangeNotifier {
  final UnifiedTask task;
  final TaskProvider _taskProvider;
  final AiService _aiService;
  final SupabaseService _supabaseService;

  TaskDetailState _state = const TaskDetailState();
  TaskDetailState get state => _state;

  TaskDetailController({
    required this.task,
    required TaskProvider taskProvider,
    required AiService aiService,
    SupabaseService? supabaseService,
  })  : _taskProvider = taskProvider,
        _aiService = aiService,
        _supabaseService = supabaseService ?? SupabaseService() {
    checkPermissions();
  }

  void _setState(TaskDetailState newState) {
    _state = newState;
    notifyListeners();
  }

  /// Evaluates RBAC rules to determine if the active user has edit rights.
  Future<void> checkPermissions() async {
    if (task.communityId == null) {
      _setState(_state.copyWith(isLoadingPerms: false, isReadOnly: false));
      return;
    }

    try {
      final members = await _supabaseService.getCommunityMembers(task.communityId!);
      final myId = Supabase.instance.client.auth.currentUser?.id;
      final creatorId = task.userId;

      if (myId != null && creatorId == myId) {
        _setState(_state.copyWith(isReadOnly: false, isLoadingPerms: false));
        return;
      }

      final me = members.firstWhere((m) => m['user_id'] == myId, orElse: () => {});
      final creator = members.firstWhere((m) => m['user_id'] == creatorId, orElse: () => {});

      int getWeight(String? r) {
        if (r == 'owner') return 3;
        if (r == 'admin') return 2;
        return 1;
      }

      final isMember = me.isNotEmpty;
      final myWeight = isMember ? getWeight(me['role']?.toString()) : 0;
      final creatorWeight = creator.isEmpty ? 3 : getWeight(creator['role']?.toString());

      _setState(_state.copyWith(
        isReadOnly: !isMember || myWeight < creatorWeight,
        isLoadingPerms: false,
      ));
    } catch (e) {
      debugPrint('RBAC check error: $e');
      _setState(_state.copyWith(isReadOnly: true, isLoadingPerms: false));
    }
  }

  /// Calls AI Edge function to auto-generate subtasks from task details.
  Future<bool> generateSubtasks() async {
    if (_state.isGeneratingSubtasks || _state.isReadOnly) return false;

    _setState(_state.copyWith(isGeneratingSubtasks: true, clearMessages: true));
    try {
      final newSubtasks = await _aiService.generateSubtasks(
        title: task.title,
        description: task.description,
      );

      if (newSubtasks.isNotEmpty) {
        final currentSubtasks = List<Map<String, dynamic>>.from(task.subtasks);
        for (final st in newSubtasks) {
          currentSubtasks.add({'title': st, 'is_completed': false});
        }

        await _taskProvider.updateTask(
          id: task.id,
          title: task.title,
          description: task.description,
          subtasks: currentSubtasks,
          categoryIds: task.categoryIds,
          assignees: task.assignees,
          priority: task.priority,
          status: task.status,
        );

        _setState(_state.copyWith(
          isGeneratingSubtasks: false,
          successMessage: 'AI Subtasks Generated!',
        ));
        return true;
      } else {
        _setState(_state.copyWith(
          isGeneratingSubtasks: false,
          errorMessage: 'Could not generate subtasks from this description.',
        ));
        return false;
      }
    } catch (e) {
      _setState(_state.copyWith(
        isGeneratingSubtasks: false,
        errorMessage: 'Failed to generate subtasks: $e',
      ));
      return false;
    }
  }

  /// Saves task field updates back to [TaskProvider].
  Future<void> saveTask({
    required String title,
    required String description,
    required Priority priority,
    required Status status,
    required List<Map<String, dynamic>> subtasks,
    required List<String> categoryIds,
    required List<String> assignees,
    DateTime? dueAt,
  }) async {
    await _taskProvider.updateTask(
      id: task.id,
      title: title,
      description: description,
      priority: priority,
      status: status,
      subtasks: subtasks,
      categoryIds: categoryIds,
      assignees: assignees,
      dueAt: dueAt,
    );
  }

  /// Deletes task via [TaskProvider].
  Future<void> deleteTask() async {
    await _taskProvider.deleteTask(task.id);
  }
}
