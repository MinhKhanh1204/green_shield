import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

const steps = [
  { key: 'collect', img: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525576/thu_gom_i88yio.jpg' },
  { key: 'process', img: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525576/ph%C6%A1i_kh%C3%B4_apdkfb.jpg' },
  { key: 'mold', img: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525576/x%E1%BB%AD_l%C3%AD_yympqv.jpg' },
  { key: 'coat', img: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525631/%C3%89p_khu%C3%B4n_dcrnms.jpg' },
  { key: 'pack', img: 'https://res.cloudinary.com/dnini39bp/image/upload/v1774525577/%C4%91%C3%B3ng_g%C3%B3i_rdiy7q.jpg' },
]

const StepCard = memo(({ s, idx, t }) => {
  const label = t(`products.steps.${idx}.label`, { defaultValue: '' })
  const desc = t(`products.steps.${idx}.desc`, { defaultValue: '' })

  return (
    <article
      className={`stack-card ${idx === 0 ? 'is-default' : ''}`}
      style={{ '--bg': `url(${s.img})` }}
    >
      <div className="steps-badge">{idx + 1}</div>

      <div className="stack-card__overlay">
        <h3 className="card-title">{label}</h3>
        <p className="card-desc">{desc}</p>
      </div>
    </article>
  )
})

export default function ProductsSection() {
  const { t } = useTranslation()
  return (
    <section id="products" className="section">
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <div className="products-header">
          <h1 className="section-title">
            {t('products.title')}
          </h1>

          <h3 className="section-subtitle">
            {t('products.stepsTitle')}
          </h3>
        </div>

        <div className="stack-gallery steps">
          {steps.map((s, idx) => (
            <StepCard key={s.key} s={s} idx={idx} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
