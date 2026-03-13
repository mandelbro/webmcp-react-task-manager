import type { Task, TaskStatus } from '../types/task';

export function createTask(input: Omit<Task, 'id' | 'createdAt' | 'completed'>): Task {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    completed: false,
  };
}

export function filterTasks(
  tasks: Task[],
  query: string,
  status: TaskStatus,
): Task[] {
  const lowerQuery = query.toLowerCase().trim();

  return tasks.filter((task) => {
    const matchesQuery =
      lowerQuery === '' || task.title.toLowerCase().includes(lowerQuery);

    const matchesStatus =
      status === 'all' ||
      (status === 'active' && !task.completed) ||
      (status === 'completed' && task.completed);

    return matchesQuery && matchesStatus;
  });
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
