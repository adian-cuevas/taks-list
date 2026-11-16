import type { Task } from '@task-list/contracts';
import type { TaskRow } from '@task-list/db';

/** Fila de BD -> representación pública (las fechas viajan como ISO 8601). */
export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
