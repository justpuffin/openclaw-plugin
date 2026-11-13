// The plugin entry, with OpenClaw's and TypeBox's imports replaced by stand-ins (test/register.mjs).
import assert from "node:assert/strict";
import test from "node:test";

test("the entry defines one tool per Puffin tool, each forwarding to Puffin", async () => {
  const { default: plugin } = await import("../dist/index.js");
  const { TOOLS } = await import("../dist/puffin.js");
  assert.equal(plugin.id, "puffin");
  assert.deepEqual(plugin.builtTools.map((tool) => tool.name), TOOLS.map((tool) => tool.name));
  const messages = plugin.builtTools.find((tool) => tool.name === "puffin_messages");
  assert.equal(messages.workspaceAccess, false);
  assert.equal(messages.parameters.type, "object");
  assert.deepEqual(Object.keys(plugin.configSchema.properties).sort(), ["apiKey", "apiUrl"]);
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push(JSON.parse(init.body).params);
    return { ok: true, status: 200, text: async () => JSON.stringify({ jsonrpc: "2.0", id: "1", result: { content: [{ type: "text", text: "[]" }] } }) };
  };
  const controller = new AbortController();
  assert.deepEqual(await messages.execute({ limit: 1 }, { apiKey: "pf_x" }, { signal: controller.signal }), []);
  assert.deepEqual(seen, [{ name: "messages", arguments: { limit: 1 } }]);
  controller.abort();
  await assert.rejects(messages.execute({}, { apiKey: "pf_x" }, { signal: controller.signal }));
});
