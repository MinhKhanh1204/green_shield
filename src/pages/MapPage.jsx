import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Result, Spin } from "antd";
import { useTranslation } from "react-i18next";
import "./MapPage.css";
import { useMaterialData } from "../context/MaterialDataContext";
import MapGL from "../components/map/MapGL";
import FloatingOverview from "../components/map/FloatingOverview";
import FloatingFilter from "../components/map/FloatingFilter";
import FloatingDetail from "../components/map/FloatingDetail";

const EMPTY_STATS = {
  totalZones: 0,
  activeZones: 0,
  totalFarmers: 0,
  activeFarmers: 0,
  totalFarmerCapacity: 0,
  totalCollectionPoints: 0,
  activePoints: 0,
  totalStock: 0,
  totalStockCapacity: 0,
  stockRate: 0
};

function toNumber(value) {
  return Number(value) || 0;
}

function computeStats(zones, farmers, points) {
  const totalStock = points.reduce((sum, point) => sum + toNumber(point.currentStock), 0);
  const totalStockCapacity = points.reduce((sum, point) => sum + toNumber(point.capacity), 0);

  return {
    totalZones: zones.length,
    activeZones: zones.filter((zone) => zone.status === "active").length,
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter((farmer) => farmer.status === "active").length,
    totalFarmerCapacity: farmers.reduce((sum, farmer) => sum + toNumber(farmer.capacity), 0),
    totalCollectionPoints: points.length,
    activePoints: points.filter((point) => point.status === "active").length,
    totalStock,
    totalStockCapacity,
    stockRate: totalStockCapacity ? Math.round((totalStock / totalStockCapacity) * 100) : 0
  };
}

export default function MapPage() {
  const { t } = useTranslation();
  const { zones = [], farmers = [], points = [], loading, error } = useMaterialData();

  const [mapStyle, setMapStyle] = useState("light");
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibility, setVisibility] = useState({
    region: true,
    farmers: true,
    points: true
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFilterByViewport = () => {
      if (window.innerWidth < 1025) {
        setFilterCollapsed(true);
      }
    };

    syncFilterByViewport();
    window.addEventListener("resize", syncFilterByViewport);
    return () => window.removeEventListener("resize", syncFilterByViewport);
  }, []);

  const safeZones = useMemo(() => zones.filter((zone) => !zone?.deleted), [zones]);
  const safeFarmers = useMemo(() => farmers.filter((farmer) => !farmer?.deleted), [farmers]);
  const safePoints = useMemo(() => points.filter((point) => !point?.deleted), [points]);

  const selectedZone = useMemo(
    () => safeZones.find((zone) => String(zone.id) === String(selectedZoneId)),
    [safeZones, selectedZoneId]
  );

  const scopedFarmers = useMemo(() => {
    if (!selectedZoneId) return safeFarmers;
    return safeFarmers.filter((farmer) => String(farmer.zoneId) === String(selectedZoneId));
  }, [safeFarmers, selectedZoneId]);

  const scopedPoints = useMemo(() => {
    if (!selectedZoneId) return safePoints;
    return safePoints.filter((point) => String(point.zoneId) === String(selectedZoneId));
  }, [safePoints, selectedZoneId]);

  const stats = useMemo(
    () => computeStats(selectedZone ? [selectedZone] : safeZones, scopedFarmers, scopedPoints),
    [selectedZone, safeZones, scopedFarmers, scopedPoints]
  );

  const selectedDetailItem = useMemo(() => {
    if (!selectedItem) return null;

    if (selectedItem.type === "region") {
      return safeZones.find((zone) => String(zone.id) === String(selectedItem.id)) || null;
    }
    if (selectedItem.type === "farmer") {
      return safeFarmers.find((farmer) => String(farmer.id) === String(selectedItem.id)) || null;
    }
    if (selectedItem.type === "point") {
      return safePoints.find((point) => String(point.id) === String(selectedItem.id)) || null;
    }

    return null;
  }, [selectedItem, safeZones, safeFarmers, safePoints]);

  const handleSelectZone = useCallback((zoneId) => {
    const nextZoneId = zoneId || "";
    setSelectedZoneId(nextZoneId);
    setSelectedItem(nextZoneId ? { type: "region", id: nextZoneId } : null);
  }, []);

  const handleSelectFromMap = useCallback((item) => {
    if (!item) return;
    setSelectedItem(item);
  }, []);

  const handleVisibilityChange = useCallback((key, value) => {
    setVisibility((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <section className="map-page map-loading-state">
        <Spin size="large" fullscreen tip={t("map.loading", { defaultValue: "Loading map..." })} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="map-page map-loading-state">
        <Result
          status="error"
          title={t("map.error", { defaultValue: "Error loading map" })}
          subTitle={error}
        />
      </section>
    );
  }

  return (
    <section className="map-page">
      <FloatingOverview stats={stats || EMPTY_STATS} />

      <FloatingFilter
        collapsed={filterCollapsed}
        onToggle={() => setFilterCollapsed((prev) => !prev)}
        zones={safeZones}
        selectedZoneId={selectedZoneId}
        onSelectZone={handleSelectZone}
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        visibility={visibility}
        onVisibilityChange={handleVisibilityChange}
      />

      <FloatingDetail
        item={selectedDetailItem}
        type={selectedItem?.type}
        onClose={() => setSelectedItem(null)}
      />

      <div className="map-shell">
        <MapGL
          regions={selectedZone ? [selectedZone] : safeZones}
          farmers={scopedFarmers}
          points={scopedPoints}
          mapStyle={mapStyle}
          selectedRegionId={selectedZoneId}
          visibility={visibility}
          localeText={{
            mode2D: t("map.mode2D", { defaultValue: "2D" }),
            mode3D: t("map.mode3D", { defaultValue: "3D" }),
            modeLabel: t("map.modeLabel", { defaultValue: "Map display mode" })
          }}
          onSelect={handleSelectFromMap}
        />
      </div>
    </section>
  );
}
