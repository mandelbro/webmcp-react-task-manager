import type { Task } from '../types/task';

type AddTaskFn = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;

export function registerCreateTaskTool(addTask: AddTaskFn): void {
  if (!('modelContext' in navigator)) return;

  navigator.modelContext.registerTool({
    name: 'create_task',
    description:
      'Create a new task with a title, priority level, and optional due date',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The task title' },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level',
        },
        dueDate: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format (optional)',
        },
      },
      required: ['title', 'priority'],
    },
    async execute({ title, priority, dueDate }) {
      addTask({
        title: title as string,
        priority: priority as Task['priority'],
        dueDate: dueDate as string | undefined,
      });
      return {
        content: [
          {
            type: 'text',
            text: `Created task "${title as string}" with ${priority as string} priority`,
          },
        ],
      };
    },
  });
}
