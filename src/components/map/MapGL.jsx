import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { MAP_STYLES } from "./mapTheme";
import islandsGeoJSONRaw from "../../data/vietnam-islands.geojson?raw";
import "./MapGL.css";

const DEFAULT_STYLE = "https://tiles.stadiamaps.com/styles/alidade_smooth.json";
const FALLBACK_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const DEFAULT_CENTER = [105.75, 10.03];
const BASE_COLOR = "#4CA771";
const islandsGeoJSON = JSON.parse(islandsGeoJSONRaw);

function toLatLng(value) {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const lat = Number(value[0]);
  const lng = Number(value[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function toLngLat(value) {
  const latLng = toLatLng(value);
  return latLng ? [latLng[1], latLng[0]] : null;
}

function centroid(points = []) {
  if (!points.length) return null;
  const sum = points.reduce(
    (acc, [lat, lng]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }),
    { lat: 0, lng: 0 }
  );
  return [sum.lat / points.length, sum.lng / points.length];
}

function haversineMeters(a, b) {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function circlePolygon(centerLatLng, radiusMeters, steps = 32) {
  const [lat, lng] = centerLatLng;
  const latDelta = radiusMeters / 111320;
  const lngDelta = radiusMeters / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const ring = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    ring.push([lng + Math.cos(t) * lngDelta, lat + Math.sin(t) * latDelta]);
  }
  return ring;
}

function fitCircleBounds(map, centerLatLng, radiusMeters) {
  const [lat, lng] = centerLatLng;
  const latDelta = radiusMeters / 111320;
  const lngDelta = radiusMeters / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  map.fitBounds(
    [
      [lng - lngDelta, lat - latDelta],
      [lng + lngDelta, lat + latDelta]
    ],
    { padding: 80, duration: 850 }
  );
}

function farmerTier(capacity) {
  const value = Number(capacity) || 0;
  if (value >= 15) return "large";
  if (value >= 10) return "medium";
  return "small";
}

function pointTier(point = {}) {
  const stock = Number(point.currentStock) || 0;
  const capacity = Number(point.capacity) || 1;
  const rate = stock / capacity;
  if (rate >= 0.8) return "high";
  if (rate >= 0.5) return "medium";
  return "low";
}

function resolveStyle(mapStyle) {
  if (!mapStyle) return DEFAULT_STYLE;
  if (typeof mapStyle === "string") {
    if (MAP_STYLES?.[mapStyle]?.style) return MAP_STYLES[mapStyle].style;
    if (mapStyle.startsWith("http://") || mapStyle.startsWith("https://")) return mapStyle;
    return DEFAULT_STYLE;
  }
  if (typeof mapStyle?.style === "string") return mapStyle.style;
  return DEFAULT_STYLE;
}

export default function MapGL({
  regions = [],
  farmers = [],
  points = [],
  mapStyle,
  localeText = {
    mode2D: "2D",
    mode3D: "3D",
    modeLabel: "Map mode"
  },
  onSelect,
  onMapTap,
  visibility = { region: true, farmers: true, points: true }
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hoveredRegionIdRef = useRef(null);
  const hoveredFarmerIdRef = useRef(null);
  const hoveredPointIdRef = useRef(null);
  const selectedRegionIdRef = useRef(null);
  const fallbackStyleAppliedRef = useRef(false);
  const regionMetaRef = useRef(new Map());
  const styleKeyRef = useRef(resolveStyle(mapStyle));
  const introPlayedRef = useRef(false);
  const [is3D, setIs3D] = useState(false);

  const regionFeatures = useMemo(() => {
    const nextMeta = new Map();
    const nextFeatures = [];

    for (let i = 0; i < regions.length; i += 1) {
      const region = regions[i];
      const id = region?.id ?? `region-${i}`;

      const zoneFarmers = farmers
        .filter((f) => String(f?.zoneId) === String(region?.id))
        .map((f) => toLatLng(f?.coordinates))
        .filter(Boolean);

      const zonePoints = points
        .filter((p) => String(p?.zoneId) === String(region?.id))
        .map((p) => toLatLng(p?.coordinates))
        .filter(Boolean);

      const polygonCoords = Array.isArray(region?.polygon)
        ? region.polygon.map((p) => toLatLng(p)).filter(Boolean)
        : [];

      const basePoints = [...zoneFarmers, ...zonePoints, ...polygonCoords];
      if (!basePoints.length) continue;

      const center = centroid(basePoints);
      const radius = Math.max(800, ...basePoints.map((pt) => haversineMeters(center, pt)));

      nextMeta.set(String(id), { center, radius, region });
      nextFeatures.push({
        id,
        type: "Feature",
        geometry: { type: "Point", coordinates: [center[1], center[0]] },
        properties: {
          regionId: id,
          radius,
          status: region?.status || "active",
          capacity: Number(region?.capacity) || 0
        }
      });
    }

    regionMetaRef.current = nextMeta;
    return {
      type: "FeatureCollection",
      features: nextFeatures
    };
  }, [regions, farmers, points]);

  const regionAreaGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection",
      features: regionFeatures.features.map((feature) => {
        const meta = regionMetaRef.current.get(String(feature.id));
        const polygon = meta ? circlePolygon(meta.center, meta.radius) : [];
        return {
          id: feature.id,
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [polygon] },
          properties: feature.properties
        };
      })
    }),
    [regionFeatures]
  );

  const farmerGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection",
      features: farmers
        .map((farmer) => {
          const lngLat = toLngLat(farmer?.coordinates);
          if (!lngLat) return null;
          return {
            id: farmer.id,
            type: "Feature",
            geometry: { type: "Point", coordinates: lngLat },
            properties: {
              id: String(farmer.id),
              initial: (farmer?.name || "F").charAt(0).toUpperCase(),
              tier: farmerTier(farmer?.capacity)
            }
          };
        })
        .filter(Boolean)
    }),
    [farmers]
  );

  const pointGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection",
      features: points
        .map((point) => {
          const lngLat = toLngLat(point?.coordinates);
          if (!lngLat) return null;
          return {
            id: point.id,
            type: "Feature",
            geometry: { type: "Point", coordinates: lngLat },
            properties: {
              id: String(point.id),
              tier: pointTier(point)
            }
          };
        })
        .filter(Boolean)
    }),
    [points]
  );

  const setFeatureState = useCallback((source, featureId, key, value) => {
    const map = mapInstanceRef.current;
    if (!map?.getSource(source) || featureId === null || featureId === undefined) return;
    map.setFeatureState({ source, id: featureId }, { [key]: value });
  }, []);

  const addOrUpdateSourcesAndLayers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!map.getSource("region-areas")) {
      map.addSource("region-areas", { type: "geojson", data: regionAreaGeoJSON });
    } else {
      map.getSource("region-areas").setData(regionAreaGeoJSON);
    }

    if (!map.getSource("farmers")) {
      map.addSource("farmers", { type: "geojson", data: farmerGeoJSON });
    } else {
      map.getSource("farmers").setData(farmerGeoJSON);
    }

    if (!map.getSource("points")) {
      map.addSource("points", { type: "geojson", data: pointGeoJSON });
    } else {
      map.getSource("points").setData(pointGeoJSON);
    }

    if (!map.getSource("vn-islands")) {
      map.addSource("vn-islands", { type: "geojson", data: islandsGeoJSON });
    }

    if (!map.getLayer("region-fill")) {
      map.addLayer({
        id: "region-fill",
        type: "fill",
        source: "region-areas",
        layout: { visibility: visibility?.region ? "visible" : "none" },
        paint: {
          "fill-color": BASE_COLOR,
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.45,
            ["boolean", ["feature-state", "selected"], false],
            0.34,
            0.18
          ]
        }
      });
    } else {
      map.setLayoutProperty("region-fill", "visibility", visibility?.region ? "visible" : "none");
    }

    if (!map.getLayer("region-outline")) {
      map.addLayer({
        id: "region-outline",
        type: "line",
        source: "region-areas",
        layout: { visibility: visibility?.region ? "visible" : "none" },
        paint: {
          "line-color": BASE_COLOR,
          "line-opacity": 0.9,
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2.8,
            ["boolean", ["feature-state", "selected"], false],
            2.5,
            1.8
          ]
        }
      });
    } else {
      map.setLayoutProperty("region-outline", "visibility", visibility?.region ? "visible" : "none");
    }

    if (!map.getLayer("region-3d")) {
      map.addLayer({
        id: "region-3d",
        type: "fill-extrusion",
        source: "region-areas",
        layout: { visibility: is3D && visibility?.region ? "visible" : "none" },
        paint: {
          "fill-extrusion-color": BASE_COLOR,
          "fill-extrusion-height": ["*", ["get", "capacity"], 8],
          "fill-extrusion-opacity": 0.62
        }
      });
    } else {
      map.setLayoutProperty(
        "region-3d",
        "visibility",
        is3D && visibility?.region ? "visible" : "none"
      );
    }

    if (!map.getLayer("farmer-glow")) {
      map.addLayer({
        id: "farmer-glow",
        type: "circle",
        source: "farmers",
        layout: { visibility: visibility?.farmers ? "visible" : "none" },
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            18,
            14
          ],
          "circle-color": [
            "match",
            ["get", "tier"],
            "large",
            "rgba(76, 167, 113, 0.28)",
            "medium",
            "rgba(255, 176, 32, 0.26)",
            "rgba(76, 167, 113, 0.22)"
          ],
          "circle-blur": 0.8
        }
      });
    } else {
      map.setLayoutProperty("farmer-glow", "visibility", visibility?.farmers ? "visible" : "none");
    }

    if (!map.getLayer("farmer-circle")) {
      map.addLayer({
        id: "farmer-circle",
        type: "circle",
        source: "farmers",
        layout: { visibility: visibility?.farmers ? "visible" : "none" },
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            12,
            10
          ],
          "circle-color": [
            "match",
            ["get", "tier"],
            "large",
            "#4CA771",
            "medium",
            "#FFB020",
            "#6FC594"
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.6
        }
      });
    } else {
      map.setLayoutProperty("farmer-circle", "visibility", visibility?.farmers ? "visible" : "none");
    }

    if (!map.getLayer("farmer-label")) {
      map.addLayer({
        id: "farmer-label",
        type: "symbol",
        source: "farmers",
        layout: {
          visibility: visibility?.farmers ? "visible" : "none",
          "text-field": ["get", "initial"],
          "text-size": 12,
          "text-font": ["Open Sans Bold"]
        },
        paint: { "text-color": "#08363a" }
      });
    } else {
      map.setLayoutProperty("farmer-label", "visibility", visibility?.farmers ? "visible" : "none");
    }

    if (!map.getLayer("point-glow")) {
      map.addLayer({
        id: "point-glow",
        type: "circle",
        source: "points",
        layout: { visibility: visibility?.points ? "visible" : "none" },
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            22,
            18
          ],
          "circle-color": [
            "match",
            ["get", "tier"],
            "high",
            "rgba(255, 77, 79, 0.30)",
            "medium",
            "rgba(255, 176, 32, 0.28)",
            "rgba(76, 167, 113, 0.26)"
          ],
          "circle-blur": 0.85
        }
      });
    } else {
      map.setLayoutProperty("point-glow", "visibility", visibility?.points ? "visible" : "none");
    }

    if (!map.getLayer("point-circle")) {
      map.addLayer({
        id: "point-circle",
        type: "circle",
        source: "points",
        layout: { visibility: visibility?.points ? "visible" : "none" },
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            15,
            13
          ],
          "circle-color": [
            "match",
            ["get", "tier"],
            "high",
            "#ff4d4f",
            "medium",
            "#faad14",
            "#4CA771"
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2
        }
      });
    } else {
      map.setLayoutProperty("point-circle", "visibility", visibility?.points ? "visible" : "none");
    }
    if (!map.getLayer("vn-islands-fill")) {
      map.addLayer({
        id: "vn-islands-fill",
        type: "fill",
        source: "vn-islands",
        paint: {
          "fill-color": BASE_COLOR,
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            0.15,
            8,
            0.25,
            12,
            0.35
          ]
        }
      });
    }

    if (!map.getLayer("vn-islands-outline")) {
      map.addLayer({
        id: "vn-islands-outline",
        type: "line",
        source: "vn-islands",
        paint: {
          "line-color": BASE_COLOR,
          "line-width": 2
        }
      });
    }

    if (!map.getLayer("vn-islands-label")) {
      map.addLayer({
        id: "vn-islands-label",
        type: "symbol",
        source: "vn-islands",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 14,
          "text-offset": [0, 1.2]
        },
        paint: {
          "text-color": "#013237"
        }
      });
    }
  }, [farmerGeoJSON, is3D, pointGeoJSON, regionAreaGeoJSON, visibility?.farmers, visibility?.points, visibility?.region]);

  const bindMapInteractions = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onMoveRegion = (event) => {
      const feature = event?.features?.[0];
      if (!feature) return;
      if (hoveredRegionIdRef.current !== null && hoveredRegionIdRef.current !== feature.id) {
        setFeatureState("region-areas", hoveredRegionIdRef.current, "hover", false);
      }
      hoveredRegionIdRef.current = feature.id;
      setFeatureState("region-areas", feature.id, "hover", true);
      map.getCanvas().style.cursor = "pointer";
    };

    const onLeaveRegion = () => {
      if (hoveredRegionIdRef.current !== null) {
        setFeatureState("region-areas", hoveredRegionIdRef.current, "hover", false);
        hoveredRegionIdRef.current = null;
      }
      map.getCanvas().style.cursor = "";
    };

    const onClickRegion = (event) => {
      const feature = event?.features?.[0];
      if (!feature) return;
      if (selectedRegionIdRef.current !== null) {
        setFeatureState("region-areas", selectedRegionIdRef.current, "selected", false);
      }
      selectedRegionIdRef.current = feature.id;
      setFeatureState("region-areas", feature.id, "selected", true);
      const meta = regionMetaRef.current.get(String(feature.id));
      if (meta) {
        fitCircleBounds(map, meta.center, meta.radius);
      }
      onSelect?.({ type: "region", id: feature.id });
    };

    const onMoveFarmer = (event) => {
      const feature = event?.features?.[0];
      if (!feature) return;
      if (hoveredFarmerIdRef.current !== null && hoveredFarmerIdRef.current !== feature.id) {
        setFeatureState("farmers", hoveredFarmerIdRef.current, "hover", false);
      }
      hoveredFarmerIdRef.current = feature.id;
      setFeatureState("farmers", feature.id, "hover", true);
      map.getCanvas().style.cursor = "pointer";
    };

    const onLeaveFarmer = () => {
      if (hoveredFarmerIdRef.current !== null) {
        setFeatureState("farmers", hoveredFarmerIdRef.current, "hover", false);
        hoveredFarmerIdRef.current = null;
      }
      map.getCanvas().style.cursor = "";
    };

    const onClickFarmer = (event) => {
      const feature = event?.features?.[0];
      if (!feature) return;
      onSelect?.({ type: "farmer", id: feature.properties.id });
    };

    const onMovePoint = (event) => {
      const feature = event?.features?.[0];
      if (!feature) return;
      if (hoveredPointIdRef.current !== null && hoveredPointIdRef.current !== feature.id) {
        setFeatureState("points", hoveredPointIdRef.current, "hover", false);
      }
      hoveredPointIdRef.current = feature.id;
      setFeatureState("points", feature.id, "hover", true);
      map.getCanvas().style.cursor = "pointer";
    };

    const onLeavePoint = () => {
      if (hoveredPointIdRef.current !== null) {
        setFeatureState("points", hoveredPointIdRef.current, "hover", false);
        hoveredPointIdRef.current = null;
      }
      map.getCanvas().style.cursor = "";
    };

    const onClickPoint = (event) => {
      const feature = event?.features?.[0];
      if (!feature) return;
      onSelect?.({ type: "point", id: feature.properties.id });
    };

    const onMapClick = (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["region-fill", "farmer-circle", "point-circle"]
      });
      if (!features?.length) onMapTap?.();
    };

    map.off("mousemove", "region-fill", onMoveRegion);
    map.off("mouseleave", "region-fill", onLeaveRegion);
    map.off("click", "region-fill", onClickRegion);
    map.off("mousemove", "farmer-circle", onMoveFarmer);
    map.off("mouseleave", "farmer-circle", onLeaveFarmer);
    map.off("click", "farmer-circle", onClickFarmer);
    map.off("mousemove", "point-circle", onMovePoint);
    map.off("mouseleave", "point-circle", onLeavePoint);
    map.off("click", "point-circle", onClickPoint);
    map.off("click", onMapClick);

    map.on("mousemove", "region-fill", onMoveRegion);
    map.on("mouseleave", "region-fill", onLeaveRegion);
    map.on("click", "region-fill", onClickRegion);
    map.on("mousemove", "farmer-circle", onMoveFarmer);
    map.on("mouseleave", "farmer-circle", onLeaveFarmer);
    map.on("click", "farmer-circle", onClickFarmer);
    map.on("mousemove", "point-circle", onMovePoint);
    map.on("mouseleave", "point-circle", onLeavePoint);
    map.on("click", "point-circle", onClickPoint);
    map.on("click", onMapClick);
  }, [onMapTap, onSelect, setFeatureState]);

  useEffect(() => {
    let disposed = false;
    let map;

    const initMap = () => {
      if (!mapRef.current) return;
      if (disposed) return;

      const styleUrl = resolveStyle(mapStyle);
      styleKeyRef.current = styleUrl;

      map = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: DEFAULT_CENTER,
        zoom: 9.8,
        pitch: 0
      });

      mapInstanceRef.current = map;
      map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      map.on("error", (event) => {
        const message = String(event?.error?.message || "").toLowerCase();
        if (fallbackStyleAppliedRef.current) return;
        if (
          !message.includes("unexpected token")
          && !message.includes("parse")
          && !message.includes("projection")
          && !message.includes("cannot read properties of undefined")
        ) {
          return;
        }
        fallbackStyleAppliedRef.current = true;
        styleKeyRef.current = FALLBACK_STYLE_URL;
        map.setStyle(FALLBACK_STYLE_URL);
      });

      const onLoadStyle = () => {
        addOrUpdateSourcesAndLayers();
        bindMapInteractions();
        if (!introPlayedRef.current) {
          map.flyTo({
            center: DEFAULT_CENTER,
            zoom: 11.5,
            pitch: 40,
            bearing: -12,
            duration: 1800
          });
          introPlayedRef.current = true;
        }
      };

      map.on("style.load", onLoadStyle);
    };

    initMap();

    return () => {
      disposed = true;
      map?.remove();
      mapInstanceRef.current = null;
    };
  }, [addOrUpdateSourcesAndLayers, bindMapInteractions, mapStyle]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const nextStyle = resolveStyle(mapStyle);
    if (styleKeyRef.current === nextStyle) return;
    fallbackStyleAppliedRef.current = false;
    styleKeyRef.current = nextStyle;
    map.setStyle(nextStyle);
  }, [mapStyle]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map?.isStyleLoaded()) return;
    addOrUpdateSourcesAndLayers();
  }, [addOrUpdateSourcesAndLayers]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({
      pitch: is3D ? 58 : 0,
      bearing: is3D ? -20 : 0,
      duration: 800
    });
    if (map.getLayer("region-3d")) {
      map.setLayoutProperty(
        "region-3d",
        "visibility",
        is3D && visibility?.region ? "visible" : "none"
      );
    }
  }, [is3D, visibility?.region]);

  return (
    <div className="mapgl-wrapper">
      <div ref={mapRef} className="mapgl-canvas" />

      <div className="map-mode-toggle" role="group" aria-label={localeText.modeLabel}>
        <button type="button" className={!is3D ? "active" : ""} onClick={() => setIs3D(false)}>
          {localeText.mode2D}
        </button>
        <button type="button" className={is3D ? "active" : ""} onClick={() => setIs3D(true)}>
          {localeText.mode3D}
        </button>
      </div>
    </div>
  );
}
