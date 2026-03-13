import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';
import type { Task } from '../types/task';

interface TaskCreatorWithHookProps {
  onTaskCreated: (
    task: Omit<Task, 'id' | 'createdAt' | 'completed'>,
  ) => void;
}

export function TaskCreatorWithHook({
  onTaskCreated,
}: TaskCreatorWithHookProps) {
  const tool = useWebMCP({
    name: 'create_task_hook',
    description: 'Create a new task using the React hook pattern',
    inputSchema: {
      title: z.string().describe('The task title'),
      priority: z
        .enum(['low', 'medium', 'high'])
        .describe('Priority level'),
      dueDate: z
        .string()
        .optional()
        .describe('Due date in YYYY-MM-DD format'),
    },
    handler: async ({ title, priority, dueDate }) => {
      onTaskCreated({ title, priority, dueDate });
      return { success: true, message: `Created task "${title}"` };
    },
  });

  return (
    <div className="hook-status">
      <span className="hook-indicator" title="WebMCP React Hook active">
        Hook: {tool.state.isExecuting ? 'executing...' : 'ready'}
      </span>
      {tool.state.error && (
        <span className="hook-error">
          Error: {tool.state.error.message}
        </span>
      )}
    </div>
  );
}
