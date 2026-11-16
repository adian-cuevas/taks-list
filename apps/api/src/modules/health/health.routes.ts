import { createRoute } from '@hono/zod-openapi';
import * as z from 'zod';
import { createOpenApiRouter, jsonContent } from '../../openapi';

const healthSchema = z.object({ status: z.enum(['ok', 'error']) });
const tags = ['Health'];

const liveness = createRoute({
  method: 'get',
  path: '/healthz',
  tags,
  summary: 'Liveness: el proceso responde',
  responses: { 200: jsonContent(healthSchema, 'Vivo') },
});

const readiness = createRoute({
  method: 'get',
  path: '/readyz',
  tags,
  summary: 'Readiness: el servicio puede atender tráfico (incluye la BD)',
  responses: {
    200: jsonContent(healthSchema, 'Listo'),
    503: jsonContent(healthSchema, 'No está listo'),
  },
});

export function createHealthRoutes(checkDatabase: () => Promise<void>) {
  return createOpenApiRouter()
    .openapi(liveness, (c) => c.json({ status: 'ok' as const }, 200))
    .openapi(readiness, async (c) => {
      try {
        await checkDatabase();
        return c.json({ status: 'ok' as const }, 200);
      } catch (err) {
        c.get('logger').error({ err }, 'Readiness falló');
        return c.json({ status: 'error' as const }, 503);
      }
    });
}
