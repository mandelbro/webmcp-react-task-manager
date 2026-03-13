import { useState, useEffect, useCallback } from 'react';
import './demo.css';

/**
 * ToolTester — a dev UI for manually invoking any registered WebMCP tool.
 *
 * Provides a dropdown of available tools, displays schema information,
 * lets the developer enter JSON parameters, and shows execution results.
 */

// TODO: Import proper types from src/webmcp/ once webmcp.d.ts is created.

interface ToolMeta {
  name: string;
  description?: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, { type?: string; description?: string; default?: unknown }>;
    required?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Build a skeleton example object from a JSON-Schema-style inputSchema.
 * Produces sensible placeholder values so the developer has a starting point.
 */
function buildExampleParams(schema: ToolMeta['inputSchema']): Record<string, unknown> {
  if (!schema || !schema.properties) return {};

  const example: Record<string, unknown> = {};

  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.default !== undefined) {
      example[key] = prop.default;
    } else {
      switch (prop.type) {
        case 'string':
          example[key] = '';
          break;
        case 'number':
        case 'integer':
          example[key] = 0;
          break;
        case 'boolean':
          example[key] = false;
          break;
        case 'array':
          example[key] = [];
          break;
        case 'object':
          example[key] = {};
          break;
        default:
          example[key] = null;
      }
    }
  }

  return example;
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

export function ToolTester() {
  const [tools, setTools] = useState<ToolMeta[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [params, setParams] = useState<string>('{}');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('modelContext' in navigator);
  }, []);

  const refreshTools = useCallback(() => {
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

    refreshTools();
    const interval = setInterval(refreshTools, 2000);
    return () => clearInterval(interval);
  }, [supported, isOpen, refreshTools]);

  const activeTool = tools.find((t) => t.name === selectedTool) ?? null;

  const handleSelectTool = (name: string) => {
    setSelectedTool(name);
    setResult(null);
    setError(null);

    const tool = tools.find((t) => t.name === name);
    if (tool?.inputSchema) {
      const example = buildExampleParams(tool.inputSchema);
      setParams(JSON.stringify(example, null, 2));
    } else {
      setParams('{}');
    }
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    setResult(null);
    setError(null);

    try {
      const parsedArgs = JSON.parse(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mc = (navigator as any).modelContext;
      if (!mc || typeof mc.callTool !== 'function') {
        throw new Error('navigator.modelContext.callTool is not available');
      }

      const callResult = await mc.callTool({
        name: selectedTool,
        arguments: parsedArgs,
      });

      setResult(callResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

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
        <span className="demo-panel-title">Tool Tester</span>
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
          ) : (
            <>
              {/* Tool selector */}
              <div className="demo-field">
                <label className="demo-label" htmlFor="demo-tool-select">
                  Select Tool
                </label>
                <select
                  id="demo-tool-select"
                  className="demo-select"
                  value={selectedTool}
                  onChange={(e) => handleSelectTool(e.target.value)}
                >
                  <option value="">-- choose a tool --</option>
                  {tools.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tool details */}
              {activeTool && (
                <div className="demo-tool-details">
                  <p className="demo-tool-name">{activeTool.name}</p>
                  {activeTool.description && (
                    <p className="demo-tool-description">{activeTool.description}</p>
                  )}
                  {activeTool.inputSchema && (
                    <details className="demo-schema-details">
                      <summary className="demo-schema-summary">inputSchema</summary>
                      <pre
                        className="demo-json demo-json-small"
                        dangerouslySetInnerHTML={{
                          __html: syntaxHighlightJson(
                            JSON.stringify(activeTool.inputSchema, null, 2),
                          ),
                        }}
                      />
                    </details>
                  )}
                </div>
              )}

              {/* Parameters input */}
              {selectedTool && (
                <div className="demo-field">
                  <label className="demo-label" htmlFor="demo-params">
                    Parameters (JSON)
                  </label>
                  <textarea
                    id="demo-params"
                    className="demo-textarea"
                    value={params}
                    onChange={(e) => setParams(e.target.value)}
                    rows={6}
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Execute button */}
              {selectedTool && (
                <button
                  className="demo-execute-btn"
                  type="button"
                  onClick={handleExecute}
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </button>
              )}

              {/* Error display */}
              {error && (
                <div className="demo-error">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Result display */}
              {result !== null && (
                <div className="demo-result">
                  <p className="demo-label">Result:</p>
                  <pre
                    className="demo-json"
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(
                        JSON.stringify(result, null, 2),
                      ),
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
