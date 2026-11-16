import { listTasksQuerySchema } from '@task-list/contracts';
import { describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError } from '../../errors';
import { makeRepo, makeRow, TASK_ID } from '../../test/fixtures';
import { createTaskService } from './task.service';

describe('taskService', () => {
  it('get lanza NotFoundError si la tarea no existe', async () => {
    const service = createTaskService(makeRepo());
    await expect(service.get(TASK_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('get serializa las fechas como ISO 8601', async () => {
    const service = createTaskService(makeRepo({ findById: async () => makeRow() }));
    expect((await service.get(TASK_ID)).createdAt).toBe('2026-11-16T12:00:00.000Z');
  });

  it('update devuelve la tarea si la versión coincide', async () => {
    const service = createTaskService(
      makeRepo({ update: async () => makeRow({ version: 2, status: 'done' }) }),
    );
    const task = await service.update(TASK_ID, { version: 1, status: 'done' });
    expect(task).toMatchObject({ version: 2, status: 'done' });
  });

  it('update lanza ConflictError con la versión actual si otra persona la modificó', async () => {
    const service = createTaskService(
      makeRepo({ update: async () => undefined, findById: async () => makeRow({ version: 3 }) }),
    );
    const error = await service
      .update(TASK_ID, { version: 1, title: 'x' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).details?.[0]?.message).toContain('3');
  });

  it('update lanza NotFoundError si la tarea no existe', async () => {
    const service = createTaskService(makeRepo());
    await expect(service.update(TASK_ID, { version: 1, title: 'x' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('list calcula totalPages', async () => {
    const service = createTaskService(
      makeRepo({ list: async () => ({ rows: [makeRow()], total: 45 }) }),
    );
    const result = await service.list(listTasksQuerySchema.parse({}));
    expect(result).toMatchObject({ total: 45, pageSize: 20, totalPages: 3 });
  });

  it('remove lanza NotFoundError si no existía', async () => {
    const service = createTaskService(makeRepo());
    await expect(service.remove(TASK_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
