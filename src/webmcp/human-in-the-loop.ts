import type { Task } from '../types/task';

type GetTasksFn = () => Task[];
type DeleteTaskFn = (id: string) => void;

export function registerDeleteTaskTool(
  getTasks: GetTasksFn,
  deleteTask: DeleteTaskFn,
): void {
  if (!('modelContext' in navigator)) return;

  navigator.modelContext.registerTool({
    name: 'delete_task',
    description: 'Delete a task by ID. Requires user confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to delete',
        },
      },
      required: ['taskId'],
    },
    async execute({ taskId }, agent) {
      const task = getTasks().find((t) => t.id === taskId);
      if (!task) {
        return {
          content: [
            { type: 'text', text: `Task "${taskId as string}" not found` },
          ],
        };
      }

      const confirmed = await agent.requestUserInteraction(async () => {
        return confirm(`Delete task "${task.title}"? This cannot be undone.`);
      });

      if (!confirmed) {
        return {
          content: [{ type: 'text', text: 'Deletion cancelled by user.' }],
        };
      }

      deleteTask(taskId as string);
      return {
        content: [
          { type: 'text', text: `Deleted task "${task.title}"` },
        ],
      };
    },
  });
}
