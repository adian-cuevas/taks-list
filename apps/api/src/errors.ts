import type { ErrorResponse } from '@task-list/contracts';
import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from './types';

type ErrorCode = ErrorResponse['error']['code'];

/** Error de dominio con estado HTTP y código estable para los clientes. */
export class AppError extends Error {
  readonly status: 400 | 404 | 409;
  readonly code: ErrorCode;
  readonly details: ErrorResponse['error']['details'];

  constructor(
    status: 400 | 404 | 409,
    code: ErrorCode,
    message: string,
    details?: ErrorResponse['error']['details'],
  ) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toBody(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'not_found', `${resource} ${id} no existe`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, currentVersion: number) {
    super(409, 'conflict', message, [
      { path: 'version', message: `La versión actual es ${currentVersion}` },
    ]);
  }
}

export const handleError: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof AppError) {
    return c.json(err.toBody(), err.status);
  }
  // JSON mal formado: Hono lanza HTTPException 400 desde el validador
  if (err instanceof HTTPException && err.status === 400) {
    const body: ErrorResponse = { error: { code: 'validation_error', message: err.message } };
    return c.json(body, 400);
  }
  c.get('logger')?.error({ err }, 'Error no controlado');
  const body: ErrorResponse = {
    error: { code: 'internal_error', message: 'Error interno del servidor' },
  };
  return c.json(body, 500);
};

export const handleNotFound: NotFoundHandler<AppEnv> = (c) => {
  const body: ErrorResponse = {
    error: { code: 'not_found', message: `Ruta ${c.req.method} ${c.req.path} no encontrada` },
  };
  return c.json(body, 404);
};
