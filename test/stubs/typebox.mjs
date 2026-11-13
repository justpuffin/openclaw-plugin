// Stand-in for TypeBox: just enough to build JSON Schema objects the way the real Type.* helpers do.
export const Type = {
  Object: (properties, options = {}) => ({ type: "object", properties, required: Object.keys(properties).filter((key) => !properties[key].optional), ...options }),
  String: (options = {}) => ({ type: "string", ...options }),
  Optional: (schema) => ({ ...schema, optional: true }),
  Unsafe: (schema) => schema,
};
