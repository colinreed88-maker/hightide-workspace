export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
}

export function textResult(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data) }],
  };
}

export interface OpenClawApi {
  registerTool(
    def: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
      execute: (id: string, params: Record<string, unknown>) => Promise<ToolResult>;
    },
    opts?: { optional?: boolean },
  ): void;
}
