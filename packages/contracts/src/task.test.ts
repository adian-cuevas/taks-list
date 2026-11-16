import { describe, expect, it } from 'vitest';
import { createTaskSchema, listTasksQuerySchema, taskSchema, updateTaskSchema } from './task';

describe('createTaskSchema', () => {
  it('aplica valores por defecto', () => {
    expect(createTaskSchema.parse({ title: 'Escribir tests' })).toEqual({
      title: 'Escribir tests',
      description: null,
      status: 'todo',
      priority: 'medium',
      dueDate: null,
    });
  });

  it('recorta espacios del título', () => {
    expect(createTaskSchema.parse({ title: '  hola  ' }).title).toBe('hola');
  });

  it('rechaza títulos vacíos o de solo espacios', () => {
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('rechaza títulos de más de 200 caracteres', () => {
    expect(createTaskSchema.safeParse({ title: 'a'.repeat(201) }).success).toBe(false);
  });

  it('rechaza fechas inválidas', () => {
    expect(createTaskSchema.safeParse({ title: 'x', dueDate: '2026-13-40' }).success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('exige version', () => {
    expect(updateTaskSchema.safeParse({ title: 'x' }).success).toBe(false);
  });

  it('exige al menos un campo además de version', () => {
    expect(updateTaskSchema.safeParse({ version: 1 }).success).toBe(false);
  });

  it('no inyecta valores por defecto en campos omitidos', () => {
    expect(updateTaskSchema.parse({ version: 2, status: 'done' })).toEqual({
      version: 2,
      status: 'done',
    });
  });

  it('permite limpiar la descripción con null', () => {
    expect(updateTaskSchema.parse({ version: 1, description: null }).description).toBeNull();
  });
});

describe('listTasksQuerySchema', () => {
  it('convierte strings de la query y aplica defaults', () => {
    expect(listTasksQuerySchema.parse({ page: '2' })).toEqual({
      page: 2,
      pageSize: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('rechaza pageSize mayor a 100', () => {
    expect(listTasksQuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
  });
});

describe('taskSchema', () => {
  it('acepta una tarea válida', () => {
    const task = {
      id: '0198f3c2-7d4a-7b1e-8c3d-9a2b4c5d6e7f',
      title: 'Tarea',
      description: null,
      status: 'todo',
      priority: 'low',
      dueDate: null,
      version: 1,
      createdAt: '2026-11-16T12:00:00.000Z',
      updatedAt: '2026-11-16T12:00:00.000Z',
    };
    expect(taskSchema.safeParse(task).success).toBe(true);
  });
});
