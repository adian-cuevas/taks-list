import * as z from 'zod';
import { paginatedSchema } from './common';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const TASK_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'dueDate',
  'priority',
  'title',
  'status',
] as const;

export const TASK_TITLE_MAX = 200;
export const TASK_DESCRIPTION_MAX = 2000;

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

const titleSchema = z.string().trim().min(1).max(TASK_TITLE_MAX);
const descriptionSchema = z.string().trim().max(TASK_DESCRIPTION_MAX);

/** Tarea tal como la devuelve la API. */
export const taskSchema = z.object({
  id: z.uuid(),
  title: titleSchema,
  description: descriptionSchema.nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.iso.date().nullable(),
  version: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/** Cuerpo de POST /tasks. Los valores por defecto se aplican al parsear. */
export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.nullable().default(null),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  dueDate: z.iso.date().nullable().default(null),
});

/**
 * Cuerpo de PATCH /tasks/:id.
 * Los campos son opcionales SIN default a propósito: en Zod 4 un
 * `.default()` dentro de `.optional()` se aplicaría al omitir el campo
 * y un PATCH pisaría datos existentes. `version` es la que el cliente vio.
 */
export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.iso.date().nullable().optional(),
    version: z.number().int().positive(),
  })
  .refine((value) => Object.keys(value).some((key) => key !== 'version'), {
    message: 'Debes enviar al menos un campo a modificar',
  });

/** Query string de GET /tasks (paginación, orden y filtros en servidor). */
export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(TASK_SORT_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const taskListResponseSchema = paginatedSchema(taskSchema);

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type Task = z.infer<typeof taskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;
