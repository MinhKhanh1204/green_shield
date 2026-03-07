const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

/**
 * Generate image from prompt via backend (Gemini).
 * @param {string} prompt
 * @returns {Promise<{ imageBase64: string }>}
 * @throws Error with message from server (e.g. daily limit exceeded)
 */
export async function generateAiImage(prompt) {
  const res = await fetch(`${API_BASE}/api/v1/ai/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt || '' }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Không thể tạo ảnh';
    throw new Error(msg);
  }
  return data;
}
