export const API_BASE_URL: string = (
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || ''
).replace(/\/$/, '');
