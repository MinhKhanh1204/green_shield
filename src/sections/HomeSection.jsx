// src/sections/HomeSection.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import SplitText from '../components/SplitText'

export default function HomeSection() {
  const { t } = useTranslation()
  return (
    <section id="home" className="section" role="region" aria-label={t('home.title')}>
      <div className="banner">
        <div className="overlay"></div>
      </div>

      <div className="banner-content">
        <div className="banner-title-group">
          <SplitText
            key={t('home.key-title')}
            as="span"
            className="banner-title highlight"
            text={t('home.key-title')}
            type="words"
          />
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
        <div className="btn-group-banner" data-aos="fade-up" style={{ display: 'inline-flex', gap: '1rem'}}>
          <a className="btn btn-primary" href="#products">{t('cta.explore')}
            <span className="material-symbols-rounded">arrow_outward</span>
          </a>
          <a className="btn btn-dark" href="#contact">{t('cta.contact')}</a>
        </div>
      </div>
    </section>

  )
}
