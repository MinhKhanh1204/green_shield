// src/components/Nav.jsx
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LanguageToggle from './LanguageToggle'
import { useTranslation } from 'react-i18next'
import useActiveSection from '../hooks/useActiveSection'

const links = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'products', labelKey: 'nav.products' },
  { id: 'custom', labelKey: 'nav.custom', href: '/custom-bag' },
  { id: 'advantages', labelKey: 'nav.advantages' },
  { id: 'mission', labelKey: 'nav.mission' },
  { id: 'material', labelKey: 'nav.material', href: '/map' },
  { id: 'community', labelKey: 'nav.community' },
  { id: 'contact', labelKey: 'nav.contact' },
]

export default function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const observedActiveId = isHomePage ? useActiveSection('.section', { threshold: 0.55 }) : null
  const [activeId, setActiveId] = useState('home')
  const [open, setOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsNarrow(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Smooth scroll helper - only works on home page
  const smoothScrollTo = (targetId) => {
    const el = document.getElementById(targetId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    setActiveId(targetId)
    if (history?.replaceState) history.replaceState(null, '', `#${targetId}`)
  }

  // On non-home pages, all links should navigate via router
  const renderLink = (l, isMobile = false) => {
    const isActive = isHomePage ? (observedActiveId || activeId) === l.id : location.pathname === l.href
    const className = isActive ? 'nav-link active' : 'nav-link'

    if (l.href) {
      // Links with href always use router
      return (
        <Link
          to={l.href}
          className={className}
          style={{ textDecoration: 'none', color: 'var(--color-dark)' }}
        >
          {t(l.labelKey)}
        </Link>
      )
    }

    // On home page, use smooth scroll; on other pages, navigate to home first then scroll
    if (isHomePage) {
      return (
        <a
          href={`#${l.id}`}
          className={className}
          style={{ textDecoration: 'none', color: 'var(--color-dark)' }}
          onClick={(e) => { e.preventDefault(); smoothScrollTo(l.id) }}
        >
          {t(l.labelKey)}
        </a>
      )
    }

    // On non-home pages, navigate to home with hash
    return (
      <Link
        to={`/#${l.id}`}
        className={className}
        style={{ textDecoration: 'none', color: 'var(--color-dark)' }}
      >
        {t(l.labelKey)}
      </Link>
    )
  }

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
                {renderLink(l, true)}
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
    <nav aria-label="Main navigation">
      <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
        {links.map(l => (
          <li key={l.id}>
            {renderLink(l)}
          </li>
        ))}
      </ul>
    </nav>
  )
}
