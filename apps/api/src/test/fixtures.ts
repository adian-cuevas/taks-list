import type { TaskRow } from '@task-list/db';
import { pino } from 'pino';
import type { TaskRepository } from '../modules/tasks/task.repository';

export const TASK_ID = '0198f3c2-7d4a-7b1e-8c3d-9a2b4c5d6e7f';
export const silentLogger = pino({ level: 'silent' });

export function makeRow(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: TASK_ID,
    title: 'Tarea',
    description: null,
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    version: 1,
    createdAt: new Date('2026-11-16T12:00:00.000Z'),
    updatedAt: new Date('2026-11-16T12:00:00.000Z'),
    ...overrides,
  };
}

/** Repositorio falso: por defecto "no existe nada"; cada test sobrescribe lo que necesita. */
export function makeRepo(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    list: async () => ({ rows: [], total: 0 }),
    findById: async () => undefined,
    create: async () => makeRow(),
    update: async () => undefined,
    remove: async () => false,
    ...overrides,
  };
}
