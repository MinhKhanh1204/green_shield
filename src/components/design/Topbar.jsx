import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { UndoOutlined, RedoOutlined, EyeOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.png';
import logolg from '../../assets/logo-lg.png';

export default function Topbar({
  templateName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onOrder,
  onBack,
}) {
  return (
    <header className="design-topbar">
      <div className="design-topbar-left">
        <button className="design-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <Link to="/" className="design-brand-link">
          <img src={logo} alt="GreenShield logo" width="22" height="22" />
          <img src={logolg} alt="GreenShield" className="design-brand-wordmark" />
        </Link>
        <div className="design-topbar-meta">
          <span className="design-topbar-name">{templateName}</span>
          <span className="design-topbar-saved">
            <span className="saved-dot" />
            Da luu
          </span>
        </div>
      </div>

      <div className="design-topbar-center">
        <span className="design-lab-badge">Design Lab</span>
      </div>

      <div className="design-topbar-right">
        <Tooltip title="Undo (Ctrl+Z)"><button className="design-icon-btn" disabled={!canUndo} onClick={onUndo}><UndoOutlined /></button></Tooltip>
        <Tooltip title="Redo (Ctrl+Y)"><button className="design-icon-btn" disabled={!canRedo} onClick={onRedo}><RedoOutlined /></button></Tooltip>
        <div className="design-topbar-divider" />
        <button className="design-preview-ghost-btn" onClick={onPreview}>
          <EyeOutlined /> Preview
        </button>
        <button className="design-next-btn" onClick={onOrder}>
          Dat hang
        </button>
      </div>
    </header>
  );
}
