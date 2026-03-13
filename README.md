# WebMCP React Task Manager

A companion repository for the article ["I Built WebMCP Tools in React. The API Is Good. The Ecosystem Isn't."](https://medium.com/@montes.makes/webmcp-in-practice-building-react-tools-for-chrome-146s-agent-api-21b3c5152a47)

This is a React task manager app that demonstrates every WebMCP API surface: declarative HTML attributes, imperative `registerTool()`, human-in-the-loop confirmation, and the `useWebMCP` React hook. Clone it, enable the Chrome Canary flag, and see WebMCP tools register in under 5 minutes.

## Prerequisites

- **Node.js** 18+
- **pnpm** (or npm/yarn)
- **Chrome Canary** 146+ ([download](https://www.google.com/chrome/canary/))

## Setup

```bash
git clone https://github.com/your-username/webmcp-react-task-manager.git
cd webmcp-react-task-manager
pnpm install
pnpm dev
```

### Enable WebMCP in Chrome Canary

1. Open Chrome Canary
2. Navigate to `chrome://flags`
3. Search for **"WebMCP for testing"**
4. Set it to **Enabled**
5. Relaunch the browser
6. Open `http://localhost:5173`

Verify the API is available by opening DevTools console:

```javascript
'modelContext' in navigator
// true
```

> **Note**: The `@mcp-b/global` polyfill is included and auto-initializes `navigator.modelContext` if the native API isn't available. The app works as a normal task manager in any browser; WebMCP features activate when the API is present.

## What's Demonstrated

### Declarative API (HTML Attributes)

The search form in `src/components/SearchBar.tsx` uses native HTML attributes to register as a WebMCP tool:

```html
<form
  toolname="search-tasks"
  tooldescription="Search tasks by keyword and filter by status"
  toolautosubmit
>
```

The `respondWith()` handler in `src/webmcp/declarative.ts` intercepts agent-initiated submissions and returns structured data.

### Imperative API (registerTool)

`src/webmcp/imperative.ts` registers a `create_task` tool with JSON Schema validation:

```javascript
navigator.modelContext.registerTool({
  name: 'create_task',
  description: 'Create a new task with a title, priority level, and optional due date',
  inputSchema: { /* JSON Schema */ },
  async execute({ title, priority, dueDate }) { /* ... */ }
});
```

### Human-in-the-Loop

`src/webmcp/human-in-the-loop.ts` registers a `delete_task` tool that uses `agent.requestUserInteraction()` to require user confirmation before destructive actions.

### React Hook (useWebMCP)

`src/webmcp/react-hook.tsx` demonstrates the `@mcp-b/react-webmcp` hook with Zod schema validation:

```typescript
useWebMCP({
  name: 'create_task_hook',
  description: 'Create a new task using the React hook pattern',
  inputSchema: {
    title: z.string().describe('The task title'),
    priority: z.enum(['low', 'medium', 'high']).describe('Priority level'),
  },
  handler: async ({ title, priority }) => {
    // handler returns plain objects; hook auto-wraps to MCP content blocks
    return { success: true };
  },
});
```

### Developer Tools (Demo UI)

Two built-in panels at the bottom of the app:

- **Tool Inspector** (`src/demo/ToolInspector.tsx`) — Shows all registered tools as formatted JSON, auto-refreshes every 2 seconds
- **Tool Tester** (`src/demo/ToolTester.tsx`) — Select a tool, enter parameters, execute it, and see the result

## Architecture

```
src/
  components/       # Pure React task manager (works without WebMCP)
  webmcp/           # All WebMCP integration, one file per API pattern
    webmcp.d.ts     # TypeScript declarations for navigator.modelContext
    setup.ts        # Feature detection + polyfill initialization
    declarative.ts  # respondWith() handler for search form
    imperative.ts   # registerTool() for create_task
    human-in-the-loop.ts  # delete_task with agent.requestUserInteraction()
    react-hook.tsx  # useWebMCP hook with Zod schemas
  demo/             # Developer tools UI (ToolInspector, ToolTester)
  store/            # Task state management (useTaskStore hook)
  types/            # TypeScript type definitions
  utils/            # Pure helper functions
```

The WebMCP layer is additive. Remove the `webmcp/` directory and the app still works as a standard React task manager.

## Testing Tools Manually

Open the DevTools console and enumerate registered tools:

```javascript
const tools = navigator.modelContext.listTools();
console.log(JSON.stringify(tools, null, 2));
```

Execute a tool directly:

```javascript
const result = await navigator.modelContext.callTool({
  name: 'create_task',
  arguments: { title: 'Test task', priority: 'high' }
});
console.log(result);
```

Or use the built-in **Tool Tester** panel at the bottom of the app.

## Tested With

- Chrome Canary 146
- `@mcp-b/react-webmcp` v2.2.0
- `@mcp-b/global` v2.2.0
- React 19.2
- Vite 8.0
- TypeScript 5.9
- Zod 4.3

## Article Series

This repo accompanies a series on WebMCP:

1. **"I Built WebMCP Tools in React. The API Is Good. The Ecosystem Isn't."** (this repo)
2. "WebMCP Won't Work Unless Websites Want It To (And Most Won't)" (coming soon)
3. "WebMCP, Playwright MCP, and Browser-Use Walk Into a Bar" (coming soon)
4. "The Security Model WebMCP Doesn't Talk About" (coming soon)

## License

MIT
