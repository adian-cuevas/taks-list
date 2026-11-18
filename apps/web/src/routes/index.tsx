import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, ListTodo, Plus } from 'lucide-react';
import { TaskPriorityBadge } from '../components/tasks/task-priority-badge';
import { TaskStatusBadge } from '../components/tasks/task-status-badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useTasks } from '../hooks/tasks/use-tasks';
import { ApiError } from '../lib/api/client';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const summaryQuery = {
  page: 1,
  pageSize: 5,
  sortBy: 'createdAt',
  sortOrder: 'desc',
} as const;

const countQuery = {
  page: 1,
  pageSize: 1,
  sortBy: 'createdAt',
  sortOrder: 'desc',
} as const;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}

function HomePage() {
  const tasksQuery = useTasks(summaryQuery);
  const todoQuery = useTasks({ ...countQuery, status: 'todo' });
  const inProgressQuery = useTasks({
    ...countQuery,
    status: 'in_progress',
  });
  const doneQuery = useTasks({ ...countQuery, status: 'done' });

  const queries = [tasksQuery, todoQuery, inProgressQuery, doneQuery];

  if (
    tasksQuery.isPending ||
    todoQuery.isPending ||
    inProgressQuery.isPending ||
    doneQuery.isPending
  ) {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Panel general</h1>
        <p role="status" className="text-sm text-muted-foreground">
          Cargando resumen...
        </p>
      </section>
    );
  }

  if (tasksQuery.isError || todoQuery.isError || inProgressQuery.isError || doneQuery.isError) {
    const failedQuery = queries.find((query) => query.isError);

    const message =
      failedQuery?.error instanceof ApiError
        ? failedQuery.error.message
        : 'No fue posible cargar el resumen de tareas.';

    return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Panel general</h1>
        <Card>
          <CardContent className="space-y-4 pt-4">
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                void Promise.all(queries.map((query) => query.refetch()));
              }}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const stats = [
    {
      label: 'Total de tareas',
      value: tasksQuery.data.total,
      description: 'Tareas registradas',
      icon: ListTodo,
    },
    {
      label: 'Pendientes',
      value: todoQuery.data.total,
      description: 'Por comenzar',
      icon: Clock3,
    },
    {
      label: 'En progreso',
      value: inProgressQuery.data.total,
      description: 'En ejecución',
      icon: Clock3,
    },
    {
      label: 'Completadas',
      value: doneQuery.data.total,
      description: 'Finalizadas',
      icon: CheckCircle2,
    },
  ];

  const recentTasks = tasksQuery.data.items;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Panel general</h1>
          <p className="text-sm text-muted-foreground">
            Resumen de tu actividad y estado de tus tareas.
          </p>
        </div>

        <Button render={<Link to="/tasks/new" />} className="gap-2">
          <Plus />
          Nueva tarea
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardContent className="flex items-start justify-between gap-3 pt-5">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>

                <div className="rounded-lg bg-muted p-2">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Tareas recientes</CardTitle>
            <CardDescription>Tus últimas cinco tareas registradas.</CardDescription>
          </div>

          <Button render={<Link to="/tasks" />} variant="ghost" size="sm" className="gap-2">
            Ver todas
            <ArrowRight />
          </Button>
        </CardHeader>

        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <ListTodo className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Todavía no tienes tareas</p>
                <p className="text-sm text-muted-foreground">
                  Crea tu primera tarea para comenzar.
                </p>
              </div>
              <Button render={<Link to="/tasks/new" />} className="gap-2">
                <Plus />
                Crear tarea
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-2">
                    <Link
                      to="/tasks/$id"
                      params={{ id: task.id }}
                      className="font-medium transition-colors hover:text-primary"
                    >
                      {task.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {task.dueDate && (
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-4" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}

                    <Button
                      render={<Link to="/tasks/$id" params={{ id: task.id }} />}
                      variant="ghost"
                      size="icon"
                      aria-label={`Ver tarea ${task.title}`}
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
