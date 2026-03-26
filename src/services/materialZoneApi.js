// API_BASE lấy từ Vite env (VITE_API_BASE), ví dụ: http://<backend-host>:<port>
// Nếu không có API_BASE (build/host), fallback gọi relative `/api/...`.
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const API_BASE_URL = API_BASE ? `${API_BASE}/api/material-zones` : '/api/material-zones';

// Helper function for fetch
const fetchApi = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// Zone APIs
export const getAllZones = () => fetchApi('');
export const getZoneById = (id) => fetchApi(`/${id}`);
export const createZone = (zone) => fetchApi('', { method: 'POST', body: JSON.stringify(zone) });
export const updateZone = (id, zone) => fetchApi(`/${id}`, { method: 'PUT', body: JSON.stringify(zone) });
export const deleteZone = (id) => fetchApi(`/${id}`, { method: 'DELETE' });

// Farmer APIs
export const getAllFarmers = () => fetchApi('/farmers');
export const getFarmersByZoneId = (zoneId) => fetchApi(`/${zoneId}/farmers`);
export const createFarmer = (farmer) => fetchApi('/farmers', { method: 'POST', body: JSON.stringify(farmer) });
export const updateFarmer = (id, farmer) => fetchApi(`/farmers/${id}`, { method: 'PUT', body: JSON.stringify(farmer) });
export const deleteFarmer = (id) => fetchApi(`/farmers/${id}`, { method: 'DELETE' });

// CollectionPoint APIs
export const getAllCollectionPoints = () => fetchApi('/collection-points');
export const getCollectionPointsByZoneId = (zoneId) => fetchApi(`/${zoneId}/collection-points`);
export const createCollectionPoint = (point) => fetchApi('/collection-points', { method: 'POST', body: JSON.stringify(point) });
export const updateCollectionPoint = (id, point) => fetchApi(`/collection-points/${id}`, { method: 'PUT', body: JSON.stringify(point) });
export const deleteCollectionPoint = (id) => fetchApi(`/collection-points/${id}`, { method: 'DELETE' });

// Stats API
export const getStats = () => fetchApi('/stats');
