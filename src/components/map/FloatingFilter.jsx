import React, { memo, useMemo } from 'react';
import { Button, Select, Space, Tooltip } from 'antd';
import { EnvironmentOutlined, FilterOutlined, HomeOutlined, InboxOutlined, LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MAP_STYLES } from './mapTheme';

function FloatingFilter({
  collapsed,
  onToggle,
  zones,
  selectedZoneId,
  onSelectZone,
  mapStyle,
  onMapStyleChange,
  visibility,
  onVisibilityChange
}) {
  const { t } = useTranslation();

  const zoneOptions = useMemo(
    () => [
      { value: '', label: t('map.viewAll') },
      ...zones.map((zone) => ({
        value: String(zone.id),
        label: zone.name
      }))
    ],
    [zones, t]
  );

  const mapStyleOptions = useMemo(
    () =>
      Object.values(MAP_STYLES).map((style) => ({
        value: style.id,
        label: t(style.labelKey, { defaultValue: style.label })
      })),
    [t]
  );

  const legendGroups = [
    {
      title: t('map.zones'),
      items: [
        { cls: 'legend-swatch region-active', label: `${t('map.activeZone')} (${t('map.capacity')})` },
        { cls: 'legend-swatch region-planning', label: `${t('map.planningZone')} (${t('map.capacity')})` }
      ]
    },
    {
      title: t('map.farmers'),
      items: [
        { cls: 'legend-dot farmer-large', label: `${t('map.largeFarmer')} (>=15)` },
        { cls: 'legend-dot farmer-medium', label: `${t('map.mediumFarmer')} (10-14)` },
        { cls: 'legend-dot farmer-small', label: `${t('map.smallFarmer')} (<10)` }
      ]
    },
    {
      title: t('map.collectionPoints'),
      items: [
        { cls: 'legend-square point-low', label: `${t('map.lowStock')} (<50%)` },
        { cls: 'legend-square point-medium', label: `${t('map.mediumStock')} (50-79%)` },
        { cls: 'legend-square point-high', label: `${t('map.highStock')} (>=80%)` }
      ]
    }
  ];

  if (collapsed) {
    return (
      <section
        className="floating-card floating-filter floating-filter-collapsed"
        aria-label={t('map.filterCollapsed', { defaultValue: 'Map filters collapsed' })}
      >
        <Tooltip title={t('map.filter')} placement="right">
          <Button
            type="text"
            shape="circle"
            icon={<FilterOutlined />}
            className="floating-filter-collapse-button"
            onClick={onToggle}
          />
        </Tooltip>
      </section>
    );
  }

  return (
    <section
      className="floating-card floating-filter"
      aria-label={t('map.filterAndLegend', { defaultValue: 'Map filters and legend' })}
    >
      <div className="floating-filter-head">
        <Space>
          <FilterOutlined />
          <strong>{t('map.filter')}</strong>
        </Space>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={onToggle}
          aria-label={t('map.collapse', { defaultValue: 'Collapse filter' })}
        />
      </div>

      <div className="floating-filter-body">
        <label className="stagger-item">{t('map.selectZone')}</label>
        <Select
          value={selectedZoneId}
          onChange={onSelectZone}
          options={zoneOptions}
          size="middle"
          className="map-select stagger-item"
          popupMatchSelectWidth={false}
        />

        <label className="stagger-item">{t('map.basemap', { defaultValue: 'Basemap' })}</label>
        <Select
          value={mapStyle}
          onChange={onMapStyleChange}
          options={mapStyleOptions}
          size="middle"
          className="map-select stagger-item"
          popupMatchSelectWidth={false}
        />

        <label className="stagger-item">{t('map.layers')}</label>
        <div className="layer-chip-row stagger-item">
          <Button
            size="small"
            icon={<EnvironmentOutlined />}
            className={`layer-chip ${visibility.region ? 'active' : ''}`}
            onClick={() => onVisibilityChange('region', !visibility.region)}
          >
            {t('map.viewZones')}
          </Button>
          <Button
            size="small"
            icon={<HomeOutlined />}
            className={`layer-chip ${visibility.farmers ? 'active' : ''}`}
            onClick={() => onVisibilityChange('farmers', !visibility.farmers)}
          >
            {t('map.viewFarmers')}
          </Button>
          <Button
            size="small"
            icon={<InboxOutlined />}
            className={`layer-chip ${visibility.points ? 'active' : ''}`}
            onClick={() => onVisibilityChange('points', !visibility.points)}
          >
            {t('map.viewPoints')}
          </Button>
        </div>

        <div className="legend-inline stagger-item">
          {legendGroups.map((group) => (
            <div key={group.title} className="legend-group-block">
              <p className="legend-group-title">{group.title}</p>
              {group.items.map((item, index) => (
                <div key={`${item.label}-${index}`} className="legend-item">
                  <span className={item.cls} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(FloatingFilter);
