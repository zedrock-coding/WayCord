-- Migration: 20261117100000_enable_rls_tasks_and_subtasks.sql
-- Ensure Row Level Security is strictly enabled on public.tasks and public.subtasks.

-- 1. Enable RLS on both tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- 2. Policies for public.subtasks
-- Subtasks delegate authorization to their parent task in public.tasks (which is protected by its own RLS policies).

-- SELECT: Authenticated users can view subtasks if they have access to view the parent task.
DROP POLICY IF EXISTS subtasks_select ON public.subtasks;
CREATE POLICY subtasks_select ON public.subtasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
    )
  );

-- INSERT: Authenticated users can create subtasks if they own the parent task or belong to its community.
DROP POLICY IF EXISTS subtasks_insert ON public.subtasks;
CREATE POLICY subtasks_insert ON public.subtasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (
          t.user_id = auth.uid()
          OR (
            t.community_id IS NOT NULL
            AND (
              auth.uid()::text = ANY(t.assignees)
              OR internal.role_weight(t.community_id, auth.uid()) >= internal.role_weight(t.community_id, t.user_id)
              OR internal.is_member(t.community_id, auth.uid())
            )
          )
        )
    )
  );

-- UPDATE: Authenticated users can update subtasks (e.g. check off items) if they can update the parent task.
DROP POLICY IF EXISTS subtasks_update ON public.subtasks;
CREATE POLICY subtasks_update ON public.subtasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (
          t.user_id = auth.uid()
          OR (
            t.community_id IS NOT NULL
            AND (
              auth.uid()::text = ANY(t.assignees)
              OR internal.role_weight(t.community_id, auth.uid()) >= internal.role_weight(t.community_id, t.user_id)
              OR internal.is_member(t.community_id, auth.uid())
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (
          t.user_id = auth.uid()
          OR (
            t.community_id IS NOT NULL
            AND (
              auth.uid()::text = ANY(t.assignees)
              OR internal.role_weight(t.community_id, auth.uid()) >= internal.role_weight(t.community_id, t.user_id)
              OR internal.is_member(t.community_id, auth.uid())
            )
          )
        )
    )
  );

-- DELETE: Authenticated users can delete subtasks if they own the task, are assigned to it, or are community admins/owners.
DROP POLICY IF EXISTS subtasks_delete ON public.subtasks;
CREATE POLICY subtasks_delete ON public.subtasks
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = subtasks.task_id
        AND (
          t.user_id = auth.uid()
          OR (
            t.community_id IS NOT NULL
            AND (
              auth.uid()::text = ANY(t.assignees)
              OR internal.role_weight(t.community_id, auth.uid()) >= 2
            )
          )
        )
    )
  );
