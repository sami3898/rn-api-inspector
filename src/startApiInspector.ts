import type { ApiLog } from './core/types';
import {
  detachFetchInterceptor,
  initFetchInterceptor,
} from './core/interceptors';
import {
  attachAxiosInterceptor,
  detachAxiosInterceptor,
} from './integrations/axios';
import { autoAttachAxios } from './integrations/autoAxios';
import { defaultRedactLog } from './utils/redact';

export type ApiInspectorOptions = {
  enabled?: boolean;
  axios?: any;
  autoAttachAxios?: boolean;
  maxBodyChars?: number;
  filter?: (log: ApiLog) => boolean;
  redact?: (log: ApiLog) => ApiLog;
  onLog?: (log: ApiLog) => void;
};

type StopFn = () => void;

const DEFAULT_MAX_BODY_CHARS = 100_000;

const truncate = (value: unknown, max: number) => {
  if (typeof value !== 'string') return value;
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n…[truncated]`;
};

export const startApiInspector = (options: ApiInspectorOptions = {}) => {
  const {
    enabled = __DEV__,
    axios,
    autoAttachAxios: shouldAutoAttachAxios = false,
    maxBodyChars = DEFAULT_MAX_BODY_CHARS,
    filter,
    redact = defaultRedactLog,
    onLog,
  } = options;

  if (!enabled) {
    return { stop: (() => {}) as StopFn };
  }

  const logger = (log: ApiLog) => {
    const filtered = filter ? filter(log) : true;
    if (!filtered) return;

    const redacted = redact ? redact(log) : log;
    const truncated: ApiLog = {
      ...redacted,
      response: truncate(redacted.response, maxBodyChars) as any,
      error: truncate(redacted.error, maxBodyChars) as any,
    };

    if (onLog) onLog(truncated);
  };

  initFetchInterceptor(logger);

  let stopAutoAttachAxios: StopFn | undefined;
  if (shouldAutoAttachAxios) {
    stopAutoAttachAxios = autoAttachAxios(logger);
  }

  if (axios) {
    attachAxiosInterceptor(axios, logger);
  }

  return {
    stop: () => {
      if (axios) detachAxiosInterceptor(axios);
      if (stopAutoAttachAxios) stopAutoAttachAxios();
      detachFetchInterceptor();
    },
  };
};
