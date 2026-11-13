// Stand-in for openclaw/plugin-sdk/tool-plugin: returns the definition with its tools built, so tests can inspect them.
export function defineToolPlugin(definition) {
  const tools = definition.tools((spec) => spec);
  return { ...definition, builtTools: tools };
}
