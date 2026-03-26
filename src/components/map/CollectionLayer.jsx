import React, { memo, useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getCollectionTier } from './mapTheme';

const iconCache = new Map();

function createCollectionIcon(tier, markerState) {
  const cacheKey = `${tier}-${markerState}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  const icon = L.divIcon({
    className: 'collection-icon-shell',
    html: `<span class="collection-icon collection-${tier} marker-${markerState}"><span class="collection-glyph">CP</span></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count >= 60 ? 'large' : count >= 24 ? 'medium' : 'small';

  return L.divIcon({
    html: `<span class="map-cluster-badge map-cluster-${size}">${count}</span>`,
    className: 'map-cluster-shell',
    iconSize: [42, 42]
  });
}

function CollectionLayer({
  points,
  hoveredRegionId,
  selectedRegionId,
  visible = true,
  clusterThreshold = 30,
  onPointClick
}) {
  const normalizedPoints = useMemo(
    () => points.filter((point) => Array.isArray(point?.coordinates) && point.coordinates.length === 2),
    [points]
  );

  const markers = useMemo(
    () =>
      normalizedPoints.map((point) => {
        const tier = getCollectionTier(point);
        const stock = Number(point.currentStock) || 0;
        const capacity = Number(point.capacity) || 0;
        const stockRate = capacity ? Math.round((stock / capacity) * 100) : 0;
        const regionRef = hoveredRegionId || selectedRegionId;
        const inFocus = regionRef ? String(point.zoneId) === String(regionRef) : true;
        const markerState = inFocus ? 'focus' : 'dim';

        return (
          <Marker
            key={point.id}
            position={point.coordinates}
            icon={createCollectionIcon(tier, markerState)}
            riseOnHover
            eventHandlers={{
              click: () => {
                if (typeof onPointClick === 'function') onPointClick(point.id);
              }
            }}
          >
            <Tooltip direction="top" opacity={0.9} offset={[0, -12]}>
              <div className="marker-hover-label">
                <strong>{point.name}</strong>
                <span>Ton kho {stockRate}%</span>
              </div>
            </Tooltip>
            <Popup className="map-popup-shell">
              <div className="map-popup-card">
                <h4>{point.name}</h4>
                <p>{point.address}</p>
                <p>Ton kho: {stock} / {capacity} tan ({stockRate}%)</p>
              </div>
            </Popup>
          </Marker>
        );
      }),
    [normalizedPoints, hoveredRegionId, selectedRegionId, onPointClick]
  );

  if (!visible || !markers.length) return null;

  if (markers.length >= clusterThreshold) {
    return (
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        maxClusterRadius={42}
        iconCreateFunction={createClusterIcon}
      >
        {markers}
      </MarkerClusterGroup>
    );
  }

  return <>{markers}</>;
}

export default memo(CollectionLayer);
