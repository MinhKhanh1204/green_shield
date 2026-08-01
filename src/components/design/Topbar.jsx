import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../LanguageToggle'
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
  const { t } = useTranslation()
  return (
    <header className="design-topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-back-btn" onClick={onBack} aria-label={t('customBag.editor.goBack')}>
          <PiArrowLeft size={18} />
        </button>

        <div className="design-meta">
          <div className="design-name">{templateName || t('customBag.editor.designEditor')}</div>
          <div className="design-status">
            <span className="dot" />
            <span>{t('customBag.editor.liveWorkspace')}</span>
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="design-badge">{t('customBag.editor.premiumCanvas')}</div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="icon-btn"
          onClick={onUndo}
          aria-label={t('customBag.editor.undo')}
          disabled={!canUndo}
        >
          <PiArrowCounterClockwise size={18} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onRedo}
          aria-label={t('customBag.editor.redo')}
          disabled={!canRedo}
        >
          <PiArrowClockwise size={18} />
        </button>
        <button type="button" className="icon-btn" onClick={onPreview} aria-label={t('customBag.editor.preview')}>
          <PiEye size={18} />
        </button>
        <button type="button" className="btn-primary" onClick={onOrder}>
          <PiShoppingBag size={16} />
          <span>{t('customBag.editor.order')}</span>
        </button>
        <button
          type="button"
          className="icon-btn theme-toggle"
          onClick={onToggleTheme}
          aria-label={t('customBag.editor.toggleTheme')}
        >
          {themeMode === 'dark' ? <PiSun size={18} /> : <PiMoon size={18} />}
        </button>
        <LanguageToggle />
      </div>
    </header>
  )
}

export default Topbar
