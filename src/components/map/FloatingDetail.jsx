import React, { memo } from 'react';
import { Progress, Tag } from 'antd';
import { EnvironmentOutlined, InboxOutlined, TeamOutlined } from '@ant-design/icons';

function toNumber(value) {
  return Number(value) || 0;
}

function getStockColor(percent) {
  if (percent >= 80) return 'var(--color-danger)';
  if (percent >= 50) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function buildMeta(item, type) {
  if (type === 'region') {
    const capacity = toNumber(item.capacity);
    return {
      icon: <EnvironmentOutlined />,
      location: item.district || '-',
      stats: [
        { label: 'Capacity', value: `${capacity} tan/nam` },
        { label: 'Area', value: `${toNumber(item.area)} ha` },
        { label: 'Status', value: item.status === 'active' ? 'Active' : 'Planning' }
      ],
      progress: [
        { label: 'Operational level', value: item.status === 'active' ? 85 : 35 },
        { label: 'Efficiency', value: Math.min(100, Math.round((capacity / Math.max(capacity, 140)) * 100)) }
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
        { label: 'Capacity', value: `${capacity} tan/nam` },
        { label: 'Phone', value: item.phone || '-' },
        { label: 'Status', value: item.status === 'active' ? 'Active' : 'Inactive' }
      ],
      progress: [
        { label: 'Output usage', value: Math.min(100, Math.round((capacity / Math.max(capacity, 20)) * 100)) },
        { label: 'Stability', value: item.status === 'active' ? 90 : 45 }
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
      { label: 'Capacity', value: `${capacity} tan` },
      { label: 'Current stock', value: `${stock} tan` },
      { label: 'Manager', value: item.manager || '-' }
    ],
    progress: [
      { label: 'Stock usage', value: stockRate, color: getStockColor(stockRate) },
      { label: 'Efficiency', value: Math.min(100, Math.round((stockRate + 20) * 0.9)), color: 'var(--color-primary)' }
    ],
    statusColor: stockRate >= 80 ? 'red' : stockRate >= 50 ? 'gold' : 'green'
  };
}

function FloatingDetail({ item, type, onClose }) {
  if (!item || !type) return null;

  const meta = buildMeta(item, type);

  return (
    <article className="floating-card floating-detail" aria-live="polite">
      <header>
        <div className="detail-title-block">
          <span className="detail-icon">{meta.icon}</span>
          <div>
            <h4>{item.name}</h4>
            <p>{meta.location}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close detail">
          x
        </button>
      </header>

      <div className="detail-stats-grid">
        {meta.stats.map((stat) => (
          <div key={stat.label} className="detail-stat-box">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="detail-progress-list">
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

      <Tag color={meta.statusColor} className="detail-status-tag">
        {type === 'region' ? (item.status === 'active' ? 'Active region' : 'Planning region') : 'Operational status'}
      </Tag>
    </article>
  );
}

export default memo(FloatingDetail);
