// src/sections/HomeSection.jsx
import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion as Motion } from 'framer-motion'
import SplitText from '../components/SplitText'
import { AuroraText } from '../components/ui/aurora-text'

function HomeSection() {
  const { t } = useTranslation()

  const handleSmoothAnchor = useCallback((event, targetId) => {
    event.preventDefault()
    const target = document.getElementById(targetId)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    if (history?.replaceState) history.replaceState(null, '', `#${targetId}`)
  }, [])

  return (
    <section id="home" className="section" role="region" aria-label={t('home.title')}>
      <div className="banner">
        <div className="overlay"></div>
      </div>

      <div className="banner-content">
        <div className="banner-title-group">
          <AuroraText className="banner-title highlight">{t('home.key-title')}</AuroraText>
          <SplitText
            key={t('home.title')}
            as="span"
            className="banner-title"
            text={t('home.title')}
            type="words"
          />
        </div>

        <SplitText
          key={t('home.subtitle')}
          as="span"
          className="banner-subtitle"
          text={t('home.subtitle')}
          type="words"
          delay={0.15}
          stagger={0.035}
        />
        <Motion.div
          className="btn-group-banner"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ amount: 0.8, once: false }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <a className="btn btn-primary" href="#products" onClick={(event) => handleSmoothAnchor(event, 'products')}>
            {t('cta.explore')}
            <span className="material-symbols-rounded">arrow_outward</span>
          </a>
          <a className="btn btn-dark" href="#contact" onClick={(event) => handleSmoothAnchor(event, 'contact')}>
            {t('cta.contact')}
          </a>
        </Motion.div>
      </div>
    </section>

  )
}

export default memo(HomeSection)
