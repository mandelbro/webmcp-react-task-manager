import { useState, useCallback } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { createTask, filterTasks } from '../utils/taskHelpers';

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0]!;
}

function getNextWeek(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0]!;
}

const SEED_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review WebMCP spec',
    priority: 'high',
    dueDate: getTomorrow(),
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Write unit tests',
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Update README',
    priority: 'low',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Set up CI pipeline',
    priority: 'medium',
    dueDate: getNextWeek(),
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export interface TaskStore {
  tasks: Task[];
  addTask: (input: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  searchTasks: (query: string, status: TaskStatus) => Task[];
}

export function useTaskStore(): TaskStore {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);

  const addTask = useCallback(
    (input: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
      const task = createTask(input);
      setTasks((prev) => [task, ...prev]);
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const searchTasks = useCallback(
    (query: string, status: TaskStatus): Task[] => {
      return filterTasks(tasks, query, status);
    },
    [tasks],
  );

  return { tasks, addTask, deleteTask, toggleTask, searchTasks };
}
