import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function collectCoordinates(zones, farmers, points) {
  const coordinates = [];

  zones.forEach((zone) => {
    if (Array.isArray(zone?.center) && zone.center.length === 2) {
      coordinates.push(zone.center);
    }
    if (Array.isArray(zone?.polygon)) {
      zone.polygon.forEach((coord) => {
        if (Array.isArray(coord) && coord.length === 2) coordinates.push(coord);
      });
    }
  });

  farmers.forEach((farmer) => {
    if (Array.isArray(farmer?.coordinates) && farmer.coordinates.length === 2) {
      coordinates.push(farmer.coordinates);
    }
  });

  points.forEach((point) => {
    if (Array.isArray(point?.coordinates) && point.coordinates.length === 2) {
      coordinates.push(point.coordinates);
    }
  });

  return coordinates;
}

export default function MapViewportManager({ zones, farmers, points, focusTarget }) {
  const map = useMap();
  const mapRef = useRef(null);
  const hasFittedInitiallyRef = useRef(false);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (hasFittedInitiallyRef.current) return;
    const coordinates = collectCoordinates(zones, farmers, points);
    if (!coordinates.length) return;

    hasFittedInitiallyRef.current = true;
    mapRef.current?.fitBounds(L.latLngBounds(coordinates), { padding: [48, 48], maxZoom: 12 });
  }, [map, zones, farmers, points]);

  useEffect(() => {
    if (!focusTarget) return;
    if (!mapRef.current) return;

    if (focusTarget.type === 'point' && Array.isArray(focusTarget.coordinates)) {
      mapRef.current.flyTo(focusTarget.coordinates, focusTarget.zoom || 14, { duration: 0.7 });
      return;
    }

    if (focusTarget.type === 'bounds' && Array.isArray(focusTarget.polygon) && focusTarget.polygon.length > 2) {
      mapRef.current.flyToBounds(L.latLngBounds(focusTarget.polygon), { padding: [56, 56], maxZoom: 13, duration: 0.8 });
    }
  }, [map, focusTarget]);

  return null;
}
