export function getApiBaseUrl() {
  return process.env.CRM_API_URL ?? 'http://localhost:3001';
}
