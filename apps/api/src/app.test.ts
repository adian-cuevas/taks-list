import type { ErrorResponse } from '@task-list/contracts';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { createTaskService } from './modules/tasks/task.service';
import { makeRepo, makeRow, silentLogger, TASK_ID } from './test/fixtures';

function appWith(repo = makeRepo(), checkDatabase: () => Promise<void> = async () => {}) {
  return createApp({
    logger: silentLogger,
    taskService: createTaskService(repo),
    checkDatabase,
    corsOrigins: ['http://localhost:5173'],
  });
}

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

const errorOf = async (res: Response) => ((await res.json()) as ErrorResponse).error;

describe('health', () => {
  it('GET /healthz responde ok', async () => {
    const res = await appWith().request('/healthz');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('GET /readyz responde 503 si la base de datos falla', async () => {
    const res = await appWith(makeRepo(), async () => {
      throw new Error('down');
    }).request('/readyz');
    expect(res.status).toBe(503);
  });
});

describe('contrato de errores', () => {
  it('400 validation_error con detalles para un id que no es uuid', async () => {
    const res = await appWith().request('/api/tasks/no-es-uuid');
    expect(res.status).toBe(400);
    const error = await errorOf(res);
    expect(error.code).toBe('validation_error');
    expect(error.details?.length).toBeGreaterThan(0);
  });

  it('400 si el cuerpo incumple el contrato', async () => {
    const res = await appWith().request('/api/tasks', send('POST', { title: '' }));
    expect(res.status).toBe(400);
    expect((await errorOf(res)).code).toBe('validation_error');
  });

  it('400 si no hay cuerpo', async () => {
    const res = await appWith().request('/api/tasks', { method: 'POST' });
    expect(res.status).toBe(400);
  });

  it('404 not_found si la tarea no existe', async () => {
    const res = await appWith().request(`/api/tasks/${TASK_ID}`);
    expect(res.status).toBe(404);
    expect((await errorOf(res)).code).toBe('not_found');
  });

  it('404 not_found para una ruta inexistente', async () => {
    const res = await appWith().request('/nada');
    expect(res.status).toBe(404);
    expect((await errorOf(res)).code).toBe('not_found');
  });

  it('409 conflict si la versión no coincide', async () => {
    const repo = makeRepo({
      update: async () => undefined,
      findById: async () => makeRow({ version: 3 }),
    });
    const res = await appWith(repo).request(
      `/api/tasks/${TASK_ID}`,
      send('PATCH', { version: 1, status: 'done' }),
    );
    expect(res.status).toBe(409);
    expect((await errorOf(res)).code).toBe('conflict');
  });
});

describe('tareas', () => {
  it('POST crea una tarea y responde 201', async () => {
    const res = await appWith().request('/api/tasks', send('POST', { title: 'Nueva' }));
    expect(res.status).toBe(201);
    expect(((await res.json()) as { id: string }).id).toBe(TASK_ID);
  });

  it('cada respuesta incluye x-request-id', async () => {
    const res = await appWith().request('/healthz');
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});
