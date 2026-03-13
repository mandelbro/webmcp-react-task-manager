export function initWebMCP(): void {
  if (!('modelContext' in navigator)) {
    void import('@mcp-b/global');
  }
  console.log('[WebMCP] initialized');
}
