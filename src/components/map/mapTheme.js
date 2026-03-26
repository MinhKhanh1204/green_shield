export const MAP_STYLES = {
  light: {
    id: "light",
    label: "Light (Clean)",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  },

  dark: {
    id: "dark",
    label: "Dark (Pro)",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
  },

  voyager: {
    id: "voyager",
    label: "Voyager (Best)",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
  },
}

export const normalizePolygon = (polygon = []) => {
  if (!Array.isArray(polygon)) return [];
  return polygon
    .filter((point) => Array.isArray(point) && point.length === 2)
    .map(([lat, lng]) => [Number(lat), Number(lng)]);
};

export const getFarmerTier = (capacity = 0) => {
  if (capacity >= 15) return 'large';
  if (capacity >= 10) return 'medium';
  return 'small';
};

export const getCollectionTier = (point = {}) => {
  const currentStock = Number(point.currentStock) || 0;
  const capacity = Number(point.capacity) || 1;
  const rate = currentStock / capacity;

  if (rate >= 0.8) return 'high';
  if (rate >= 0.5) return 'medium';
  return 'low';
};
