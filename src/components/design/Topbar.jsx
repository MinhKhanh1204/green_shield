import React from 'react';
import { Link } from 'react-router-dom';

export function Topbar({
  templateName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onOrder,
  onBack,
  themeMode,
  onToggleTheme,
}) {
  return (
    <header className="design-topbar">
      <div className="topbar-left">
        <button className="topbar-back-btn" onClick={onBack} aria-label="Quay lại">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <div className="design-meta">
          <div className="design-name">{templateName || 'Túi tote'}</div>
          <div className="design-status">
            <span className="dot" />
            Đã lưu
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="design-badge">
          <span className="material-symbols-rounded">auto_awesome</span>
          <span>Phòng thiết kế</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className={`icon-btn design-theme-btn theme-toggle${themeMode === 'dark' ? ' is-dark' : ''}`}
          onClick={onToggleTheme}
          aria-label={themeMode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title={themeMode === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb" />
            <span className="material-symbols-rounded theme-toggle-icon theme-toggle-icon--sun">light_mode</span>
            <span className="material-symbols-rounded theme-toggle-icon theme-toggle-icon--moon">dark_mode</span>
          </span>
        </button>
        <button className="icon-btn" disabled={!canUndo} onClick={onUndo} aria-label="Hoàn tác">
          <span className="material-symbols-rounded">undo</span>
        </button>
        <button className="icon-btn" disabled={!canRedo} onClick={onRedo} aria-label="Làm lại">
          <span className="material-symbols-rounded">redo</span>
        </button>

        <button className="btn-ghost" onClick={onPreview}>
          <span className="material-symbols-rounded">visibility</span>
          Xem trước
        </button>

        <button className="btn-primary glow" onClick={onOrder}>
          Đặt hàng
          <span className="material-symbols-rounded">arrow_forward</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
