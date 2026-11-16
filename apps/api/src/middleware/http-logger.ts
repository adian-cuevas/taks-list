import type { MiddlewareHandler } from 'hono';
import type { Logger } from 'pino';
import type { AppEnv } from '../types';

const QUIET_PATHS = new Set(['/healthz', '/readyz']);

function levelFor(status: number, path: string): 'debug' | 'info' | 'warn' | 'error' {
  if (QUIET_PATHS.has(path)) return 'debug';
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

/** Un logger hijo por petición (con requestId) y una línea de log al terminar. */
export function httpLogger(base: Logger): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const logger = base.child({ requestId: c.get('requestId') });
    c.set('logger', logger);
    const start = performance.now();
    await next();
    const status = c.res.status;
    logger[levelFor(status, c.req.path)](
      {
        method: c.req.method,
        path: c.req.path,
        status,
        durationMs: Math.round(performance.now() - start),
      },
      'request',
    );
  };
}
