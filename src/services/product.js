const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const PUBLIC_PRODUCTS_URL = `${API_BASE}/api/v1/products`
const ADMIN_PRODUCTS_URL = `${API_BASE}/api/v1/admin/products`

async function parseResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.message || payload?.error || `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

async function request(url, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  })
  return parseResponse(response)
}

function compactFilters(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function resolveProductAssetUrl(url) {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url || ''
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

export function getProducts(filters = {}, options = {}) {
  return request(`${PUBLIC_PRODUCTS_URL}${compactFilters(filters)}`, {
    method: 'GET',
    signal: options.signal,
  })
}

export function getProductBySlug(slug, options = {}) {
  return request(`${PUBLIC_PRODUCTS_URL}/${encodeURIComponent(slug)}`, {
    method: 'GET',
    signal: options.signal,
  })
}

export function getAdminProducts(options = {}) {
  return request(ADMIN_PRODUCTS_URL, { method: 'GET', signal: options.signal })
}

export function createProduct(payload) {
  return request(ADMIN_PRODUCTS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProduct(id, payload) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteProduct(id) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function updateProductStatus(id, active) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  })
}

export function updateProductFeatured(id, featured) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ featured }),
  })
}

export function updateProductDisplayOrder(id, displayOrder) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/display-order`, {
    method: 'PATCH',
    body: JSON.stringify({ displayOrder }),
  })
}

export function uploadProductImages(id, files, metadata = {}) {
  const body = new FormData()
  Array.from(files || []).forEach((file) => body.append('files', file))
  if (metadata.altTextVi) body.append('altTextVi', metadata.altTextVi)
  if (metadata.altTextEn) body.append('altTextEn', metadata.altTextEn)
  if (metadata.imageType) body.append('imageType', metadata.imageType)

  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/images`, {
    method: 'POST',
    body,
  })
}

export function updateProductImage(id, imageId, payload) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/images/${imageId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteProductImage(id, imageId) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/images/${imageId}`, {
    method: 'DELETE',
  })
}

export function reorderProductImages(id, imageIds) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/images/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ imageIds }),
  })
}

export function setMainProductImage(id, imageId) {
  return request(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(id)}/images/${imageId}/main`, {
    method: 'PATCH',
  })
}
