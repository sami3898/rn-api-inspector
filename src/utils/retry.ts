export const retryRequest = async (log: any) => {
  try {
    const axiosModule = require('axios');
    const axios = axiosModule?.default || axiosModule;

    if (axios) {
      return axios({
        url: log.url,
        method: log.method,
        data: log.requestBody,
      });
    }
  } catch {}

  // fallback to fetch
  const body =
    typeof log.requestBody === 'string'
      ? log.requestBody
      : log.requestBody != null
        ? JSON.stringify(log.requestBody)
        : undefined;

  return fetch(log.url, {
    method: log.method,
    headers:
      body && typeof log.requestBody !== 'string'
        ? { 'Content-Type': 'application/json' }
        : undefined,
    body,
  });
};
