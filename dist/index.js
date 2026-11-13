// Puffin for OpenClaw: your Puffin agent's inbox, chats, contacts, calendar and tasks as OpenClaw tools.
// Every tool forwards to the Puffin hosted MCP tool of the same name; sends wait for the owner's approval in Puffin.
// Hand-written ES module (no build step): it is the entry openclaw.extensions points at.
import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";
import { Type } from "typebox";
import { TOOLS, callTool, description } from "./puffin.js";

export default defineToolPlugin({
  id: "puffin",
  name: "Puffin",
  description: "Your Puffin agent's inbox, chats (Slack, Discord, Telegram), texts, contacts, calendar and tasks as tools; every send waits for your approval.",
  configSchema: Type.Object({
    apiKey: Type.Optional(Type.String({ description: "Puffin agent key (pf_...). Or set PUFFIN_API_KEY in the environment." })),
    apiUrl: Type.Optional(Type.String({ description: "Puffin API address. Default https://api.justpuffin.tech" })),
  }),
  tools: (tool) => TOOLS.map((entry) => tool({
    name: entry.name,
    label: entry.title,
    description: description(entry),
    // The schemas are JSON Schema from Puffin's MCP tools; TypeBox's Unsafe keeps them as they are.
    parameters: Type.Unsafe(entry.parameters),
    workspaceAccess: false,
    async execute(params, config, context) {
      context?.signal?.throwIfAborted?.();
      return callTool(entry.mcp_name, params, config ?? {}, { signal: context?.signal });
    },
  })),
});
