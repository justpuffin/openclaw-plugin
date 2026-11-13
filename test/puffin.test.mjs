import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DEFAULT_URL, PuffinError, TOOLS, callTool, checkUrl, description, settings } from "../dist/puffin.js";

const ok = (body) => ({ ok: true, status: 200, text: async () => JSON.stringify(body) });

test("a tool call goes to Puffin's MCP endpoint with the agent key", async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    return ok({ jsonrpc: "2.0", id: "1", result: { content: [{ type: "text", text: '{"items": [1, 2]}' }] } });
  };
  const result = await callTool("messages", { limit: 2 }, { apiKey: "pf_secret" }, { fetchImpl, env: {} });
  assert.deepEqual(result, { items: [1, 2] });
  assert.equal(seen[0].url, DEFAULT_URL + "/mcp");
  assert.equal(seen[0].init.headers.Authorization, "Bearer pf_secret");
  assert.equal(seen[0].init.redirect, "error");
  const body = JSON.parse(seen[0].init.body);
  assert.equal(body.method, "tools/call");
  assert.deepEqual(body.params, { name: "messages", arguments: { limit: 2 } });
});

test("errors from Puffin become clear exceptions", async () => {
  const toolError = async () => ok({ jsonrpc: "2.0", id: "1", result: { content: [{ type: "text", text: "Key lacks required scope: email:write" }], isError: true } });
  await assert.rejects(callTool("reply", {}, { apiKey: "k" }, { fetchImpl: toolError, env: {} }), /email:write/);
  const refused = async () => ({ ok: false, status: 401, text: async () => JSON.stringify({ detail: "Invalid key" }) });
  await assert.rejects(callTool("messages", {}, { apiKey: "k" }, { fetchImpl: refused, env: {} }), (error) => error instanceof PuffinError && error.status === 401);
  await assert.rejects(callTool("messages", {}, {}, { fetchImpl: refused, env: {} }), /Set the Puffin agent key/);
});

test("settings come from config, then the environment, and never use plain http", () => {
  assert.deepEqual(settings({}, { PUFFIN_API_KEY: "pf_env" }), { apiUrl: DEFAULT_URL, apiKey: "pf_env" });
  assert.equal(settings({ apiKey: "pf_c", apiUrl: "https://puffin.example.test/" }, {}).apiUrl, "https://puffin.example.test");
  assert.throws(() => checkUrl("http://api.example.test"), /https/);
  assert.equal(checkUrl("http://127.0.0.1:8000"), "http://127.0.0.1:8000");
});

test("tool descriptions warn about untrusted content and mark sends", () => {
  const reply = TOOLS.find((tool) => tool.mcp_name === "reply");
  const messages = TOOLS.find((tool) => tool.mcp_name === "messages");
  assert.match(description(reply), /approval/);
  assert.doesNotMatch(description(messages), /Sends wait/);
  assert.match(description(messages), /untrusted/);
});

test("the manifest lists exactly the plugin's tools", () => {
  const manifest = JSON.parse(readFileSync(new URL("../openclaw.plugin.json", import.meta.url), "utf8"));
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.deepEqual(manifest.contracts.tools, TOOLS.map((tool) => tool.name));
  assert.equal(manifest.id, "puffin");
  assert.equal(manifest.version, pkg.version);
  assert.deepEqual(pkg.openclaw.extensions, ["./dist/index.js"]);
  assert.ok(pkg.dependencies.typebox && pkg.peerDependencies.openclaw);
  assert.ok(pkg.files.includes("dist") && pkg.files.includes("openclaw.plugin.json"));
});
