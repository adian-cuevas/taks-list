import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { createTaskSchema } from '@task-list/contracts';
import * as z from 'zod';
import { useCreateTask } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

type CreateTaskInput = z.input<typeof createTaskSchema>;

export const Route = createFileRoute('/tasks/new')({
  component: NewTaskPage,
});

function NewTaskPage() {
  const navigate = useNavigate();
  const createTaskMutation = useCreateTask();

  const defaultValues: CreateTaskInput = {
    title: '',
    description: null,
    status: 'todo',
    priority: 'medium',
    dueDate: null,
  };

  const form = useForm({
    defaultValues,

    validators: {
      onSubmit: createTaskSchema,
    },

    onSubmit: async ({ value }) => {
      const input = createTaskSchema.parse(value);
      const task = await createTaskMutation.mutateAsync(input);

      await navigate({
        to: '/tasks/$id',
        params: { id: task.id },
      });
    },
  });

  return (
    <section>
      <h1>Nueva tarea</h1>

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
              {field.state.meta.errors.length > 0 && (
                <p role="alert">{field.state.meta.errors.join(', ')}</p>
              )}
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
              {field.state.meta.errors.length > 0 && (
                <p role="alert">{field.state.meta.errors.join(', ')}</p>
              )}
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
                value={field.state.value ?? 'medium'}
                onChange={(event) =>
                  field.handleChange(event.target.value as NonNullable<CreateTaskInput['priority']>)
                }
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
                value={field.state.value ?? 'todo'}
                onChange={(event) =>
                  field.handleChange(event.target.value as NonNullable<CreateTaskInput['status']>)
                }
              >
                <option value="todo">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>
          )}
        </form.Field>

        {createTaskMutation.isError && (
          <p role="alert">
            {createTaskMutation.error instanceof ApiError
              ? createTaskMutation.error.message
              : 'No fue posible crear la tarea.'}
          </p>
        )}

        <button type="submit" disabled={createTaskMutation.isPending}>
          {createTaskMutation.isPending ? 'Guardando...' : 'Crear tarea'}
        </button>

        <Link to="/tasks">Cancelar</Link>
      </form>
    </section>
  );
}
