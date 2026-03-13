import { filterTasks } from '../utils/taskHelpers';
import type { Task, TaskStatus } from '../types/task';

export function setupDeclarativeHandler(getTasks: () => Task[]): void {
  const form = document.querySelector('form[toolname="search-tasks"]');
  if (!form) return;

  form.addEventListener('submit', ((event: SubmitEvent) => {
    if ((event as SubmitEvent & { agentInvoked?: boolean }).agentInvoked) {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      const query = (formData.get('query') as string) || '';
      const status = (formData.get('status') as string) || 'all';
      const results = filterTasks(
        getTasks(),
        query,
        status as TaskStatus,
      );

      (event as SubmitEvent & { respondWith?: (p: Promise<unknown>) => void }).respondWith?.(
        Promise.resolve({
          content: [{ type: 'text', text: JSON.stringify(results) }],
        }),
      );
    }
  }) as EventListener);

  window.addEventListener('toolactivated', ((event: Event) => {
    const toolEvent = event as Event & { toolName?: string };
    if (toolEvent.toolName === 'search-tasks') {
      console.log('[WebMCP] Search tool activated by agent');
    }
  }) as EventListener);
}
