// Module hooks for the tests: OpenClaw and TypeBox aren't installed in CI, so their two imports resolve to stand-ins
// that follow the documented shapes (defineToolPlugin({id, name, description, configSchema, tools}); Type.Object etc.).
const STUBS = {
  "openclaw/plugin-sdk/tool-plugin": new URL("./tool-plugin.mjs", import.meta.url).href,
  typebox: new URL("./typebox.mjs", import.meta.url).href,
};

export async function resolve(specifier, context, next) {
  if (STUBS[specifier]) return { url: STUBS[specifier], shortCircuit: true };
  return next(specifier, context);
}
