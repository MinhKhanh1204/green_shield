import React, { memo, useMemo } from 'react';
import { Tooltip } from 'antd';
import { AimOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function collectMapCoordinates(zones, farmers, points) {
  const zoneCenters = zones
    .filter((zone) => Array.isArray(zone?.center) && zone.center.length === 2)
    .map((zone) => zone.center);

  const zonePolygons = zones.flatMap((zone) =>
    (Array.isArray(zone?.polygon) ? zone.polygon : []).filter((point) => Array.isArray(point) && point.length === 2)
  );

  const farmerPoints = farmers
    .filter((farmer) => Array.isArray(farmer?.coordinates) && farmer.coordinates.length === 2)
    .map((farmer) => farmer.coordinates);

  const collectionPoints = points
    .filter((point) => Array.isArray(point?.coordinates) && point.coordinates.length === 2)
    .map((point) => point.coordinates);

  return [...zoneCenters, ...zonePolygons, ...farmerPoints, ...collectionPoints];
}

function MapControls({ zones, farmers, points }) {
  const map = useMap();

  const allCoordinates = useMemo(() => collectMapCoordinates(zones, farmers, points), [zones, farmers, points]);

  const handleResetView = () => {
    if (!allCoordinates.length) return;
    const bounds = L.latLngBounds(allCoordinates);
    map.flyToBounds(bounds, { padding: [48, 48], duration: 0.8, maxZoom: 13 });
  };

  return (
    <div className="map-floating-controls" role="group" aria-label="Map controls">
      <Tooltip title="Zoom in" placement="left">
        <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in" className="map-control-btn">
          <PlusOutlined />
        </button>
      </Tooltip>

      <Tooltip title="Zoom out" placement="left">
        <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out" className="map-control-btn">
          <MinusOutlined />
        </button>
      </Tooltip>

      <Tooltip title="Reset view" placement="left">
        <button type="button" onClick={handleResetView} aria-label="Reset view" className="map-control-btn">
          <AimOutlined />
        </button>
      </Tooltip>
    </div>
  );
}

export default memo(MapControls);
