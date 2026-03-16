import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Card, Row, Col, Statistic, Tag, Button, Select, Segmented, Badge, Table, Tooltip, Typography, Space, Flex, Spin, Result } from 'antd';
import { EnvironmentOutlined, HomeOutlined, InboxOutlined, TeamOutlined, FilterOutlined, ExpandOutlined, CompressOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import { useMaterialData } from '../context/MaterialDataContext';
import { getStats } from '../services/mapData';

const { Title, Text } = Typography;

// Component để fit bounds khi dữ liệu thay đổi
function MapBounds({ zones, farmers, points, focusLocation, isClickingMarker }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size để đảm bảo map render đúng
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Nếu đang focus vào vị trí cụ thể hoặc đang click vào marker thì không fitBounds
    if (focusLocation || isClickingMarker) {
      return;
    }

    const safeZ = Array.isArray(zones) ? zones : [];
    const safeF = Array.isArray(farmers) ? farmers : [];
    const safeP = Array.isArray(points) ? points : [];
    
    // Lấy tất cả coordinates từ zones (dùng center hoặc polygon)
    const allCoordinates = [
      ...safeZ.filter(z => z && z.center && z.center.length === 2).map(z => z.center),
      ...safeZ.filter(z => z && z.polygon && z.polygon.length > 0).flatMap(z => z.polygon),
      ...safeF.filter(f => f && f.coordinates && f.coordinates.length === 2).map(f => f.coordinates),
      ...safeP.filter(p => p && p.coordinates && p.coordinates.length === 2).map(p => p.coordinates)
    ];

    if (allCoordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch (e) {
        console.warn('Error fitting bounds:', e);
      }
    }
  }, [zones, farmers, points, map, focusLocation, isClickingMarker]);

  return null;
}

// Component để fly đến vị trí hoặc fit bounds
function FlyToLocation({ focusLocation, zonePolygon, onComplete }) {
  const map = useMap();
  const prevFocusRef = useRef(null);
  
  useEffect(() => {
    if (!focusLocation || !focusLocation.coordinates) {
      return;
    }
    
    // Chỉ thực hiện khi focusLocation thay đổi
    const focusKey = `${focusLocation.coordinates[0]}-${focusLocation.coordinates[1]}-${focusLocation.zoom}`;
    if (prevFocusRef.current === focusKey) {
      return;
    }
    prevFocusRef.current = focusKey;
    
    if (zonePolygon && zonePolygon.length > 0) {
      // Fit bounds cho polygon (zone)
      const bounds = L.latLngBounds(zonePolygon);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      // Fly to coordinates cho farmer/point
      map.flyTo(focusLocation.coordinates, focusLocation.zoom || 15, {
        duration: 0.8
      });
    }
    
    if (onComplete) {
      setTimeout(() => onComplete(), 800);
    }
  }, [focusLocation, map, onComplete, zonePolygon]);
  
  return null;
}

// Component Map chính
function MaterialMap({ 
  zones = [], 
  farmers = [], 
  points = [], 
  showZones, 
  showFarmers, 
  showPoints,
  selectedZone,
  onZoneClick,
  onFarmerClick,
  onPointClick,
  viewMode,
  focusLocation,
  onFocusComplete,
  mapType,
  isClickingMarker = false
}) {
  const center = [10.2, 105.8]; // Trung tâm ĐBSCL

  // Hàm lấy màu theo công suất hộ dân
  const getFarmerColor = (capacity) => {
    if (capacity >= 15) return '#722ed1'; // Lớn - purple
    if (capacity >= 10) return '#1890ff'; // Trung bình - blue
    return '#52c41a'; // Nhỏ - green
  };

  // Hàm lấy bán kính theo công suất hộ dân
  const getFarmerRadius = (capacity) => {
    return Math.max(6, Math.min(capacity / 2, 15));
  };

  // Hàm lấy màu điểm thu gom theo tồn kho
  const getPointColor = (point) => {
    const currentStock = point.currentStock || 0;
    const capacity = point.capacity || 1;
    const fillPercent = currentStock / capacity;
    if (fillPercent >= 0.8) return '#f5222d'; // Đỏ - đầy
    if (fillPercent >= 0.5) return '#faad14'; // Vàng - trung bình
    return '#52c41a'; // Xanh - còn chỗ
  };

  return (
    <MapContainer 
      center={center} 
      zoom={9} 
      className="material-map"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={mapType === 'satellite' 
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : mapType === 'terrain'
          ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      
      <MapBounds zones={zones} farmers={farmers} points={points} focusLocation={focusLocation} isClickingMarker={isClickingMarker} />
      
      {focusLocation && (
        <FlyToLocation 
          focusLocation={focusLocation} 
          zonePolygon={focusLocation.zonePolygon}
          onComplete={onFocusComplete} 
        />
      )}

      {/* Vùng nguyên liệu - Polygon */}
      {showZones && zones.filter(zone => zone.polygon && zone.polygon.length > 0).map(zone => {
        const isSelected = selectedZone?.id == zone.id;
        const zoneFarmers = farmers.filter(f => f.zoneId === zone.id);
        const totalCapacity = zoneFarmers.reduce((sum, f) => sum + (f.capacity || 0), 0);
        
        const color = zone.status === 'active' ? '#52c41a' : '#faad14';
        
        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: isSelected ? '#1890ff' : color,
              fillColor: color,
              fillOpacity: isSelected ? 0.4 : 0.15,
              weight: isSelected ? 3 : 2,
              dashArray: zone.status === 'planning' ? '5, 10' : null
            }}
            eventHandlers={{
              click: () => onZoneClick(zone)
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{zone.name}</strong>
                <br />
                <Text type="secondary">{zone.district}</Text>
                <br />
                <Text>Diện tích: {zone.area} ha</Text>
                <br />
                <Text>Công suất: {zone.capacity} tấn/năm</Text>
                <br />
                <Text>Số hộ tham gia: {zoneFarmers.length}</Text>
                <br />
                <Text>Tổng công suất hộ: {totalCapacity} tấn/năm</Text>
                <br />
                <Tag color={zone.status === 'active' ? 'green' : 'orange'}>
                  {zone.status === 'active' ? 'Hoạt động' : 'Đang quy hoạch'}
                </Tag>
              </div>
            </Popup>
          </Polygon>
        );
      })}

      {/* Hộ dân - CircleMarker */}
      {showFarmers && farmers.filter(f => f.coordinates && f.coordinates.length === 2).map(farmer => {
        const isSelectedZone = selectedZone?.id == farmer.zoneId;
        if (selectedZone && !isSelectedZone) return null;
        
        const color = getFarmerColor(farmer.capacity || 0);
        
        return (
          <CircleMarker
            key={farmer.id}
            center={farmer.coordinates}
            radius={getFarmerRadius(farmer.capacity)}
            pathOptions={{
              color: '#fff',
              fillColor: color,
              fillOpacity: 0.85,
              weight: 2
            }}
            eventHandlers={{
              click: () => onFarmerClick(farmer)
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{farmer.name}</strong>
                <br />
                <Text type="secondary">{farmer.address}</Text>
                <br />
                <Text>Điện thoại: {farmer.phone}</Text>
                <br />
                <Text>Công suất: <Text strong style={{ color }}>{farmer.capacity} tấn/năm</Text></Text>
                <br />
                <Text>Ngày tham gia: {farmer.joinedDate}</Text>
                <br />
                <Tag color={farmer.status === 'active' ? 'green' : 'default'}>
                  {farmer.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                </Tag>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Điểm thu gom - CircleMarker lớn hơn */}
      {showPoints && points.filter(p => p.coordinates && p.coordinates.length === 2).map(point => {
        const isSelectedZone = selectedZone?.id == point.zoneId;
        if (selectedZone && !isSelectedZone) return null;
        
        const fillColor = getPointColor(point);
        
        return (
          <CircleMarker
            key={point.id}
            center={point.coordinates}
            radius={14}
            pathOptions={{
              color: '#fff',
              fillColor: fillColor,
              fillOpacity: 0.9,
              weight: 3
            }}
            eventHandlers={{
              click: () => onPointClick(point)
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{point.name}</strong>
                <br />
                <Text type="secondary">{point.address}</Text>
                <br />
                <Text>Quản lý: {point.manager}</Text>
                <br />
                <Text>Điện thoại: {point.phone}</Text>
                <br />
                <Text>Công suất: {point.capacity} tấn</Text>
                <br />
                <Text>Tồn kho: <Text strong style={{ color: fillColor }}>{point.currentStock} tấn ({Math.round(point.currentStock / point.capacity * 100)}%)</Text></Text>
                <br />
                <Tag color={point.status === 'active' ? 'green' : 'orange'}>
                  {point.status === 'active' ? 'Hoạt động' : 'Đang quy hoạch'}
                </Tag>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

// Component Popup chi tiết
function DetailPanel({ selectedItem, type, onClose, allFarmers, allPoints, allZones, onFocusFarmer, onFocusPoint }) {
  const { t } = useTranslation();

  if (!selectedItem) return null;

  if (type === 'zone') {
    const zoneFarmers = allFarmers.filter(f => f.zoneId == selectedItem.id);
    const zonePoints = allPoints.filter(p => p.zoneId == selectedItem.id);
    
    return (
      <Card 
        className="detail-panel zone-detail"
        size="small"
        title={
          <Space>
            <EnvironmentOutlined />
            <span>{selectedItem.name}</span>
          </Space>
        }
        extra={<Button type="text" onClick={onClose}>{t('map.close')}</Button>}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Statistic 
              title="Diện tích" 
              value={selectedItem.area} 
              suffix="ha" 
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Công suất" 
              value={selectedItem.capacity} 
              suffix="tấn/năm" 
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Text type="secondary">{selectedItem.district}</Text>
          </Col>
        </Row>
        
        <div style={{ marginTop: 16 }}>
          <Text strong>{t('map.farmers')}: {zoneFarmers.length}</Text>
          <Table
            size="small"
            dataSource={zoneFarmers}
            columns={[
              { 
                title: 'Tên', 
                dataIndex: 'name', 
                key: 'name',
                render: (val, record) => (
                  <a 
                    onClick={() => onFocusFarmer && onFocusFarmer(record)}
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                  >
                    {val}
                  </a>
                )
              },
              { title: 'Công suất', dataIndex: 'capacity', key: 'capacity', 
                render: (val) => `${val} tấn` 
              },
              { title: 'Trạng thái', dataIndex: 'status', key: 'status',
                render: (val) => (
                  <Tag color={val === 'active' ? 'green' : 'default'}>
                    {val === 'active' ? t('map.active') : t('map.inactive')}
                  </Tag>
                )
              }
            ]}
            rowKey="id"
            pagination={false}
            style={{ marginTop: 8 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <Text strong>{t('map.collectionPoints')}: {zonePoints.length}</Text>
        </div>
      </Card>
    );
  }

  if (type === 'farmer') {
    const zone = allZones.find(z => z.id === selectedItem.zoneId);
    
    return (
      <Card 
        className="detail-panel farmer-detail"
        size="small"
        title={
          <Space>
            <TeamOutlined />
            <span>{selectedItem.name}</span>
          </Space>
        }
        extra={<Button type="text" onClick={onClose}>{t('map.close')}</Button>}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Text>{selectedItem.address}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Text type="secondary">{t('map.phone')}: {selectedItem.phone}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">{t('map.joinedDate')}: {selectedItem.joinedDate}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Statistic 
              title={t('map.capacity')} 
              value={selectedItem.capacity} 
              suffix="tấn/năm" 
            />
          </Col>
          <Col span={12}>
            <Tag color={selectedItem.status === 'active' ? 'green' : 'default'} style={{ marginTop: 24 }}>
              {selectedItem.status === 'active' ? t('map.active') : t('map.inactive')}
            </Tag>
          </Col>
        </Row>
        {zone && (
          <Row style={{ marginTop: 8 }}>
            <Col>
              <Text type="secondary">{t('map.zone')}: {zone.name}</Text>
            </Col>
          </Row>
        )}
      </Card>
    );
  }

  if (type === 'point') {
    const zone = allZones.find(z => z.id === selectedItem.zoneId);
    const stockPercent = Math.round((selectedItem.currentStock / selectedItem.capacity) * 100);
    
    return (
      <Card 
        className="detail-panel point-detail"
        size="small"
        title={
          <Space>
            <InboxOutlined />
            <span>{selectedItem.name}</span>
          </Space>
        }
        extra={<Button type="text" onClick={onClose}>{t('map.close')}</Button>}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Text>{selectedItem.address}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Text type="secondary">{t('map.manager')}: {selectedItem.manager}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">{t('map.phone')}: {selectedItem.phone}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Statistic 
              title={t('map.capacity')} 
              value={selectedItem.capacity} 
              suffix="tấn" 
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title={t('map.currentStock')} 
              value={selectedItem.currentStock} 
              suffix={`(${stockPercent}%)`}
              valueStyle={{ color: stockPercent > 80 ? '#ff4d4f' : stockPercent > 50 ? '#faad14' : '#52c41a' }}
            />
          </Col>
        </Row>
        {zone && (
          <Row style={{ marginTop: 8 }}>
            <Col>
              <Text type="secondary">{t('map.zone')}: {zone.name}</Text>
            </Col>
          </Row>
        )}
        <Row style={{ marginTop: 8 }}>
          <Col>
            <Tag color={selectedItem.status === 'active' ? 'green' : 'orange'}>
              {selectedItem.status === 'active' ? t('map.active') : t('map.planning')}
            </Tag>
          </Col>
        </Row>
      </Card>
    );
  }

  return null;
}

// Component thống kê tổng quan
function StatsPanel({ stats }) {
  const { t } = useTranslation();

  return (
    <Card className="stats-panel" size="small">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Statistic 
            title={<><EnvironmentOutlined /> {t('map.zones')}</>}
            value={stats.totalZones}
            suffix={<Text type="success">({stats.activeZones} {t('map.active')})</Text>}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic 
            title={<><TeamOutlined /> {t('map.farmers')}</>}
            value={stats.totalFarmers}
            suffix={<Text type="success">({stats.activeFarmers} {t('map.active')})</Text>}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic 
            title={<><HomeOutlined /> {t('map.farmerCapacity')}</>}
            value={stats.totalFarmerCapacity}
            suffix="tấn/năm"
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic 
            title={<><InboxOutlined /> {t('map.collectionPoints')}</>}
            value={stats.totalCollectionPoints}
            suffix={<Text type="success">({stats.activePoints} {t('map.active')})</Text>}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic 
            title={<><InboxOutlined /> {t('map.totalStock')}</>}
            value={stats.totalStock}
            suffix={`/ ${stats.totalStockCapacity} tấn`}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic 
            title={t('map.stockRate')}
            value={Math.round((stats.totalStock / stats.totalStockCapacity) * 100) || 0}
            suffix="%"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
    </Card>
  );
}

// Component Legend
function MapLegend({ showZones, showFarmers, showPoints, setShowZones, setShowFarmers, setShowPoints }) {
  const { t } = useTranslation();

  return (
    <Card className="map-legend" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong>{t('map.layers')}</Text>
        <Flex gap={8} wrap="wrap">
          <Tag.CheckableTag 
            checked={showZones} 
            onChange={(checked) => setShowZones(checked)}
            color="green"
          >
            <EnvironmentOutlined /> {t('map.zones')}
          </Tag.CheckableTag>
          <Tag.CheckableTag 
            checked={showFarmers} 
            onChange={(checked) => setShowFarmers(checked)}
            color="blue"
          >
            <TeamOutlined /> {t('map.farmers')}
          </Tag.CheckableTag>
          <Tag.CheckableTag 
            checked={showPoints} 
            onChange={(checked) => setShowPoints(checked)}
            color="gold"
          >
            <InboxOutlined /> {t('map.collectionPoints')}
          </Tag.CheckableTag>
        </Flex>
        
        <div className="legend-items">
          <Text strong style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>{t('map.zones')}</Text>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#52c41a', opacity: 0.3 }}></span>
            <span>{t('map.activeZone')}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#faad14', opacity: 0.3, borderStyle: 'dashed' }}></span>
            <span>{t('map.planningZone')}</span>
          </div>
          
          <Text strong style={{ fontSize: 12, marginTop: 12, marginBottom: 8, display: 'block' }}>{t('map.farmers')}</Text>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#722ed1' }}></span>
            <span>{t('map.largeFarmer')} (≥15 tấn)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#1890ff' }}></span>
            <span>{t('map.mediumFarmer')} (10-14 tấn)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#52c41a' }}></span>
            <span>{t('map.smallFarmer')} (&lt;10 tấn)</span>
          </div>
          
          <Text strong style={{ fontSize: 12, marginTop: 12, marginBottom: 8, display: 'block' }}>{t('map.collectionPoints')}</Text>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#52c41a', borderRadius: '50%' }}></span>
            <span>{t('map.lowStock')} (&lt;50%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#faad14', borderRadius: '50%' }}></span>
            <span>{t('map.mediumStock')} (50-80%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#f5222d', borderRadius: '50%' }}></span>
            <span>{t('map.highStock')} (≥80%)</span>
          </div>
        </div>
      </Space>
    </Card>
  );
}

// Component filter panel
function FilterPanel({ zones, selectedZone, setSelectedZone, setFocusLocation, viewMode, setViewMode, mapType, setMapType }) {
  const { t } = useTranslation();

  return (
    <Card className="filter-panel" size="small">
      <Space direction="vertical" style={{ width: '100%' }} gap={12}>
        <Text strong style={{ fontSize: 13, color: '#333' }}>
          <FilterOutlined style={{ marginRight: 6 }} /> 
          {t('map.filter')}
        </Text>
        
        {/* Map Type Selector */}
        <Segmented
          block
          size="small"
          options={[
            { 
              value: 'standard', 
              label: (
                <span><GlobalOutlined /> {t('map.mapTypeStandard') || 'Standard'}</span>
              ) 
            },
            { 
              value: 'satellite', 
              label: (
                <span><GlobalOutlined /> {t('map.mapTypeSatellite') || 'Vệ tinh'}</span>
              )
            },
            { 
              value: 'terrain', 
              label: (
                <span><GlobalOutlined /> Địa hình</span>
              )
            }
          ]}
          value={mapType}
          onChange={(value) => setMapType(value)}
        />
        
        <Select
          style={{ width: '100%' }}
          placeholder={t('map.selectZone')}
          allowClear
          size="middle"
          value={selectedZone?.id}
          onChange={(value) => {
            const zone = zones.find(z => z.id === value);
            setSelectedZone(zone || null);
            // Zoom to selected zone
            if (zone && zone.polygon && zone.polygon.length > 0) {
              setFocusLocation({ 
                coordinates: zone.polygon[0],
                zoom: 12,
                zonePolygon: zone.polygon
              });
            } else {
              setFocusLocation(null);
            }
          }}
          options={zones.map(zone => ({
            value: zone.id,
            label: (
              <Space size={4}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: zone.status === 'active' ? '#52c41a' : '#faad14',
                  display: 'inline-block',
                  flexShrink: 0
                }} />
                <span style={{ fontSize: 13 }}>{zone.name}</span>
              </Space>
            )
          }))}
        />

        <Segmented
          block
          size="middle"
          options={[
            { 
              value: 'all', 
              label: (
                <span><TeamOutlined /> {t('map.viewAll')}</span>
              ) 
            },
            { 
              value: 'zones', 
              label: (
                <span><EnvironmentOutlined /> {t('map.viewZones')}</span>
              ) 
            },
            { 
              value: 'farmers', 
              label: (
                <span><HomeOutlined /> {t('map.viewFarmers')}</span>
              ) 
            },
            { 
              value: 'points', 
              label: (
                <span><InboxOutlined /> {t('map.viewPoints')}</span>
              ) 
            }
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value)}
        />
      </Space>
    </Card>
  );
}

// Main Page Component
export default function MapPage() {
  const { t, i18n } = useTranslation();
  const { zones = [], farmers = [], points = [], loading, error } = useMaterialData();
  const [showZones, setShowZones] = useState(true);
  const [showFarmers, setShowFarmers] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [mapType, setMapType] = useState('standard'); // 'standard', 'satellite', 'terrain'
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [focusLocation, setFocusLocation] = useState(null);
  const [isClickingMarker, setIsClickingMarker] = useState(false);
  const [stats, setStats] = useState({
    totalZones: 0,
    activeZones: 0,
    totalCapacity: 0,
    totalFarmers: 0,
    activeFarmers: 0,
    totalFarmerCapacity: 0,
    totalCollectionPoints: 0,
    activePoints: 0,
    totalStock: 0,
    totalStockCapacity: 0
  });

  // Khi đổi filter (chọn vùng từ dropdown), zoom đến vùng đó
  // Chỉ clear focusLocation khi người dùng bỏ chọn vùng (clear filter)
  useEffect(() => {
    if (selectedZone && selectedZone.polygon && selectedZone.polygon.length > 0) {
      // Nếu đã có selectedZone thì giữ nguyên focus (đã được set từ FilterPanel hoặc click)
    }
  }, [selectedZone]);

  // Update stats when data changes (dùng mảng an toàn)
  useEffect(() => {
    const z = Array.isArray(zones) ? zones : [];
    const f = Array.isArray(farmers) ? farmers : [];
    const p = Array.isArray(points) ? points : [];
    setStats({
      totalZones: z.length,
      activeZones: z.filter(zone => zone && zone.status === 'active').length,
      totalCapacity: z.reduce((sum, zone) => sum + (zone && zone.capacity || 0), 0),
      totalFarmers: f.length,
      activeFarmers: f.filter(farmer => farmer && farmer.status === 'active').length,
      totalFarmerCapacity: f.reduce((sum, farmer) => sum + (farmer && farmer.capacity || 0), 0),
      totalCollectionPoints: p.length,
      activePoints: p.filter(pt => pt && pt.status === 'active').length,
      totalStock: p.reduce((sum, pt) => sum + (pt && pt.currentStock || 0), 0),
      totalStockCapacity: p.reduce((sum, pt) => sum + (pt && pt.capacity || 0), 0)
    });
  }, [zones, farmers, points]);

  // Filter data based on view mode and selected zone
  const getFilteredData = () => {
    const safeZones = Array.isArray(zones) ? zones : [];
    const safeFarmers = Array.isArray(farmers) ? farmers : [];
    const safePoints = Array.isArray(points) ? points : [];
    // Lọc bỏ các vùng đã bị xóa (soft delete) - chỉ khi có trường deleted
    let filteredZones = safeZones.filter(z => z && z.deleted !== true);
    let filteredFarmers = safeFarmers.filter(f => f && f.deleted !== true);
    let filteredPoints = safePoints.filter(p => p && p.deleted !== true);

    // Filter by selected zone (use == for type coercion since zoneId might be string or number)
    if (selectedZone) {
      const zoneId = selectedZone.id;
      filteredZones = filteredZones.filter(z => z.id == zoneId);
      filteredFarmers = filteredFarmers.filter(f => f.zoneId == zoneId);
      filteredPoints = filteredPoints.filter(p => p.zoneId == zoneId);
    }

    // Filter by view mode
    if (viewMode === 'zones') {
      filteredFarmers = [];
      filteredPoints = [];
    } else if (viewMode === 'farmers') {
      filteredZones = [];
      filteredPoints = [];
    } else if (viewMode === 'points') {
      filteredZones = [];
      filteredFarmers = [];
    }

    return { zones: filteredZones, farmers: filteredFarmers, points: filteredPoints };
  };

  const filteredData = getFilteredData();

  // Calculate stats for filtered data
  const getFilteredStats = () => {
    const { zones, farmers, points } = filteredData;
    
    return {
      totalZones: zones.length,
      activeZones: zones.filter(z => z.status === 'active').length,
      totalCapacity: zones.reduce((sum, z) => sum + (z.capacity || 0), 0),
      totalFarmers: farmers.length,
      activeFarmers: farmers.filter(f => f.status === 'active').length,
      totalFarmerCapacity: farmers.reduce((sum, f) => sum + (f.capacity || 0), 0),
      totalCollectionPoints: points.length,
      activePoints: points.filter(p => p.status === 'active').length,
      totalStock: points.reduce((sum, p) => sum + (p.currentStock || 0), 0),
      totalStockCapacity: points.reduce((sum, p) => sum + (p.capacity || 0), 0)
    };
  };

  const filteredStats = getFilteredStats();

  // Loading state
  if (loading) {
    return (
      <div className="map-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip={t('map.loading') || 'Đang tải dữ liệu...'} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="map-page" style={{ padding: '24px' }}>
        <Result
          status="error"
          title={t('map.error') || 'Lỗi tải dữ liệu'}
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              {t('map.retry') || 'Thử lại'}
            </Button>
          }
        />
      </div>
    );
  }

  // No data state (dùng safe check)
  const hasData = (Array.isArray(zones) && zones.length > 0) || (Array.isArray(farmers) && farmers.length > 0) || (Array.isArray(points) && points.length > 0);
  if (!hasData) {
    return (
      <div className="map-page" style={{ padding: '24px' }}>
        <Result
          status="info"
          title={t('map.noData') || 'Chưa có dữ liệu'}
          subTitle={t('map.noDataDesc') || 'Chưa có dữ liệu vùng nguyên liệu. Vui lòng thêm dữ liệu từ trang quản trị.'}
        />
      </div>
    );
  }

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setSelectedFarmer(null);
    setSelectedPoint(null);
    setIsClickingMarker(true);
    setTimeout(() => setIsClickingMarker(false), 1000);
    
    // Zoom vào vùng zone (fit bounds)
    if (zone && zone.polygon && zone.polygon.length > 0) {
      setFocusLocation({ 
        coordinates: zone.polygon[0],
        zoom: 12,
        zonePolygon: zone.polygon
      });
    }
  };

  const handleFarmerClick = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedPoint(null);
    // Không setSelectedZone(null) để giữ nguyên filter vùng
    setIsClickingMarker(true);
    setTimeout(() => setIsClickingMarker(false), 1000);
    
    // Zoom vào vị trí farmer
    if (farmer && farmer.coordinates && farmer.coordinates.length === 2) {
      setFocusLocation({ coordinates: farmer.coordinates, zoom: 15 });
    }
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    setSelectedFarmer(null);
    // Không setSelectedZone(null) để giữ nguyên filter vùng
    setIsClickingMarker(true);
    setTimeout(() => setIsClickingMarker(false), 1000);
    
    // Zoom vào vị trí điểm thu gom
    if (point && point.coordinates && point.coordinates.length === 2) {
      setFocusLocation({ coordinates: point.coordinates, zoom: 15 });
    }
  };

  const handleClearSelection = () => {
    setSelectedZone(null);
    setSelectedFarmer(null);
    setSelectedPoint(null);
    setFocusLocation(null); // Reset zoom position when clearing selection
  };

  const handleFocusFarmer = (farmer) => {
    if (farmer && farmer.coordinates && farmer.coordinates.length === 2) {
      setFocusLocation({ coordinates: farmer.coordinates, zoom: 15 });
      // Giữ nguyên selectedZone để filter không bị mất
    }
  };

  const handleFocusPoint = (point) => {
    if (point && point.coordinates && point.coordinates.length === 2) {
      setFocusLocation({ coordinates: point.coordinates, zoom: 15 });
      // Giữ nguyên selectedZone để filter không bị mất
    }
  };

  return (
    <div className="map-page">
      <div className="map-title-header">
        <Title level={3} style={{ margin: 0 }}>
          <EnvironmentOutlined /> {t('map.title')}
        </Title>
        <Text type="secondary">{t('map.subtitle')}</Text>
      </div>

      <StatsPanel stats={viewMode === 'all' ? stats : filteredStats} />

      <Row gutter={16} className="map-content">
        <Col xs={24} lg={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <FilterPanel 
              zones={Array.isArray(zones) ? zones : []}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              setFocusLocation={setFocusLocation}
              viewMode={viewMode}
              setViewMode={setViewMode}
              mapType={mapType}
              setMapType={setMapType}
            />
            
            <MapLegend 
              showZones={showZones}
              showFarmers={showFarmers}
              showPoints={showPoints}
              setShowZones={setShowZones}
              setShowFarmers={setShowFarmers}
              setShowPoints={setShowPoints}
            />
          </Space>
        </Col>
        
        <Col xs={24} lg={18}>
          <Card className="map-card" bodyStyle={{ padding: 0, height: '100%' }}>
            <div style={{ height: '100%' }}>
              <MaterialMap 
                zones={filteredData.zones}
                farmers={filteredData.farmers}
                points={filteredData.points}
                showZones={showZones}
                showFarmers={showFarmers}
                showPoints={showPoints}
                selectedZone={selectedZone}
                onZoneClick={handleZoneClick}
                onFarmerClick={handleFarmerClick}
                onPointClick={handlePointClick}
                viewMode={viewMode}
                focusLocation={focusLocation}
                onFocusComplete={() => {}}
                mapType={mapType}
                isClickingMarker={isClickingMarker}
              />
            </div>
          </Card>

          {(selectedZone || selectedFarmer || selectedPoint) && (
            <div className="detail-panel-container">
              {selectedZone && (
                <DetailPanel 
                  selectedItem={selectedZone} 
                  type="zone" 
                  onClose={handleClearSelection}
                  allFarmers={farmers}
                  allPoints={points}
                  allZones={zones}
                  onFocusFarmer={handleFocusFarmer}
                  onFocusPoint={handleFocusPoint}
                />
              )}
              {selectedFarmer && (
                <DetailPanel 
                  selectedItem={selectedFarmer} 
                  type="farmer" 
                  onClose={handleClearSelection}
                  allFarmers={farmers}
                  allPoints={points}
                  allZones={zones}
                  onFocusFarmer={handleFocusFarmer}
                  onFocusPoint={handleFocusPoint}
                />
              )}
              {selectedPoint && (
                <DetailPanel 
                  selectedItem={selectedPoint} 
                  type="point" 
                  onClose={handleClearSelection}
                  allFarmers={farmers}
                  allPoints={points}
                  allZones={zones}
                  onFocusFarmer={handleFocusFarmer}
                  onFocusPoint={handleFocusPoint}
                />
              )}
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}
