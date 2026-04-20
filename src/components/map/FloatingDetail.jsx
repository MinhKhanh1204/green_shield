import React, { memo, useRef } from 'react';
import { Progress, Tag } from 'antd';
import {
  EnvironmentOutlined,
  InboxOutlined,
  PushpinFilled,
  PushpinOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function toNumber(value) {
  return Number(value) || 0;
}

function getStockColor(percent) {
  if (percent >= 80) return 'var(--color-danger)';
  if (percent >= 50) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function buildMeta(item, type, t) {
  if (type === 'region') {
    const capacity = toNumber(item.capacity);
    return {
      icon: <EnvironmentOutlined />,
      location: item.district || '-',
      stats: [
        { label: t('map.capacity'), value: `${capacity} ${t('map.tonPerYear')}` },
        { label: t('map.area'), value: `${toNumber(item.area)} ha` },
        { label: t('map.status'), value: item.status === 'active' ? t('map.active') : t('map.planning') }
      ],
      progress: [
        { label: t('map.operationalLevel'), value: item.status === 'active' ? 85 : 35 },
        { label: t('map.efficiency'), value: Math.min(100, Math.round((capacity / Math.max(capacity, 140)) * 100)) }
      ],
      statusColor: item.status === 'active' ? 'green' : 'gold'
    };
  }

  if (type === 'farmer') {
    const capacity = toNumber(item.capacity);
    return {
      icon: <TeamOutlined />,
      location: item.address || '-',
      stats: [
        { label: t('map.capacity'), value: `${capacity} ${t('map.tonPerYear')}` },
        { label: t('map.phone'), value: item.phone || '-' },
        { label: t('map.status'), value: item.status === 'active' ? t('map.active') : t('map.inactive') }
      ],
      progress: [
        { label: t('map.outputUsage'), value: Math.min(100, Math.round((capacity / Math.max(capacity, 20)) * 100)) },
        { label: t('map.stability'), value: item.status === 'active' ? 90 : 45 }
      ],
      statusColor: item.status === 'active' ? 'green' : 'default'
    };
  }

  const stock = toNumber(item.currentStock);
  const capacity = toNumber(item.capacity);
  const stockRate = capacity ? Math.round((stock / capacity) * 100) : 0;

  return {
    icon: <InboxOutlined />,
    location: item.address || '-',
    stats: [
      { label: t('map.capacity'), value: `${capacity} ${t('map.ton')}` },
      { label: t('map.currentStock'), value: `${stock} ${t('map.ton')}` },
      { label: t('map.manager'), value: item.manager || '-' }
    ],
    progress: [
      { label: t('map.stockUsage'), value: stockRate, color: getStockColor(stockRate) },
      { label: t('map.efficiency'), value: Math.min(100, Math.round((stockRate + 20) * 0.9)), color: 'var(--color-primary)' }
    ],
    statusColor: stockRate >= 80 ? 'red' : stockRate >= 50 ? 'gold' : 'green'
  };
}

function nextStateBySwipe(current, deltaY, durationMs) {
  const absDelta = Math.abs(deltaY);
  const isFlick = durationMs < 220 && absDelta >= 24;
  const expandThreshold = isFlick ? 24 : 46;
  const collapseThreshold = isFlick ? 26 : 52;

  if (deltaY <= -expandThreshold) {
    if (current === 'collapsed') return 'half';
    if (current === 'half') return 'full';
  }

  if (deltaY >= collapseThreshold) {
    if (current === 'full') return 'half';
    if (current === 'half') return 'collapsed';
  }

  return current;
}

function FloatingDetail({
  item,
  type,
  onClose,
  isMobile = false,
  visible = true,
  sheetState = 'half',
  onSheetStateChange,
  pinned = false,
  onPinnedChange,
}) {
  const { t } = useTranslation();
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);

  if (!item || !type) return null;

  const meta = buildMeta(item, type, t);
  const detailClass = isMobile
    ? `floating-card floating-detail floating-detail-sheet floating-detail-sheet-${sheetState} ${visible ? 'is-visible' : 'is-hidden'}`
    : `floating-card floating-detail ${visible ? 'is-visible' : 'is-hidden'}`;

  const onTouchStart = (event) => {
    if (!isMobile) return;
    touchStartYRef.current = event.changedTouches?.[0]?.clientY || 0;
    touchStartTimeRef.current = Date.now();
  };

  const onTouchEnd = (event) => {
    if (!isMobile) return;
    const endY = event.changedTouches?.[0]?.clientY || 0;
    const duration = Math.max(1, Date.now() - touchStartTimeRef.current);
    const deltaY = endY - touchStartYRef.current;
    const next = nextStateBySwipe(sheetState, deltaY, duration);
    if (next !== sheetState) onSheetStateChange?.(next);
    if (next === 'collapsed' && deltaY >= 120) onClose?.();
  };

  return (
    <article className={detailClass} aria-live="polite">
      {isMobile ? (
        <div
          className="detail-sheet-grabber"
          role="button"
          tabIndex={0}
          aria-label={t('map.detailSheetHandle')}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => onSheetStateChange?.(sheetState === 'collapsed' ? 'half' : 'full')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSheetStateChange?.(sheetState === 'collapsed' ? 'half' : 'full');
            }
          }}
        >
          <span className="detail-sheet-bar" />
        </div>
      ) : null}

      <header>
        <div className="detail-title-block">
          <span className="detail-icon">{meta.icon}</span>
          <div>
            <h4>{item.name}</h4>
            <p>{meta.location}</p>
          </div>
        </div>
        <div className="detail-header-actions">
          {isMobile ? (
            <button
              type="button"
              className="detail-pin-btn"
              onClick={() => onPinnedChange?.(!pinned)}
              aria-label={pinned ? t('map.unpinPanel') : t('map.pinPanel')}
              title={pinned ? t('map.unpinPanel') : t('map.pinPanel')}
            >
              {pinned ? <PushpinFilled /> : <PushpinOutlined />}
            </button>
          ) : null}
          <button type="button" onClick={onClose} aria-label={t('map.close')}>
            x
          </button>
        </div>
      </header>

      {isMobile && sheetState === 'collapsed' ? (
        <div className="detail-collapsed-mini">
          <span>{meta.stats[0]?.label}</span>
          <strong>{meta.stats[0]?.value}</strong>
        </div>
      ) : null}

      <div className="detail-stats-grid" hidden={isMobile && sheetState === 'collapsed'}>
        {meta.stats.map((stat) => (
          <div key={stat.label} className="detail-stat-box">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="detail-progress-list" hidden={isMobile && sheetState !== 'full'}>
        {meta.progress.map((bar) => (
          <div key={bar.label} className="detail-progress-item">
            <div className="detail-progress-head">
              <span>{bar.label}</span>
              <b>{bar.value}%</b>
            </div>
            <Progress
              percent={bar.value}
              showInfo={false}
              size="small"
              strokeColor={bar.color || 'var(--color-primary)'}
              trailColor="rgba(1, 50, 55, 0.1)"
            />
          </div>
        ))}
      </div>

      <Tag color={meta.statusColor} className="detail-status-tag" hidden={isMobile && sheetState === 'collapsed'}>
        {type === 'region'
          ? item.status === 'active'
            ? t('map.activeRegion')
            : t('map.planningRegion')
          : t('map.operationalStatus')}
      </Tag>
    </article>
  );
}

export default memo(FloatingDetail);
