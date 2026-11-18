import type { TaskPriority } from '@task-list/contracts';
import { Badge } from '@/components/ui/badge';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    variant: 'secondary' | 'outline' | 'destructive';
    className: string;
  }
> = {
  low: {
    label: 'Baja',
    variant: 'secondary',
    className: 'text-muted-foreground',
  },
  medium: {
    label: 'Media',
    variant: 'outline',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  high: {
    label: 'Alta',
    variant: 'destructive',
    className: '',
  },
};

function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export { TaskPriorityBadge };
