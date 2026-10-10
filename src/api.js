import { getSessionId } from './session';

export const API_BASE = 'https://rag-assistant-nhi.duckdns.org';

// fetch wrapper that attaches the session id to every request
export function apiFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), 'X-Session-Id': getSessionId() },
  });
}

export async function errorDetail(response, fallback) {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
  } catch {
    /* not JSON */
  }
  return fallback;
}
