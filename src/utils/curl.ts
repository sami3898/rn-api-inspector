import type { ApiLog } from '../core/types';

const shellEscapeSingleQuotes = (value: string) => value.replace(/'/g, `'\\''`);

export const toCurl = (log: ApiLog) => {
  const method = (log.method || 'GET').toUpperCase();
  const url = log.url || '';

  const parts: string[] = [
    'curl',
    '-X',
    method,
    `'${shellEscapeSingleQuotes(url)}'`,
  ];

  if (log.requestBody != null) {
    const body =
      typeof log.requestBody === 'string'
        ? log.requestBody
        : JSON.stringify(log.requestBody);

    if (typeof log.requestBody !== 'string') {
      parts.push('-H', `'Content-Type: application/json'`);
    }

    parts.push('--data', `'${shellEscapeSingleQuotes(body)}'`);
  }

  if (log.requestHeaders) {
    for (const [key, value] of Object.entries(log.requestHeaders)) {
      parts.push('-H', `'${shellEscapeSingleQuotes(`${key}: ${value}`)}'`);
    }
  }

  return parts.join(' ');
};
