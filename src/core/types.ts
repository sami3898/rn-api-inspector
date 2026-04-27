export type ApiLog = {
  id: string;
  url: string;
  method: string;
  status?: number;
  response?: string;
  error?: string;
  duration: number;
  requestBody?: any;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
};
