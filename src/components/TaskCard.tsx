import type { Task } from '../types/task';
import { formatDate } from '../utils/taskHelpers';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div className={`task-card ${task.completed ? 'task-card--completed' : ''}`}>
      <div className="task-card__left">
        <input
          type="checkbox"
          className="task-card__checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'active' : 'completed'}`}
        />
        <div className="task-card__info">
          <span className="task-card__title">{task.title}</span>
          {task.dueDate && (
            <span className="task-card__due">Due: {formatDate(task.dueDate)}</span>
          )}
        </div>
      </div>
      <div className="task-card__right">
        <span className={`priority-badge priority-badge--${task.priority}`}>
          {task.priority}
        </span>
        <button
          className="task-card__delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
