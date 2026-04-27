import type { ApiLog } from './types';

const g = globalThis as any;

const generateId = () => Math.random().toString(36).slice(2);

const MAX_CAPTURE_CHARS = 100_000;

const toHeaderRecord = (headers: any): Record<string, string> | undefined => {
  if (!headers) return undefined;

  try {
    // Fetch Headers instance
    if (typeof headers.forEach === 'function') {
      const out: Record<string, string> = {};
      headers.forEach((value: string, key: string) => {
        out[key] = String(value);
      });
      return out;
    }

    // Array of tuples
    if (Array.isArray(headers)) {
      const out: Record<string, string> = {};
      for (const pair of headers) {
        if (Array.isArray(pair) && pair.length >= 2) {
          out[String(pair[0])] = String(pair[1]);
        }
      }
      return out;
    }

    // Plain object
    if (typeof headers === 'object') {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(headers)) {
        if (v == null) continue;
        out[String(k)] = Array.isArray(v)
          ? v.map(String).join(', ')
          : String(v);
      }
      return out;
    }
  } catch {}

  return undefined;
};

export const initFetchInterceptor = (onLog: (log: ApiLog) => void) => {
  if (g.__API_INSPECTOR_ENABLED__) return;
  if (typeof g.fetch !== 'function') return;

  g.__API_INSPECTOR_ENABLED__ = true;

  if (!g.__API_INSPECTOR_ORIGINAL_FETCH__) {
    g.__API_INSPECTOR_ORIGINAL_FETCH__ = g.fetch;
  }

  const originalFetch = g.__API_INSPECTOR_ORIGINAL_FETCH__.bind(g);

  g.fetch = async (input: any, init: any = {}) => {
    const start = Date.now();

    const request = {
      id: generateId(),
      url: typeof input === 'string' ? input : input?.url,
      method: init?.method || 'GET',
      requestBody: init?.body,
      requestHeaders: toHeaderRecord(init?.headers),
    };

    try {
      const res = await originalFetch(input, init);

      const clone = res.clone();
      const text = await clone.text();

      onLog({
        ...request,
        status: res.status,
        responseHeaders: toHeaderRecord(res.headers),
        response:
          text.length > MAX_CAPTURE_CHARS
            ? `${text.slice(0, MAX_CAPTURE_CHARS)}\n…[truncated]`
            : text,
        duration: Date.now() - start,
      });

      return res;
    } catch (e: any) {
      onLog({
        ...request,
        error: e?.message ?? String(e),
        duration: Date.now() - start,
      });

      throw e;
    }
  };
};

export const detachFetchInterceptor = () => {
  if (!g.__API_INSPECTOR_ENABLED__) return;
  if (typeof g.__API_INSPECTOR_ORIGINAL_FETCH__ === 'function') {
    g.fetch = g.__API_INSPECTOR_ORIGINAL_FETCH__;
  }
  g.__API_INSPECTOR_ENABLED__ = false;
};
