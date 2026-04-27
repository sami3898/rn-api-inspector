import type { ApiLog } from '../core/types';

const toHeaderArray = (headers?: Record<string, string>) => {
  if (!headers) return [];
  return Object.entries(headers).map(([name, value]) => ({
    name,
    value,
  }));
};

export const exportLogsAsHarLite = (logs: ApiLog[]) => {
  const entries = logs.map((l) => {
    const status = l.status ?? 0;

    return {
      startedDateTime: new Date(Date.now() - (l.duration || 0)).toISOString(),
      time: l.duration,
      request: {
        method: l.method,
        url: l.url,
        httpVersion: 'HTTP/1.1',
        headers: toHeaderArray(l.requestHeaders),
        queryString: [],
        cookies: [],
        headersSize: -1,
        bodySize: -1,
      },
      response: {
        status,
        statusText: l.error ? 'ERROR' : String(status),
        httpVersion: 'HTTP/1.1',
        headers: toHeaderArray(l.responseHeaders),
        cookies: [],
        content: {
          size: l.response ? l.response.length : 0,
          mimeType: 'application/json',
          text: l.response ?? '',
        },
        redirectURL: '',
        headersSize: -1,
        bodySize: l.response ? l.response.length : -1,
      },
      cache: {},
      timings: {
        send: 0,
        wait: l.duration,
        receive: 0,
      },
    };
  });

  return {
    log: {
      version: '1.2',
      creator: { name: 'rn-api-inspector', version: '0.1.0' },
      entries,
    },
  };
};
