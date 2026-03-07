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

/** Public: create order */
export async function createOrder(data) {
  const res = await fetch(`${API_BASE}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/** Public: get order by id (for customer lookup) */
export async function getOrderById(id) {
  const res = await fetch(`${API_BASE}/api/v1/orders/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(res.status === 404 ? 'NOT_FOUND' : res.statusText);
  return res.json();
}

/** Admin: list orders */
export async function adminGetOrders(status) {
  const params = status ? `?status=${status}` : '';
  const res = await authFetch(`${API_BASE}/api/v1/admin/orders${params}`);
  return res.json();
}

/** Admin: get by id */
export async function adminGetOrder(id) {
  const res = await authFetch(`${API_BASE}/api/v1/admin/orders/${id}`);
  return res.json();
}

/** Admin: update status */
export async function adminUpdateOrderStatus(id, status) {
  const res = await authFetch(`${API_BASE}/api/v1/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}
