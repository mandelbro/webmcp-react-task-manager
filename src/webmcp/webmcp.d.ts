interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (
    params: Record<string, unknown>,
    agent: ModelContextAgent,
  ) => Promise<ModelContextResult>;
}

interface ModelContextAgent {
  requestUserInteraction: <T>(fn: () => Promise<T>) => Promise<T>;
}

interface ModelContextResult {
  content: Array<{ type: string; text: string }>;
}

interface ModelContext {
  registerTool(tool: ModelContextTool): { unregister(): void };
  unregisterTool(name: string): void;
  listTools(): ModelContextTool[];
  callTool(params: {
    name: string;
    arguments: Record<string, unknown>;
  }): Promise<ModelContextResult>;
}

declare global {
  interface Navigator {
    modelContext: ModelContext;
  }
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolautosubmit?: string;
  }
}

export {};
