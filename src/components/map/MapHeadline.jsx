import React, { memo, useMemo } from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';

function MapHeadline({ stats }) {
  const { t } = useTranslation();

  const insight = useMemo(() => {
    const stockRate = Number(stats?.stockRate || 0);

    if (stockRate >= 80) {
      return {
        tone: 'error',
        text: t('map.insightHigh')
      };
    }

    if (stockRate >= 50) {
      return {
        tone: 'warning',
        text: t('map.insightMedium')
      };
    }

    return {
      tone: 'success',
      text: t('map.insightLow')
    };
  }, [stats, t]);

  return (
    <section className="map-headline" aria-label="Map headline and context">
      <div className="map-headline-copy">
        <h1>{t('map.title')}</h1>
        <p>{t('map.subtitle')}</p>
      </div>

      <div className="map-headline-actions">
        <Tag className={`map-insight-tag ${insight.tone}`}>{insight.text}</Tag>
      </div>
    </section>
  );
}

export default memo(MapHeadline);
