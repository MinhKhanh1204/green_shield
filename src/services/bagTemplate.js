const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: options.headers || {},
    ...options,
  });
  if (!res.ok) throw new Error(res.status === 401 ? 'Unauthorized' : res.statusText);
  return res;
}

/** Public: list active templates */
export async function getBagTemplates(activeOnly = true) {
  const params = activeOnly ? '?active=true' : '';
  const res = await fetch(`${API_BASE}/api/v1/bag-templates${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/** Public: get by id */
export async function getBagTemplate(id) {
  const res = await fetch(`${API_BASE}/api/v1/bag-templates/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/** Admin: list all */
export async function adminGetBagTemplates() {
  const res = await authFetch(`${API_BASE}/api/v1/admin/bag-templates`);
  return res.json();
}

/** Admin: create */
export async function adminCreateBagTemplate(formData) {
  const res = await authFetch(`${API_BASE}/api/v1/admin/bag-templates`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

/** Admin: update */
export async function adminUpdateBagTemplate(id, formData) {
  const res = await authFetch(`${API_BASE}/api/v1/admin/bag-templates/${id}`, {
    method: 'PUT',
    body: formData,
  });
  return res.json();
}

/** Admin: delete */
export async function adminDeleteBagTemplate(id) {
  await authFetch(`${API_BASE}/api/v1/admin/bag-templates/${id}`, { method: 'DELETE' });
}
