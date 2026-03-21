/**
 * Returns a plain deep clone with all Vue reactive proxies stripped.
 * JSON.stringify accesses proxy properties transparently, so nested proxies
 * are handled correctly at any depth. Single fix point if the strategy changes.
 */
export function deepClone<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}
