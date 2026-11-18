import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { createTaskSchema, type TaskPriority, type TaskStatus } from '@task-list/contracts';
import { ArrowLeft, CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';
import * as z from 'zod';
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
import { useCreateTask } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

type NewTaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

export const Route = createFileRoute('/tasks/new')({
  component: NewTaskPage,
});

function NewTaskPage() {
  const navigate = useNavigate();
  const createTaskMutation = useCreateTask();
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: NewTaskFormValues = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        const input = createTaskSchema.parse({
          ...value,
          description: value.description || null,
          dueDate: value.dueDate || null,
        });

        const task = await createTaskMutation.mutateAsync(input);

        await navigate({
          to: '/tasks/$id',
          params: { id: task.id },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFormError(error.issues[0]?.message ?? 'Revisa los datos del formulario.');
        } else if (error instanceof ApiError) {
          setFormError(error.message);
        } else {
          setFormError('No fue posible crear la tarea.');
        }
      }
    },
  });
  const validationError = formError;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <Button render={<Link to="/tasks" />} variant="ghost" size="sm" className="-ml-3 gap-2">
        <ArrowLeft />
        Volver a tareas
      </Button>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva tarea</h1>
        <p className="text-sm text-muted-foreground">
          Completa los datos para registrar una nueva tarea.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Información de la tarea</CardTitle>
          <CardDescription>
            Los campos marcados como obligatorios deben completarse.
          </CardDescription>
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
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Ej. Preparar documentación"
                    aria-invalid={!field.state.meta.isValid}
                    required
                  />
                  {!field.state.meta.isValid && (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(', ')}</p>
                  )}
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Describe los detalles de la tarea..."
                    rows={4}
                  />
                </div>
              )}
            </form.Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="status">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as TaskStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un estado" />
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

              <form.Field name="priority">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prioridad</label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as TaskPriority)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una prioridad" />
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
            </div>

            <form.Field name="dueDate">
              {(field) => (
                <div className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    Fecha límite
                  </label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            {validationError && (
              <p role="alert" className="text-sm text-destructive">
                {validationError}
              </p>
            )}

            <div className="flex flex-col-reverse justify-end gap-2 border-t pt-5 sm:flex-row">
              <Button type="button" variant="outline" render={<Link to="/tasks" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                <Plus />
                {createTaskMutation.isPending ? 'Creando...' : 'Crear tarea'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
