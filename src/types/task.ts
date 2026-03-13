export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO 8601
  completed: boolean;
  createdAt: string; // ISO 8601
}

export type TaskPriority = Task['priority'];

export type TaskStatus = 'all' | 'active' | 'completed';
