import React, { memo, useMemo } from 'react';
import { Circle, Tooltip } from 'react-leaflet';

function getStatusColor(status) {
  if (status === 'planning') return '#4CA771';
  if (status === 'inactive') return '#4CA771';
  return '#4CA771';
}

function getRegionCenter(region) {
  if (Array.isArray(region?.center) && region.center.length === 2) {
    return region.center;
  }

  if (Array.isArray(region?.polygon) && region.polygon.length > 0) {
    const [lat, lng] = region.polygon[0] || [];
    if (typeof lat === 'number' && typeof lng === 'number') {
      return [lat, lng];
    }
  }

  return null;
}

function distanceMeters(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);

  const h = s1 * s1 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * s2 * s2;
  return 2 * earth * Math.asin(Math.sqrt(h));
}

function areaToRadiusMeters(areaHa) {
  const safeArea = Number(areaHa) || 0;
  if (!safeArea) return 1800;
  return Math.sqrt((safeArea * 10000) / Math.PI);
}

function RegionLayer({
  regions,
  farmers = [],
  points = [],
  selectedRegionId,
  hoveredRegionId,
  onRegionClick,
  onRegionHover,
  visible = true
}) {
  const regionMarkers = useMemo(
    () =>
      regions
        .map((region) => {
          const center = getRegionCenter(region);
          if (!center) return null;

          const isSelected = String(region.id) === String(selectedRegionId || '');
          const isHovered = String(region.id) === String(hoveredRegionId || '');
          const color = getStatusColor(region.status);
          const zoneFarmers = farmers.filter((farmer) => String(farmer.zoneId) === String(region.id));
          const zonePoints = points.filter((point) => String(point.zoneId) === String(region.id));
          const memberCoords = [...zoneFarmers, ...zonePoints]
            .map((item) => item.coordinates)
            .filter((coord) => Array.isArray(coord) && coord.length === 2);

          const maxDistance = memberCoords.reduce((max, coord) => {
            const d = distanceMeters(center, coord);
            return d > max ? d : max;
          }, 0);

          const fallbackRadius = areaToRadiusMeters(region.area);
          const baseRadius = Math.max(fallbackRadius, maxDistance + 450, 1400);
          const radiusMeters = isHovered ? baseRadius * 1.08 : isSelected ? baseRadius * 1.04 : baseRadius;

          return {
            id: region.id,
            name: region.name,
            district: region.district,
            capacity: region.capacity,
            status: region.status,
            center,
            color,
            radius: Math.round(Math.min(radiusMeters, 22000)),
            opacity: isHovered ? 0.42 : isSelected ? 0.36 : 0.28
          };
        })
        .filter(Boolean),
    [regions, farmers, points, selectedRegionId, hoveredRegionId]
  );

  if (!visible || !regionMarkers.length) {
    return null;
  }

  return (
    <>
      {regionMarkers.map((region) => (
        <Circle
          key={region.id}
          center={region.center}
          radius={region.radius}
          pathOptions={{
            color: region.color,
            fillColor: region.color,
            fillOpacity: region.opacity,
            weight: 2,
            className: 'region-circle'
          }}
          eventHandlers={{
            mouseover: () => {
              if (typeof onRegionHover === 'function') onRegionHover(region.id);
            },
            mouseout: () => {
              if (typeof onRegionHover === 'function') onRegionHover(null);
            },
            click: () => {
              if (typeof onRegionClick === 'function') onRegionClick(region.id);
            }
          }}
        >
          <Tooltip direction="top" opacity={0.95}>
            <div className="region-mini-overlay">
              <strong>{region.name}</strong>
              <span>{region.district}</span>
              <div className="mini-overlay-stats">
                <em>Status: {region.status === 'planning' ? 'Planning' : region.status === 'inactive' ? 'Inactive' : 'Active'}</em>
                <em>Capacity: {Number(region.capacity) || 0}</em>
              </div>
            </div>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
}

export default memo(RegionLayer);
