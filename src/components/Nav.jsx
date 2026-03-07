// src/components/Nav.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  { id: 'community', labelKey: 'nav.community' },
  { id: 'contact', labelKey: 'nav.contact' },
]

export default function Nav() {
  const { t } = useTranslation()
  const observedActiveId = useActiveSection('.section', { threshold: 0.55 })
  const [activeId, setActiveId] = useState('home')
  const [open, setOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsNarrow(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Smooth scroll helper with header offset, scrolling the main .app-scroll container
  const smoothScrollTo = (targetId) => {
    const el = document.getElementById(targetId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    setActiveId(targetId)
    // Optional: reflect in URL without jumping
    if (history?.replaceState) history.replaceState(null, '', `#${targetId}`)
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
                {l.href ? (
                  <Link to={l.href} className="nav-link" onClick={() => setOpen(false)}>{t(l.labelKey)}</Link>
                ) : (
                  <a
                    href={`#${l.id}`}
                    className={(observedActiveId || activeId) === l.id ? 'nav-link active' : 'nav-link'}
                    aria-current={(observedActiveId || activeId) === l.id ? 'page' : undefined}
                    onClick={(e) => { e.preventDefault(); smoothScrollTo(l.id); setOpen(false) }}
                  >
                    {t(l.labelKey)}
                  </a>
                )}
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
            {l.href ? (
              <Link to={l.href} className="nav-link" style={{ textDecoration: 'none', color: 'var(--color-dark)' }}>{t(l.labelKey)}</Link>
            ) : (
              <a
                href={`#${l.id}`}
                className={(observedActiveId || activeId) === l.id ? 'nav-link active' : 'nav-link'}
                style={{ textDecoration: 'none', color: 'var(--color-dark)' }}
                onClick={(e) => { e.preventDefault(); smoothScrollTo(l.id) }}
              >
                {t(l.labelKey)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
