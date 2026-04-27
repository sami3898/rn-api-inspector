import type { ApiLog } from '../core/types';

type ExportOptions = {
  maxChars?: number;
  pretty?: boolean;
};

const DEFAULT_MAX_CHARS = 300_000;

export const exportLogsAsJson = (
  logs: ApiLog[],
  options: ExportOptions = {}
) => {
  const { maxChars = DEFAULT_MAX_CHARS, pretty = true } = options;

  const json = JSON.stringify(logs, null, pretty ? 2 : undefined);

  if (json.length <= maxChars) return json;

  return `${json.slice(0, maxChars)}\n…[truncated]`;
};
