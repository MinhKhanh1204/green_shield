import React from 'react'
import {
  PiArrowClockwise,
  PiArrowCounterClockwise,
  PiArrowLeft,
  PiEye,
  PiMoon,
  PiShoppingBag,
  PiSun,
} from 'react-icons/pi'

function Topbar({
  templateName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onOrder,
  onBack,
  themeMode = 'light',
  onToggleTheme,
}) {
  return (
    <header className="design-topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-back-btn" onClick={onBack} aria-label="Go back">
          <PiArrowLeft size={18} />
        </button>

        <div className="design-meta">
          <div className="design-name">{templateName || 'Design editor'}</div>
          <div className="design-status">
            <span className="dot" />
            <span>Live workspace</span>
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="design-badge">Premium canvas</div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="icon-btn"
          onClick={onUndo}
          aria-label="Undo"
          disabled={!canUndo}
        >
          <PiArrowCounterClockwise size={18} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onRedo}
          aria-label="Redo"
          disabled={!canRedo}
        >
          <PiArrowClockwise size={18} />
        </button>
        <button type="button" className="icon-btn" onClick={onPreview} aria-label="Preview">
          <PiEye size={18} />
        </button>
        <button type="button" className="btn-primary" onClick={onOrder}>
          <PiShoppingBag size={16} />
          <span>Order</span>
        </button>
        <button
          type="button"
          className="icon-btn theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {themeMode === 'dark' ? <PiSun size={18} /> : <PiMoon size={18} />}
        </button>
      </div>
    </header>
  )
}

export default Topbar
