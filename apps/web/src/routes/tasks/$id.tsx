import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  type Task,
  type TaskPriority,
  type TaskStatus,
  updateTaskSchema,
} from '@task-list/contracts';
import { useState } from 'react';
import { taskKeys, useTask, useUpdateTask } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

type EditTaskValues = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'version'
>;

export const Route = createFileRoute('/tasks/$id')({
  component: TaskDetailPage,
});

const statusLabels: Record<TaskStatus, string> = {
  todo: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Completada',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('es', {
    dateStyle: 'long',
  }).format(date);
}

function TaskDetailPage() {
  const { id } = Route.useParams();
  const taskQuery = useTask(id);
  const [isEditing, setIsEditing] = useState(false);

  if (taskQuery.isPending) {
    return (
      <section>
        <h1>Detalle de tarea</h1>
        <p role="status">Cargando tarea...</p>
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
      <section>
        <h1>Detalle de tarea</h1>

        <p role="alert">{message}</p>

        {!isNotFound && (
          <button type="button" onClick={() => taskQuery.refetch()}>
            Reintentar
          </button>
        )}

        <Link to="/tasks">Volver a mis tareas</Link>
      </section>
    );
  }

  const task = taskQuery.data;

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
    <section>
      <header>
        <h1>{task.title}</h1>
        <Link to="/tasks">Volver a mis tareas</Link>
      </header>

      <dl>
        <div>
          <dt>Descripción</dt>
          <dd>{task.description || 'Sin descripción'}</dd>
        </div>

        <div>
          <dt>Estado</dt>
          <dd>{statusLabels[task.status]}</dd>
        </div>

        <div>
          <dt>Prioridad</dt>
          <dd>{priorityLabels[task.priority]}</dd>
        </div>

        <div>
          <dt>Fecha límite</dt>
          <dd>{task.dueDate ? formatDate(task.dueDate) : 'Sin fecha límite'}</dd>
        </div>

        <div>
          <dt>Versión</dt>
          <dd>{task.version}</dd>
        </div>

        <div>
          <dt>Creada</dt>
          <dd>{formatDateTime(task.createdAt)}</dd>
        </div>

        <div>
          <dt>Última actualización</dt>
          <dd>{formatDateTime(task.updatedAt)}</dd>
        </div>

        <div>
          <dt>Identificador</dt>
          <dd>{task.id}</dd>
        </div>
      </dl>

      <button type="button" onClick={() => setIsEditing(true)}>
        Editar tarea
      </button>
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
    <section>
      <h1>Editar tarea</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="title">
          {(field) => (
            <div>
              <label htmlFor={field.name}>Título</label>

              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                required
                maxLength={200}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div>
              <label htmlFor={field.name}>Descripción</label>

              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(event) => field.handleChange(event.target.value || null)}
                onBlur={field.handleBlur}
                maxLength={2000}
                rows={4}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="priority">
          {(field) => (
            <div>
              <label htmlFor={field.name}>Prioridad</label>

              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value as TaskPriority)}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="dueDate">
          {(field) => (
            <div>
              <label htmlFor={field.name}>Fecha límite</label>

              <input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value ?? ''}
                onChange={(event) => field.handleChange(event.target.value || null)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="status">
          {(field) => (
            <div>
              <label htmlFor={field.name}>Estado</label>

              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value as TaskStatus)}
              >
                <option value="todo">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>
          )}
        </form.Field>

        {validationError && <p role="alert">{validationError}</p>}

        {updateTaskMutation.isError && (
          <div role="alert">
            <p>
              {isConflict
                ? 'Esta tarea fue modificada por otro cliente. Debes cargar la versión más reciente antes de continuar.'
                : updateTaskMutation.error instanceof ApiError
                  ? updateTaskMutation.error.message
                  : 'No fue posible actualizar la tarea.'}
            </p>

            {isConflict && (
              <button type="button" onClick={() => void reloadTask()}>
                Recargar tarea
              </button>
            )}
          </div>
        )}

        <button type="submit" disabled={updateTaskMutation.isPending}>
          {updateTaskMutation.isPending ? 'Guardando cambios...' : 'Guardar cambios'}
        </button>

        <button type="button" onClick={onCancel} disabled={updateTaskMutation.isPending}>
          Cancelar
        </button>
      </form>
    </section>
  );
}
