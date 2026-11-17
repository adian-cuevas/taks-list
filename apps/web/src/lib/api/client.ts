import { errorResponseSchema } from '@task-list/contracts';
import * as z from 'zod';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: z.infer<typeof errorResponseSchema>['error']['code'];
  readonly details?: z.infer<typeof errorResponseSchema>['error']['details'];

  constructor(
    status: number,
    message: string,
    code?: ApiError['code'],
    details?: ApiError['details'],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      // La respuesta no contiene JSON válido.
    }

    const parsed = errorResponseSchema.safeParse(body);

    if (parsed.success) {
      throw new ApiError(
        response.status,
        parsed.data.error.message,
        parsed.data.error.code,
        parsed.data.error.details,
      );
    }

    throw new ApiError(response.status, `Error HTTP ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json();

  return schema.parse(body);
}
