import {
  TASK_DESCRIPTION_MAX,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX,
} from '@task-list/contracts';
import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const taskStatus = pgEnum('task_status', TASK_STATUSES);
export const taskPriority = pgEnum('task_priority', TASK_PRIORITIES);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().default(sql`uuidv7()`),
    title: text().notNull(),
    description: text(),
    status: taskStatus().notNull().default('todo'),
    priority: taskPriority().notNull().default('medium'),
    dueDate: date({ mode: 'string' }),
    version: integer().notNull().default(1),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('tasks_status_idx').on(t.status),
    index('tasks_created_at_idx').on(t.createdAt),
    // Defensa en profundidad: la BD también aplica los límites del contrato
    check(
      'tasks_title_length',
      sql`char_length(${t.title}) between 1 and ${sql.raw(String(TASK_TITLE_MAX))}`,
    ),
    check(
      'tasks_description_length',
      sql`${t.description} is null or char_length(${t.description}) <= ${sql.raw(String(TASK_DESCRIPTION_MAX))}`,
    ),
  ],
);

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
