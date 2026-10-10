// Random per-tab session id. sessionStorage ends with the tab, so a new tab
// (or a new visitor) starts with an empty knowledge base.
const KEY = 'rag_session_id';

const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for very old browsers / non-secure contexts
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

let memoryId = null; // used if sessionStorage is blocked

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    memoryId = memoryId || uuid();
    return memoryId;
  }
}

// Remove state that older versions kept in localStorage (shared across tabs/visits).
export function dropLegacyStorage() {
  try {
    localStorage.removeItem('rag_documents');
    localStorage.removeItem('rag_messages');
  } catch {
    /* ignore */
  }
}
