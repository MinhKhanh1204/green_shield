import React, { memo, useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getFarmerTier } from './mapTheme';

const iconCache = new Map();

function createFarmerIcon(initial, tier, markerState) {
  const cacheKey = `${initial}-${tier}-${markerState}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  const icon = L.divIcon({
    className: 'farmer-icon-shell',
    html: `<span class="farmer-icon farmer-${tier} marker-${markerState}">${initial}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count >= 80 ? 'large' : count >= 35 ? 'medium' : 'small';

  return L.divIcon({
    html: `<span class="map-cluster-badge map-cluster-${size}">${count}</span>`,
    className: 'map-cluster-shell',
    iconSize: [42, 42]
  });
}

function FarmerLayer({
  farmers,
  hoveredRegionId,
  selectedRegionId,
  visible = true,
  clusterThreshold = 40,
  onFarmerClick
}) {
  const normalizedFarmers = useMemo(
    () =>
      farmers.filter((farmer) => Array.isArray(farmer?.coordinates) && farmer.coordinates.length === 2),
    [farmers]
  );

  const markers = useMemo(
    () =>
      normalizedFarmers.map((farmer) => {
        const capacity = Number(farmer.capacity) || 0;
        const tier = getFarmerTier(capacity);
        const initial = (farmer.name || 'F').trim().charAt(0).toUpperCase();
        const regionRef = hoveredRegionId || selectedRegionId;
        const inFocus = regionRef ? String(farmer.zoneId) === String(regionRef) : true;
        const markerState = inFocus ? 'focus' : 'dim';

        return (
          <Marker
            key={farmer.id}
            position={farmer.coordinates}
            icon={createFarmerIcon(initial || 'F', tier, markerState)}
            riseOnHover
            eventHandlers={{
              click: () => {
                if (typeof onFarmerClick === 'function') onFarmerClick(farmer.id);
              }
            }}
          >
            <Tooltip direction="top" opacity={0.9} offset={[0, -10]}>
              <div className="marker-hover-label">
                <strong>{farmer.name}</strong>
                <span>{capacity} tan/nam</span>
              </div>
            </Tooltip>
            <Popup className="map-popup-shell">
              <div className="map-popup-card">
                <h4>{farmer.name}</h4>
                <p>{farmer.address}</p>
                <p>Cong suat: {capacity} tan/nam</p>
              </div>
            </Popup>
          </Marker>
        );
      }),
    [normalizedFarmers, hoveredRegionId, selectedRegionId, onFarmerClick]
  );

  if (!visible || !markers.length) return null;

  if (markers.length >= clusterThreshold) {
    return (
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        maxClusterRadius={44}
        iconCreateFunction={createClusterIcon}
      >
        {markers}
      </MarkerClusterGroup>
    );
  }

  return <>{markers}</>;
}

export default memo(FarmerLayer);
