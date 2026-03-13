import { useState, useEffect, useCallback } from 'react';
import './demo.css';

/**
 * ToolInspector — a collapsible dev panel that displays all currently
 * registered WebMCP tools as formatted, syntax-highlighted JSON.
 *
 * Polls `navigator.modelContext.listTools()` every 2 seconds while open.
 * Gracefully degrades when the WebMCP API is unavailable.
 */

// TODO: Import proper types from src/webmcp/ once webmcp.d.ts is created
// by the other agent. For now we use `any` casts for navigator.modelContext.

interface ToolMeta {
  name: string;
  description?: string;
  inputSchema?: unknown;
  [key: string]: unknown;
}

function syntaxHighlightJson(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'demo-json-number';
      if (match.startsWith('"')) {
        cls = match.endsWith(':') ? 'demo-json-key' : 'demo-json-string';
      } else if (/true|false/.test(match)) {
        cls = 'demo-json-boolean';
      } else if (match === 'null') {
        cls = 'demo-json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export function ToolInspector() {
  const [tools, setTools] = useState<ToolMeta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [supported] = useState(() => 'modelContext' in navigator);

  const refresh = useCallback(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mc = (navigator as any).modelContext;
      if (mc && typeof mc.listTools === 'function') {
        const registered = mc.listTools() as ToolMeta[];
        setTools(Array.isArray(registered) ? registered : []);
      }
    } catch {
      setTools([]);
    }
  }, []);

  useEffect(() => {
    if (!supported || !isOpen) return;

    const doRefresh = () => {
      refresh();
    };
    doRefresh();
    const interval = setInterval(doRefresh, 2000);
    return () => clearInterval(interval);
  }, [supported, isOpen, refresh]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const formattedJson = JSON.stringify(tools, null, 2);

  return (
    <div className="demo-panel">
      <button
        className="demo-panel-header"
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span className={`demo-toggle-arrow ${isOpen ? 'demo-toggle-open' : ''}`}>
          &#9654;
        </span>
        <span className="demo-panel-title">
          Tool Inspector
          {supported && (
            <span className="demo-tool-count">
              {tools.length} tool{tools.length !== 1 ? 's' : ''}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="demo-panel-body">
          {!supported ? (
            <div className="demo-unsupported">
              <p>
                <strong>navigator.modelContext</strong> is not available.
              </p>
              <p>
                To use the WebMCP API you need Chrome Canary with the
                experimental WebMCP flag enabled:
              </p>
              <ol>
                <li>
                  Open <code>chrome://flags</code> in Chrome Canary
                </li>
                <li>
                  Search for <code>WebMCP</code> or{' '}
                  <code>Model Context Protocol</code>
                </li>
                <li>Enable the flag and relaunch the browser</li>
              </ol>
            </div>
          ) : tools.length === 0 ? (
            <p className="demo-muted">No tools registered.</p>
          ) : (
            <pre
              className="demo-json"
              dangerouslySetInnerHTML={{
                __html: syntaxHighlightJson(formattedJson),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
