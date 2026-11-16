import { createRoute } from '@hono/zod-openapi';
import {
  createTaskSchema,
  errorResponseSchema,
  idParamSchema,
  listTasksQuerySchema,
  taskListResponseSchema,
  taskSchema,
  updateTaskSchema,
} from '@task-list/contracts';
import { createOpenApiRouter, jsonContent } from '../../openapi';
import type { TaskService } from './task.service';

const tags = ['Tasks'];
const invalid = jsonContent(errorResponseSchema, 'Datos inválidos');
const notFound = jsonContent(errorResponseSchema, 'La tarea no existe');
const jsonBody = { content: { 'application/json': { schema: createTaskSchema } }, required: true };

const listTasks = createRoute({
  method: 'get',
  path: '/',
  tags,
  summary: 'Lista tareas con paginación, orden y filtros',
  request: { query: listTasksQuerySchema },
  responses: { 200: jsonContent(taskListResponseSchema, 'Página de tareas'), 400: invalid },
});

const getTask = createRoute({
  method: 'get',
  path: '/{id}',
  tags,
  summary: 'Obtiene una tarea',
  request: { params: idParamSchema },
  responses: { 200: jsonContent(taskSchema, 'La tarea'), 400: invalid, 404: notFound },
});

const createTask = createRoute({
  method: 'post',
  path: '/',
  tags,
  summary: 'Crea una tarea',
  request: { body: jsonBody },
  responses: { 201: jsonContent(taskSchema, 'Tarea creada'), 400: invalid },
});

const updateTask = createRoute({
  method: 'patch',
  path: '/{id}',
  tags,
  summary: 'Modifica una tarea (requiere la versión que el cliente vio)',
  request: {
    params: idParamSchema,
    body: {
      content: { 'application/json': { schema: updateTaskSchema } },
      required: true,
    },
  },
  responses: {
    200: jsonContent(taskSchema, 'Tarea actualizada'),
    400: invalid,
    404: notFound,
    409: jsonContent(errorResponseSchema, 'La versión no coincide: otra persona la modificó'),
  },
});

const deleteTask = createRoute({
  method: 'delete',
  path: '/{id}',
  tags,
  summary: 'Elimina una tarea',
  request: { params: idParamSchema },
  responses: { 204: { description: 'Tarea eliminada' }, 400: invalid, 404: notFound },
});

export function createTaskRoutes(service: TaskService) {
  return createOpenApiRouter()
    .openapi(listTasks, async (c) => c.json(await service.list(c.req.valid('query')), 200))
    .openapi(getTask, async (c) => c.json(await service.get(c.req.valid('param').id), 200))
    .openapi(createTask, async (c) => c.json(await service.create(c.req.valid('json')), 201))
    .openapi(updateTask, async (c) =>
      c.json(await service.update(c.req.valid('param').id, c.req.valid('json')), 200),
    )
    .openapi(deleteTask, async (c) => {
      await service.remove(c.req.valid('param').id);
      return c.body(null, 204);
    });
}
