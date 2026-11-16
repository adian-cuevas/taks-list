import { OpenAPIHono } from '@hono/zod-openapi';
import type { ErrorResponse } from '@task-list/contracts';
import type { ZodType } from 'zod';
import type { AppEnv } from './types';

export function jsonContent<T extends ZodType>(schema: T, description: string) {
  return { description, content: { 'application/json': { schema } } };
}

/** Router con el formato de error de validación unificado (por defecto sería el ZodError crudo). */
export function createOpenApiRouter() {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        const body: ErrorResponse = {
          error: {
            code: 'validation_error',
            message: 'Los datos enviados no son válidos',
            details: result.error.issues.map((issue) => ({
              path: issue.path.map(String).join('.'),
              message: issue.message,
            })),
          },
        };
        return c.json(body, 400);
      }
    },
  });
}
