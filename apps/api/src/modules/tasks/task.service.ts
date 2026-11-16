import type {
  CreateTask,
  ListTasksQuery,
  Task,
  TaskListResponse,
  UpdateTask,
} from '@task-list/contracts';
import { ConflictError, NotFoundError } from '../../errors';
import { toTask } from './task.mapper';
import type { TaskRepository } from './task.repository';

export function createTaskService(repo: TaskRepository) {
  return {
    async list(query: ListTasksQuery): Promise<TaskListResponse> {
      const { rows, total } = await repo.list(query);
      return {
        items: rows.map(toTask),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      };
    },

    async get(id: string): Promise<Task> {
      const row = await repo.findById(id);
      if (!row) throw new NotFoundError('Task', id);
      return toTask(row);
    },

    async create(input: CreateTask): Promise<Task> {
      return toTask(await repo.create(input));
    },

    async update(id: string, input: UpdateTask): Promise<Task> {
      const { version, ...patch } = input;
      const row = await repo.update(id, version, patch);
      if (row) return toTask(row);

      // No se actualizó nada: ¿no existe, o alguien la modificó antes?
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError('Task', id);
      throw new ConflictError('La tarea fue modificada por otra persona', existing.version);
    },

    async remove(id: string): Promise<void> {
      const removed = await repo.remove(id);
      if (!removed) throw new NotFoundError('Task', id);
    },
  };
}

export type TaskService = ReturnType<typeof createTaskService>;
