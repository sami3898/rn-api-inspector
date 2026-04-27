import { useInspectorStore } from '../core/store';
import type { ApiLog } from '../core/types';

const generateId = () => Math.random().toString(36).slice(2);

const DEFAULT_MAX_BODY_CHARS = 100_000;

const truncate = (value: unknown, max: number) => {
  if (typeof value !== 'string') return value;
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n…[truncated]`;
};

type AttachOptions = {
  maxBodyChars?: number;
};

const toHeaderRecord = (headers: any): Record<string, string> | undefined => {
  if (!headers || typeof headers !== 'object') return undefined;

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (v == null) continue;
    out[String(k)] = Array.isArray(v) ? v.map(String).join(', ') : String(v);
  }
  return out;
};

export const attachAxiosInterceptor = (
  axios: any,
  onLog?: (log: ApiLog) => void,
  options: AttachOptions = {}
) => {
  const addLog = onLog ?? useInspectorStore.getState().addLog;
  const maxBodyChars = options.maxBodyChars ?? DEFAULT_MAX_BODY_CHARS;

  if (axios.__API_INSPECTOR_ENABLED__) return;
  axios.__API_INSPECTOR_ENABLED__ = true;

  const requestId = axios.interceptors.request.use((config: any) => {
    config.__meta = {
      id: generateId(),
      start: Date.now(),
      data: config.data,
      headers: toHeaderRecord(config.headers),
    };
    return config;
  });

  const responseId = axios.interceptors.response.use(
    (res: any) => {
      const m = res.config.__meta;

      addLog({
        id: m?.id || generateId(),
        url: res.config.url || '',
        method: (res.config.method || 'GET').toUpperCase(),
        status: res.status,
        requestHeaders: m?.headers,
        responseHeaders: toHeaderRecord(res.headers),
        response: truncate(safeStringify(res.data), maxBodyChars) as any,
        duration: Date.now() - (m?.start || Date.now()),
        requestBody: m?.data,
      });

      return res;
    },
    (err: any) => {
      const c = err.config || {};
      const m = c.__meta || {};

      addLog({
        id: m.id || generateId(),
        url: c.url || '',
        method: (c.method || 'GET').toUpperCase(),
        error: truncate(err?.message ?? String(err), maxBodyChars) as any,
        duration: Date.now() - (m.start || Date.now()),
        requestBody: m?.data,
        requestHeaders: m?.headers ?? toHeaderRecord(c.headers),
        responseHeaders: toHeaderRecord(err?.response?.headers),
      });

      return Promise.reject(err);
    }
  );

  axios.__API_INSPECTOR_INTERCEPTOR_IDS__ = { requestId, responseId };
};

export const detachAxiosInterceptor = (axios: any) => {
  const ids = axios?.__API_INSPECTOR_INTERCEPTOR_IDS__;
  if (ids?.requestId != null) axios.interceptors.request.eject(ids.requestId);
  if (ids?.responseId != null)
    axios.interceptors.response.eject(ids.responseId);
  axios.__API_INSPECTOR_ENABLED__ = false;
  axios.__API_INSPECTOR_INTERCEPTOR_IDS__ = undefined;
};

const safeStringify = (data: any) => {
  try {
    return typeof data === 'string' ? data : JSON.stringify(data);
  } catch {
    return '[Unserializable response]';
  }
};
