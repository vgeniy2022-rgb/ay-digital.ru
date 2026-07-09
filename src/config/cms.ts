export const cmsConfig = {
  apiUrl: import.meta.env.VITE_CMS_API_URL?.trim() || '',
  timeoutMs: 30000,
};
