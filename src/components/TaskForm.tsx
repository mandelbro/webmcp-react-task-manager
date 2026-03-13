import { useState } from 'react';
import type { TaskPriority } from '../types/task';

interface TaskFormProps {
  onAdd: (input: { title: string; priority: TaskPriority; dueDate?: string }) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAdd({
      title: trimmedTitle,
      priority,
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setPriority('medium');
    setDueDate('');
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <input
          type="text"
          className="task-form__input"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="task-form__select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          className="task-form__date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit" className="task-form__submit">
          Add Task
        </button>
      </div>
    </form>
  );
}
