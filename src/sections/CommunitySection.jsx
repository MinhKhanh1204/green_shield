import React, { memo, useMemo } from 'react'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'
import communityEnvironmentImage from '../assets/card1-community.png'
import communitySocialImage from '../assets/card2-community.png'
import communityGovernanceImage from '../assets/card3-community.PNG'
import Marquee from '../components/Marquee'
import './CommunitySection.css'

function CommunitySection() {
  const { t } = useTranslation()

  const cards = [
    {
      key: 'environment',
      image: communityEnvironmentImage,
      tone: 'photo',
      title: t('community.cards.environment.title'),
      excerpt: t('community.cards.environment.excerpt'),
      full: t('community.cards.environment.full')
    },
    {
      key: 'social',
      image: communitySocialImage,
      tone: 'photo',
      title: t('community.cards.social.title'),
      excerpt: t('community.cards.social.excerpt'),
      full: t('community.cards.social.full')
    },
    {
      key: 'governance',
      image: communityGovernanceImage,
      tone: 'dark',
      title: t('community.cards.governance.title'),
      excerpt: t('community.cards.governance.excerpt'),
      full: t('community.cards.governance.full')
    }
  ]

  const marqueeItems = useMemo(
    () => cards.map((card) => card.title),
    [cards]
  )

  return (
    <section id="community" className="section section--community community-section">
      <div className="community-wrap">
        <div className="community-grid">
          <div className="community-left">
            <p className="community-kicker">{t('community.kicker')}</p>
            <h2 className="community-esg-title" aria-label="ESG">
              ESG
            </h2>
            <p className="community-subtitle">{t('community.subtitle')}</p>

            <div className="community-summary">
              <p>{t('community.summary')}</p>
            </div>

            <div className="community-handle" role="text" aria-label={t('community.handle')}>
              {t('community.handle')}
            </div>
          </div>

          <div className="community-cards" role="list" aria-label={t('community.cardsLabel')}>
            {cards.map((card) => (
              <article
                key={card.key}
                role="listitem"
                className={`community-esg-card community-esg-card--${card.tone}`}
              >
                <span className="community-esg-card__arrow" aria-hidden="true">
                  <ArrowUpRight size={26} strokeWidth={2.7} />
                </span>

                {card.image ? (
                  <div
                    className="community-esg-card__media"
                    style={{ backgroundImage: `url(${card.image})` }}
                    aria-hidden="true"
                  />
                ) : null}

                <div className="community-esg-card__overlay" aria-hidden="true" />

                <div className="community-esg-card__content">
                  <span className="community-esg-card__pill">{card.title}</span>
                  <p className="community-esg-card__excerpt">{card.excerpt}</p>
                  <div className="community-esg-card__details">
                    <p>{card.full}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <Marquee
        className="section-marquee section-marquee--community community-marquee"
        items={marqueeItems}
        separator="✳"
        speed={30}
      />
    </section>
  )
}

export default memo(CommunitySection)
