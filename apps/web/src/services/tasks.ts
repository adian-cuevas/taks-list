import {
  type CreateTask,
  createTaskSchema,
  type ListTasksQuery,
  taskListResponseSchema,
  taskSchema,
  type UpdateTask,
  updateTaskSchema,
} from '@task-list/contracts';
import * as z from 'zod';
import { apiRequest } from '../lib/api/client';

export async function getTasks(query: ListTasksQuery) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  return apiRequest(`/api/tasks?${params.toString()}`, taskListResponseSchema);
}

export async function getTask(id: string) {
  return apiRequest(`/api/tasks/${encodeURIComponent(id)}`, taskSchema);
}

export async function createTask(input: CreateTask) {
  return apiRequest('/api/tasks', taskSchema, {
    method: 'POST',
    body: JSON.stringify(createTaskSchema.parse(input)),
  });
}

export async function updateTask(id: string, input: UpdateTask) {
  return apiRequest(`/api/tasks/${encodeURIComponent(id)}`, taskSchema, {
    method: 'PATCH',
    body: JSON.stringify(updateTaskSchema.parse(input)),
  });
}

export async function deleteTask(id: string) {
  return apiRequest(`/api/tasks/${encodeURIComponent(id)}`, z.undefined(), { method: 'DELETE' });
}
