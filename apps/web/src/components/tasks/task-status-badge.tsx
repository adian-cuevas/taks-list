import type { TaskStatus } from '@task-list/contracts';
import { Badge } from '@/components/ui/badge';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    variant: 'secondary' | 'outline' | 'default';
    className: string;
  }
> = {
  todo: {
    label: 'Pendiente',
    variant: 'secondary',
    className: 'text-muted-foreground',
  },
  in_progress: {
    label: 'En progreso',
    variant: 'outline',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  done: {
    label: 'Completada',
    variant: 'outline',
    className: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
  },
};

function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export { TaskStatusBadge };
