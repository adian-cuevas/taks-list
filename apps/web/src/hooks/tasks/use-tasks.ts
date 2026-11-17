import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTask, ListTasksQuery, UpdateTask } from '@task-list/contracts';
import { createTask, deleteTask, getTask, getTasks, updateTask } from '../../services/tasks';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (query: ListTasksQuery) => [...taskKeys.lists(), query] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

const defaultTasksQuery: ListTasksQuery = {
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useTasks(query: ListTasksQuery = defaultTasksQuery) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => getTasks(query),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTask) => createTask(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTask }) => updateTask(id, input),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);

      return queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({
        queryKey: taskKeys.detail(id),
        exact: true,
      });

      return queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
    },
  });
}
