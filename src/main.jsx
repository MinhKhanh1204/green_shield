import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp } from 'antd'
import App from './App'
import 'antd/dist/reset.css';
import './index.css'
import './i18n'
import heroAvif from './assets/background-hero.avif'
import heroWebp from './assets/background-hero.webp'

function hintHeroImageLoading() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = navigator.connection?.saveData === true

  if (!isLargeScreen || reduceMotion || saveData) return

  const appendHint = (rel, href, type) => {
    if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    link.as = 'image'
    if (type) link.type = type
    document.head.appendChild(link)
  }

  appendHint('preload', heroAvif, 'image/avif')
  appendHint('prefetch', heroWebp, 'image/webp')
}

hintHeroImageLoading()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntApp>
      <App />
    </AntApp>
  </StrictMode>,
)
