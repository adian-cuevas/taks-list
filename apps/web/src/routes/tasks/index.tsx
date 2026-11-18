import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, CalendarDays, Plus } from 'lucide-react';
import { TaskPriorityBadge } from '../../components/tasks/task-priority-badge';
import { TaskStatusBadge } from '../../components/tasks/task-status-badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useTasks } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
});

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}

function TasksPage() {
  const tasksQuery = useTasks();

  if (tasksQuery.isPending) {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Mis tareas</h1>
        <p role="status" className="text-sm text-muted-foreground">
          Cargando tareas...
        </p>
      </section>
    );
  }

  if (tasksQuery.isError) {
    const message =
      tasksQuery.error instanceof ApiError
        ? tasksQuery.error.message
        : 'No fue posible cargar las tareas.';

    return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Mis tareas</h1>

        <Card>
          <CardContent className="space-y-4 pt-4">
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>

            <Button type="button" variant="outline" onClick={() => tasksQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const { items, total, page, totalPages } = tasksQuery.data;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Mis tareas</h1>

          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'tarea registrada' : 'tareas registradas'}
          </p>
        </div>

        <Button render={<Link to="/tasks/new" />} className="gap-2">
          <Plus />
          Crear tarea
        </Button>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <Plus className="size-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="font-medium">Todavía no tienes tareas</h2>

              <p className="text-sm text-muted-foreground">
                Crea tu primera tarea para comenzar a organizarte.
              </p>
            </div>

            <Button render={<Link to="/tasks/new" />} className="mt-2 gap-2">
              <Plus />
              Crear primera tarea
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((task) => (
            <Card key={task.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="min-w-0">
                    <Link
                      to="/tasks/$id"
                      params={{ id: task.id }}
                      className="transition-colors hover:text-primary"
                    >
                      {task.title}
                    </Link>
                  </CardTitle>

                  <Button
                    render={<Link to="/tasks/$id" params={{ id: task.id }} />}
                    variant="ghost"
                    size="icon"
                    aria-label={`Ver tarea ${task.title}`}
                  >
                    <ArrowRight />
                  </Button>
                </div>

                <CardDescription className="line-clamp-2 min-h-10">
                  {task.description || 'Sin descripción'}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </CardContent>

              {task.dueDate && (
                <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-4" />
                  <span>Fecha límite: {formatDate(task.dueDate)}</span>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {total > 0 && (
        <footer className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages}
          </span>

          <span>
            {items.length} de {total} tareas
          </span>
        </footer>
      )}
    </section>
  );
}
