import { useEffect } from 'react';
import { useInspectorStore } from '../core/store';
import { startApiInspector } from '../startApiInspector';

export const useApiInspector = (axiosInstance?: any) => {
  const addLog = useInspectorStore((s) => s.addLog);

  useEffect(() => {
    const { stop } = startApiInspector({
      enabled: __DEV__,
      axios: axiosInstance,
      autoAttachAxios: !axiosInstance,
      onLog: addLog,
    });

    return stop;
  }, [addLog, axiosInstance]);
};
