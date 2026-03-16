import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/materialZoneApi';

const MaterialDataContext = createContext();

export function MaterialDataProvider({ children }) {
  const [zones, setZones] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Đảm bảo luôn là mảng (tránh crash khi API trả về null/object)
  const ensureArray = (data) => Array.isArray(data) ? data : [];

  // Load initial data from API (có timeout tránh xoay mãi khi API chậm/lỗi)
  const loadData = useCallback(async () => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 12000); // Tối đa 12 giây, sau đó tắt spinner
    try {
      const [zonesData, farmersData, pointsData] = await Promise.all([
        api.getAllZones(),
        api.getAllFarmers(),
        api.getAllCollectionPoints()
      ]);
      setZones(ensureArray(zonesData));
      setFarmers(ensureArray(farmersData));
      setPoints(ensureArray(pointsData));
      setError(null);
    } catch (err) {
      console.error('Error loading material data:', err);
      setError(err.message);
      setZones([]);
      setFarmers([]);
      setPoints([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Zone operations
  const addZone = async (zone) => {
    try {
      const newZone = await api.createZone(zone);
      setZones(prev => [...prev, newZone]);
      return newZone;
    } catch (err) {
      console.error('Error creating zone:', err);
      throw err;
    }
  };

  const updateZone = async (id, data) => {
    try {
      const updated = await api.updateZone(id, data);
      setZones(prev => prev.map(z => z.id === id ? updated : z));
      return updated;
    } catch (err) {
      console.error('Error updating zone:', err);
      throw err;
    }
  };

  const deleteZone = async (id) => {
    try {
      await api.deleteZone(id);
      // Soft delete: chỉ cần xóa zone khỏi state, farmers/points vẫn giữ nguyên
      // vì API getAll sẽ tự động lọc theo zone active
      setZones(prev => prev.filter(z => z.id !== id));
      // Farmers và points thuộc zone bị xóa sẽ tự động không hiển thị
      // vì chúng không còn zone active để hiển thị
    } catch (err) {
      console.error('Error deleting zone:', err);
      throw err;
    }
  };

  // Farmer operations
  const addFarmer = async (farmer) => {
    try {
      const newFarmer = await api.createFarmer(farmer);
      setFarmers(prev => [...prev, newFarmer]);
      return newFarmer;
    } catch (err) {
      console.error('Error creating farmer:', err);
      throw err;
    }
  };

  const updateFarmer = async (id, data) => {
    try {
      const updated = await api.updateFarmer(id, data);
      setFarmers(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      console.error('Error updating farmer:', err);
      throw err;
    }
  };

  const deleteFarmer = async (id) => {
    try {
      await api.deleteFarmer(id);
      setFarmers(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Error deleting farmer:', err);
      throw err;
    }
  };

  // Point operations
  const addPoint = async (point) => {
    try {
      const newPoint = await api.createCollectionPoint(point);
      setPoints(prev => [...prev, newPoint]);
      return newPoint;
    } catch (err) {
      console.error('Error creating point:', err);
      throw err;
    }
  };

  const updatePoint = async (id, data) => {
    try {
      const updated = await api.updateCollectionPoint(id, data);
      setPoints(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      console.error('Error updating point:', err);
      throw err;
    }
  };

  const deletePoint = async (id) => {
    try {
      await api.deleteCollectionPoint(id);
      setPoints(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting point:', err);
      throw err;
    }
  };

  const value = {
    zones,
    farmers,
    points,
    loading,
    error,
    refreshData: loadData,
    addZone,
    updateZone,
    deleteZone,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    addPoint,
    updatePoint,
    deletePoint
  };

  return (
    <MaterialDataContext.Provider value={value}>
      {children}
    </MaterialDataContext.Provider>
  );
}

export function useMaterialData() {
  const context = useContext(MaterialDataContext);
  if (!context) {
    throw new Error('useMaterialData must be used within a MaterialDataProvider');
  }
  return context;
}
