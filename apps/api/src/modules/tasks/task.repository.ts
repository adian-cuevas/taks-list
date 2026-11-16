import type { CreateTask, ListTasksQuery, UpdateTask } from '@task-list/contracts';
import {
  and,
  asc,
  count,
  type Database,
  desc,
  eq,
  ilike,
  sql,
  type TaskRow,
  tasks,
} from '@task-list/db';

export type TaskPatch = Omit<UpdateTask, 'version'>;

export interface TaskRepository {
  list(query: ListTasksQuery): Promise<{ rows: TaskRow[]; total: number }>;
  findById(id: string): Promise<TaskRow | undefined>;
  create(input: CreateTask): Promise<TaskRow>;
  /** Devuelve undefined si no existe o si la versión no coincide. */
  update(id: string, version: number, patch: TaskPatch): Promise<TaskRow | undefined>;
  remove(id: string): Promise<boolean>;
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export function createTaskRepository(db: Database): TaskRepository {
  return {
    async list(query) {
      const where = and(
        query.status ? eq(tasks.status, query.status) : undefined,
        query.priority ? eq(tasks.priority, query.priority) : undefined,
        query.search ? ilike(tasks.title, `%${escapeLike(query.search)}%`) : undefined,
      );

      // Lista blanca: nunca se interpola texto del cliente como nombre de columna
      const sortColumns = {
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        title: tasks.title,
        status: tasks.status,
      } satisfies Record<ListTasksQuery['sortBy'], unknown>;
      const direction = query.sortOrder === 'asc' ? asc : desc;

      const [rows, totals] = await Promise.all([
        db
          .select()
          .from(tasks)
          .where(where)
          // el id (uuidv7) desempata para que la paginación sea estable
          .orderBy(direction(sortColumns[query.sortBy]), desc(tasks.id))
          .limit(query.pageSize)
          .offset((query.page - 1) * query.pageSize),
        db.select({ total: count() }).from(tasks).where(where),
      ]);

      return { rows, total: totals[0]?.total ?? 0 };
    },

    async findById(id) {
      const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
      return row;
    },

    async create(input) {
      const [row] = await db.insert(tasks).values(input).returning();
      if (!row) throw new Error('INSERT no devolvió la fila creada');
      return row;
    },

    async update(id, version, patch) {
      // Concurrencia optimista: solo actualiza si la versión sigue siendo la que el cliente vio
      const [row] = await db
        .update(tasks)
        .set({ ...patch, version: sql`${tasks.version} + 1` })
        .where(and(eq(tasks.id, id), eq(tasks.version, version)))
        .returning();
      return row;
    },

    async remove(id) {
      const rows = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
      return rows.length > 0;
    },
  };
}
