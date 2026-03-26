// Texture API - public get-all + admin CRUD
// Dev: dùng proxy (VITE_API_BASE rỗng) để cookie session hoạt động
// Prod: set VITE_API_BASE=https://your-backend.com

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

async function json(url, options = {}) {
  const res = await authFetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Public: get all textures with optional search */
export async function getTextures(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/api/v1/textures${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/** Admin: create texture */
export async function createTexture(imageFile, name = '') {
  const form = new FormData();
  form.append('image', imageFile);
  if (name) form.append('name', name);
  const res = await authFetch(`${API_BASE}/api/v1/admin/textures`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

/** Admin: update texture (chỉ tên) */
export async function updateTexture(id, { name }) {
  const res = await authFetch(`${API_BASE}/api/v1/admin/textures/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name ?? null }),
  });
  return res.json();
}

/** Admin: delete texture */
export async function deleteTexture(id) {
  await authFetch(`${API_BASE}/api/v1/admin/textures/${id}`, { method: 'DELETE' });
}

/** Check if logged in */
export async function checkAuth() {
  const res = await fetch(`${API_BASE}/api/v1/auth/check`, { credentials: 'include' });
  return res.ok;
}

/** Login */
export async function login(username, password) {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Invalid credentials');
}

/** Logout */
export async function logout() {
  await fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
}
