import React, { memo } from 'react';
import { Progress } from 'antd';
import { DatabaseOutlined, TeamOutlined, InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function getStockTone(percent) {
  if (percent >= 80) return { color: 'var(--color-danger)', className: 'stock-danger' };
  if (percent >= 50) return { color: 'var(--color-warning)', className: 'stock-warning' };
  return { color: 'var(--color-success)', className: 'stock-success' };
}

function trendFromPercent(value, invert = false) {
  const magnitude = Math.max(2, Math.min(18, Math.round((Number(value) || 0) / 8)));
  const positive = invert ? value < 60 : value >= 50;

  return {
    arrow: positive ? '↑' : '↓',
    value: `${magnitude}%`,
    className: positive ? 'trend-up' : 'trend-down'
  };
}

function FloatingOverview({ stats }) {
  const { t, i18n } = useTranslation();

  const formatNumber = (value) => new Intl.NumberFormat(i18n.language || 'vi-VN').format(Number(value) || 0);

  const capacityPercent = Math.min(
    100,
    Math.round((Number(stats.totalFarmerCapacity || 0) / Math.max(Number(stats.totalFarmerCapacity || 0), 220)) * 100)
  );

  const stockPercent = Number(stats.stockRate || 0);
  const stockTone = getStockTone(stockPercent);
  const activeFarmerRate = stats.totalFarmers
    ? Math.round((Number(stats.activeFarmers || 0) / Number(stats.totalFarmers)) * 100)
    : 0;
  const stockTrend = trendFromPercent(stockPercent, true);
  const farmerTrend = trendFromPercent(activeFarmerRate);
  const capacityTrend = trendFromPercent(capacityPercent);

  return (
    <section className="floating-card floating-overview" aria-label="Overview metrics">
      <div className="floating-overview-grid">
        <article className="overview-widget overview-widget-primary">
          <div className="widget-header">
            <DatabaseOutlined />
            <span>{t('map.farmerCapacity')}</span>
          </div>
          <h3>{formatNumber(stats.totalFarmerCapacity)} {t('map.tonPerYear')}</h3>
          <p className={`kpi-trend ${capacityTrend.className}`}>{capacityTrend.arrow} {capacityTrend.value} {t('map.comparedToLastWeek')}</p>
          <Progress
            percent={capacityPercent}
            showInfo={false}
            size="small"
            strokeColor="var(--color-primary)"
            trailColor="rgba(1, 50, 55, 0.1)"
          />
        </article>

        <article className="overview-widget">
          <div className="widget-header">
            <InboxOutlined />
            <span>{t('map.totalStock')}</span>
          </div>
          <div className="widget-row">
            <h3>
              {formatNumber(stats.totalStock)} / {formatNumber(stats.totalStockCapacity)} {t('map.ton')}
            </h3>
            <Progress
              type="circle"
              size={62}
              percent={stockPercent}
              strokeColor={stockTone.color}
              trailColor="rgba(1, 50, 55, 0.1)"
            />
          </div>
          <p className={`kpi-trend ${stockTrend.className}`}>{stockTrend.arrow} {stockTrend.value} {t('map.comparedToLastWeek')}</p>
        </article>

        <article className="overview-widget">
          <div className="widget-header">
            <TeamOutlined />
            <span>{t('map.farmers')}</span>
          </div>
          <h3>
            {formatNumber(stats.totalFarmers)} <small>({formatNumber(stats.activeFarmers)} {t('map.active')})</small>
          </h3>
          <p className={`kpi-trend ${farmerTrend.className}`}>{farmerTrend.arrow} {farmerTrend.value} {t('map.participationRate')}</p>
          <Progress
            percent={activeFarmerRate}
            showInfo={false}
            size="small"
            strokeColor="var(--color-success)"
            trailColor="rgba(1, 50, 55, 0.1)"
          />
        </article>

        <article className={`overview-widget overview-widget-highlight ${stockTone.className}`}>
          <p>{t('map.stockRate')}</p>
          <h2>{stockPercent}%</h2>
          <span>{t('map.collectionPoints')}: {formatNumber(stats.totalCollectionPoints)}</span>
          <small>{stockPercent >= 70 ? t('map.highStockAlert') : t('map.safeStockAlert')}</small>
        </article>
      </div>
    </section>
  );
}

export default memo(FloatingOverview);
