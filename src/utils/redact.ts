import type { ApiLog } from '../core/types';

const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
]);

const mask = (value: string) => {
  if (!value) return value;
  if (value.length <= 8) return '***';
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
};

export const redactHeaders = (headers?: Record<string, string>) => {
  if (!headers) return headers;

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (SENSITIVE_HEADER_KEYS.has(key)) {
      out[k] = mask(String(v));
    } else {
      out[k] = String(v);
    }
  }
  return out;
};

export const defaultRedactLog = (log: ApiLog): ApiLog => {
  return {
    ...log,
    requestHeaders: redactHeaders(log.requestHeaders),
    responseHeaders: redactHeaders(log.responseHeaders),
  };
};
