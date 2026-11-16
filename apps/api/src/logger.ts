import { pino } from 'pino';
import type { Env } from './env';

export function createLogger(level: Env['LOG_LEVEL']) {
  return pino({ level, name: 'api' });
}
