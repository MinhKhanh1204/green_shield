// src/components/Nav.jsx
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LanguageToggle from './LanguageToggle'
import { useTranslation } from 'react-i18next'
import useActiveSection from '../hooks/useActiveSection'

const links = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'mission', labelKey: 'nav.mission' },
  { id: 'products', labelKey: 'nav.products' },
  { id: 'advantages', labelKey: 'nav.advantages' },
  { id: 'community', labelKey: 'nav.community' },
  { id: 'contact', labelKey: 'nav.contact' },
  { id: 'custom', labelKey: 'nav.custom', href: '/custom-bag' },
  { id: 'material', labelKey: 'nav.material', href: '/map' },
]

function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const homeSectionSelector = '#home, #about, #mission, #products, #advantages, #community, #contact'
  const activeThreshold = useMemo(() => [0, 0.2, 0.4, 0.6, 0.8, 1], [])
  const observedActiveId = useActiveSection(homeSectionSelector, {
    threshold: activeThreshold,
    disabled: !isHomePage,
  })
  const [activeId, setActiveId] = useState('home')
  const [open, setOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1100 : false,
  )

  const currentActiveId = useMemo(() => observedActiveId || activeId, [observedActiveId, activeId])

  const desktopListStyle = useMemo(() => ({
    display: 'flex',
    gap: 'clamp(0.5rem, 1.1vw, 1rem)',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  }), [])

  const desktopNavStyle = useMemo(() => ({ width: '100%' }), [])

  const desktopItemStyle = useMemo(() => ({ flex: '0 0 auto' }), [])

  useEffect(() => {
    if (!isHomePage) return
    if (!observedActiveId) return
    setActiveId(observedActiveId)
  }, [isHomePage, observedActiveId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafId = 0
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setIsNarrow(window.innerWidth < 1100))
    }

    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const closeMenu = () => setOpen(false)
    window.addEventListener('keydown', closeMenu, { once: true })
    return () => window.removeEventListener('keydown', closeMenu)
  }, [open])

  const smoothScrollTo = useCallback((targetId) => {
    const el = document.getElementById(targetId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    setActiveId(targetId)
    if (history?.replaceState) history.replaceState(null, '', `#${targetId}`)
  }, [])

  const renderLink = useCallback((l) => {
    const isActive = isHomePage ? currentActiveId === l.id : location.pathname === l.href
    const className = isActive ? 'nav-link active' : 'nav-link'

    if (l.href) {
      const linkState = isHomePage && l.href === '/custom-bag'
        ? { fromHome: true }
        : undefined

      return (
        <Link
          to={l.href}
          state={linkState}
          className={className}
          onClick={() => setOpen(false)}
        >
          {t(l.labelKey)}
        </Link>
      )
    }

    if (isHomePage) {
      return (
        <a
          href={`#${l.id}`}
          className={className}
          onClick={(e) => {
            e.preventDefault()
            smoothScrollTo(l.id)
            setOpen(false)
          }}
        >
          {t(l.labelKey)}
        </a>
      )
    }

    return (
      <Link
        to={`/#${l.id}`}
        className={className}
        onClick={() => setOpen(false)}
      >
        {t(l.labelKey)}
      </Link>
    )
  }, [currentActiveId, isHomePage, location.pathname, smoothScrollTo, t])

  if (isNarrow) {
    return (
      <nav aria-label="Main navigation" className="nav-mobile">
        <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(v => !v)}>
          <span className="material-symbols-rounded">menu</span>
        </button>
        {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
        <aside className={`nav-drawer ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
          <div className="nav-drawer__head">
            <button className="burger close" aria-label="Close" onClick={() => setOpen(false)}>
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          <ul className="nav-drawer__list">
            {links.map(l => (
              <li key={l.id}>
                {renderLink(l)}
              </li>
            ))}
          </ul>
          <div className="nav-drawer__lang">
            <LanguageToggle />
          </div>
        </aside>
      </nav>
    )
  }

  return (
    <nav aria-label="Main navigation" style={desktopNavStyle}>
      <ul className="nav-list" style={desktopListStyle}>
        {links.map(l => (
          <li key={l.id} style={desktopItemStyle}>
            {renderLink(l)}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default memo(Nav)
