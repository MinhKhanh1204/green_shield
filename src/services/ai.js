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

/**
 * Generate bag design patches (front/back) from prompt + templateId.
 * Backend will use bag template custom areas to ask Gemini to create artwork patches.
 * @param {{ prompt: string, templateId: number, generateFront?: boolean, generateBack?: boolean }} payload
 * @returns {Promise<{ frontImageBase64?: string, backImageBase64?: string }>}
 */
export async function generateBagDesign(payload) {
  const body = {
    prompt: payload?.prompt || '',
    templateId: payload?.templateId,
    generateFront: payload?.generateFront,
    generateBack: payload?.generateBack,
  };

  const res = await fetch(`${API_BASE}/api/v1/ai/generate-bag-design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Không thể tạo thiết kế túi bằng AI';
    throw new Error(msg);
  }
  return data;
}
