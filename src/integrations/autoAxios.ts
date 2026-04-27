import { attachAxiosInterceptor } from './axios';
import type { ApiLog } from '../core/types';

export const autoAttachAxios = (onLog?: (log: ApiLog) => void) => {
  let attempts = 0;
  let timeoutId: any;
  let cleanup = () => {};
  let stopped = false;

  const tryAttach = () => {
    if (stopped) return;
    try {
      const axiosModule = require('axios');
      const axios = axiosModule?.default || axiosModule;

      if (!axios) return;

      attachAxiosInterceptor(axios, onLog);

      // patch create
      const originalCreate = axios.create.bind(axios);
      const restoreCreate = () => {
        if (axios.create === patchedCreate) {
          axios.create = originalCreate;
        }
      };

      const patchedCreate = (...args: any[]) => {
        const instance = originalCreate(...args);
        attachAxiosInterceptor(instance, onLog);
        return instance;
      };
      axios.create = patchedCreate;

      cleanup = restoreCreate;
    } catch {
      attempts++;

      if (attempts < 5) {
        timeoutId = setTimeout(tryAttach, 500);
      }
    }
  };

  tryAttach();

  return () => {
    stopped = true;
    if (timeoutId) clearTimeout(timeoutId);
    cleanup();
  };
};
