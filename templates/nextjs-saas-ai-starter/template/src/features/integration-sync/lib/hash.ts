import { createHash } from 'crypto';

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries.map(([k, v]) => [k, sortObject(v)]));
  }
  return value;
}

export function toStableHash(payload: Record<string, unknown>): string {
  const stable = sortObject(payload);
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex');
}

export function toScopeHash(scope?: unknown): string {
  return toStableHash((scope ?? {}) as Record<string, unknown>);
}
