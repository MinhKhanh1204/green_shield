// src/sections/CommunitySection.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import Marquee from '../components/Marquee'

export default function CommunitySection() {
  const { t } = useTranslation()
  const items = [
    { k: 'coop' },
    { k: 'training' },
    { k: 'digital' },
    { k: 'esg' }
  ]

  return (
    <section id="community" className="section section--community">
      <div className="community-wrap">
        <div className="community-grid">
          {/* Left: stacked heading */}
          <div className="community-left">
            <div className="stacked-title">
              <span>{t('community.title', { defaultValue: 'Cộng đồng' }).toUpperCase()}</span>
            </div>
          </div>
          
          {/* Right: split into scroller (top) + static black tile (bottom) */}
          <div className="community-right">
            <div className="community-scroller marquee">
              <div className="marquee-track">
                {[...items, ...items].map((it, idx) => (
                  <div className="community-card" key={it.k + '-' + idx} aria-hidden={idx >= items.length}>
                    <div className="card-head">
                      <button className="card-chip" type="button">
                        {t(`community.pillars.${it.k}.title`)}
                      </button>
                      <button className="arrow-btn" type="button" aria-label="Open">
                        <span className="material-symbols-rounded">arrow_outward</span>
                      </button>
                    </div>
                    <p className="card-desc">{t(`community.pillars.${it.k}.desc`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="community-static">
              <span className="handle">@greenmind_team</span>
            </div>
          </div>
        </div>
      </div>
      {/* Full-width marquee dark variant */}
      <Marquee
        className="section-marquee section-marquee--community"
        items={t('ticker.community', { returnObjects: true })}
        separator="✳"
        speed={30}
      />
    </section>
  )
}
