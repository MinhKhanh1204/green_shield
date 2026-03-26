import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

function FloatingLegend() {
  const { t } = useTranslation();

  return (
    <section className="floating-card floating-legend" aria-label="Map legend">
      <h4>{t('map.layers')}</h4>

      <div className="legend-group">
        <p>{t('map.zones')}</p>
        <div className="legend-item"><span className="legend-swatch region-active" />{t('map.activeZone')}</div>
        <div className="legend-item"><span className="legend-swatch region-planning" />{t('map.planningZone')}</div>
      </div>

      <div className="legend-group">
        <p>{t('map.farmers')}</p>
        <div className="legend-item"><span className="legend-dot farmer-large" />{t('map.largeFarmer')}</div>
        <div className="legend-item"><span className="legend-dot farmer-medium" />{t('map.mediumFarmer')}</div>
        <div className="legend-item"><span className="legend-dot farmer-small" />{t('map.smallFarmer')}</div>
      </div>

      <div className="legend-group">
        <p>{t('map.collectionPoints')}</p>
        <div className="legend-item"><span className="legend-square point-low" />{t('map.lowStock')}</div>
        <div className="legend-item"><span className="legend-square point-medium" />{t('map.mediumStock')}</div>
        <div className="legend-item"><span className="legend-square point-high" />{t('map.highStock')}</div>
      </div>
    </section>
  );
}

export default memo(FloatingLegend);
