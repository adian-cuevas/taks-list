import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  type Task,
  type TaskPriority,
  type TaskStatus,
  updateTaskSchema,
} from '@task-list/contracts';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  Hash,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { TaskPriorityBadge } from '../../components/tasks/task-priority-badge';
import { TaskStatusBadge } from '../../components/tasks/task-status-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { taskKeys, useDeleteTask, useTask, useUpdateTask } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

type EditTaskValues = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'version'
>;

export const Route = createFileRoute('/tasks/$id')({
  component: TaskDetailPage,
});

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'long',
  }).format(new Date(`${value}T00:00:00`));
}

function TaskDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const taskQuery = useTask(id);
  const deleteTaskMutation = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (taskQuery.isPending) {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Detalle de tarea</h1>
        <p role="status" className="text-sm text-muted-foreground">
          Cargando tarea...
        </p>
      </section>
    );
  }

  if (taskQuery.isError) {
    const isNotFound = taskQuery.error instanceof ApiError && taskQuery.error.status === 404;

    const message = isNotFound
      ? 'La tarea que buscas no existe o ha sido eliminada.'
      : taskQuery.error instanceof ApiError
        ? taskQuery.error.message
        : 'No fue posible cargar la tarea.';

    return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Detalle de tarea</h1>

        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isNotFound && (
                <Button type="button" variant="outline" onClick={() => void taskQuery.refetch()}>
                  <RefreshCw />
                  Reintentar
                </Button>
              )}

              <Button render={<Link to="/tasks" />} variant="ghost">
                <ArrowLeft />
                Volver a mis tareas
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const task = taskQuery.data;

  async function handleDelete() {
    try {
      await deleteTaskMutation.mutateAsync(id);

      setIsDeleteDialogOpen(false);

      await navigate({
        to: '/tasks',
      });
    } catch {
      // El error se muestra mediante deleteTaskMutation.isError.
      setIsDeleteDialogOpen(false);
    }
  }

  if (isEditing) {
    return (
      <TaskEditForm
        key={`${task.id}-${task.version}`}
        task={task}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Button render={<Link to="/tasks" />} variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft />
            Volver a mis tareas
          </Button>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Detalle de tarea</h1>
            <p className="text-sm text-muted-foreground">
              Consulta y administra la información de esta tarea.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setIsEditing(true)}>
            <Pencil />
            Editar tarea
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteTaskMutation.isPending}
          >
            <Trash2 />
            Eliminar
          </Button>
        </div>
      </header>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteTaskMutation.isPending) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la tarea <strong>{task.title}</strong>. Esta acción es
              permanente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTaskMutation.isPending}>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? 'Eliminando...' : 'Sí, eliminar tarea'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {deleteTaskMutation.isError && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p role="alert" className="text-sm text-destructive">
              {deleteTaskMutation.error instanceof ApiError
                ? deleteTaskMutation.error.message
                : 'No fue posible eliminar la tarea.'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>

          <CardTitle className="text-xl">{task.title}</CardTitle>

          <CardDescription>
            {task.description || 'Esta tarea no tiene una descripción.'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm">Fecha límite</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {task.dueDate ? formatDate(task.dueDate) : 'Sin fecha límite'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm">Última actualización</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDateTime(task.updatedAt)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información adicional</CardTitle>
          <CardDescription>Datos de seguimiento y registro de la tarea.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">Fecha de creación</p>
              <p className="text-sm text-muted-foreground">{formatDateTime(task.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Hash className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">Identificador</p>
              <p className="break-all font-mono text-xs text-muted-foreground">{task.id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className="mt-0.5 size-4 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">Versión</p>
              <p className="text-sm text-muted-foreground">{task.version}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface TaskEditFormProps {
  task: Task;
  onCancel: () => void;
  onSaved: () => void;
}

function TaskEditForm({ task, onCancel, onSaved }: TaskEditFormProps) {
  const updateTaskMutation = useUpdateTask();
  const queryClient = useQueryClient();
  const [validationError, setValidationError] = useState<string | null>(null);

  const defaultValues: EditTaskValues = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    version: task.version,
  };

  const form = useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      const result = updateTaskSchema.safeParse(value);

      if (!result.success) {
        setValidationError(result.error.issues.map((issue) => issue.message).join(', '));
        return;
      }

      setValidationError(null);

      await updateTaskMutation.mutateAsync({
        id: task.id,
        input: result.data,
      });

      onSaved();
    },
  });

  const isConflict =
    updateTaskMutation.error instanceof ApiError && updateTaskMutation.error.status === 409;

  async function reloadTask() {
    await queryClient.invalidateQueries({
      queryKey: taskKeys.detail(task.id),
    });

    onCancel();
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <Button type="button" variant="ghost" size="sm" className="-ml-3" onClick={onCancel}>
          <ArrowLeft />
          Volver al detalle
        </Button>

        <h1 className="text-2xl font-semibold tracking-tight">Editar tarea</h1>
        <p className="text-sm text-muted-foreground">
          Modifica los campos que necesites y guarda los cambios.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Información de la tarea</CardTitle>
          <CardDescription>Los cambios se guardarán en el servidor.</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    Título
                  </label>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    required
                    maxLength={200}
                  />

                  <p className="text-xs text-muted-foreground">Máximo 200 caracteres.</p>
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    Descripción
                  </label>

                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                    onBlur={field.handleBlur}
                    maxLength={2000}
                    rows={4}
                  />

                  <p className="text-xs text-muted-foreground">Máximo 2000 caracteres.</p>
                </div>
              )}
            </form.Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="priority">
                {(field) => (
                  <div className="space-y-2">
                    <label htmlFor={field.name} className="text-sm font-medium">
                      Prioridad
                    </label>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as TaskPriority)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field name="status">
                {(field) => (
                  <div className="space-y-2">
                    <label htmlFor={field.name} className="text-sm font-medium">
                      Estado
                    </label>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as TaskStatus)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="todo">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En progreso</SelectItem>
                        <SelectItem value="done">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="dueDate">
              {(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    Fecha límite
                  </label>

                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                  />
                </div>
              )}
            </form.Field>

            {validationError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{validationError}</p>
              </div>
            )}

            {updateTaskMutation.isError && (
              <div
                role="alert"
                className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">
                    {isConflict
                      ? 'Esta tarea fue modificada por otro cliente. Debes cargar la versión más reciente antes de continuar.'
                      : updateTaskMutation.error instanceof ApiError
                        ? updateTaskMutation.error.message
                        : 'No fue posible actualizar la tarea.'}
                  </p>
                </div>

                {isConflict && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void reloadTask()}
                  >
                    <RefreshCw />
                    Recargar tarea
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={updateTaskMutation.isPending}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={updateTaskMutation.isPending}>
                <Save />
                {updateTaskMutation.isPending ? 'Guardando cambios...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
