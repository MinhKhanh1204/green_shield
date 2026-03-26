import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

const steps = [
  { key: 'collect', img: 'https://res.cloudinary.com/dnini39bp/image/upload/IMG_4283_bi5hjv.jpg' },
  { key: 'process', img: 'https://res.cloudinary.com/dnini39bp/image/upload/IMG_3692_new_xdyohd.jpg' },
  { key: 'mold', img: 'https://res.cloudinary.com/dnini39bp/image/upload/IMG_3699_new_t6rk5v.jpg' },
  { key: 'coat', img: 'https://res.cloudinary.com/dnini39bp/image/upload/step3_b6mhei.jpg' },
  { key: 'pack', img: 'https://res.cloudinary.com/dnini39bp/image/upload/IMG_3920-da_chinh_hfotmm.jpg' },
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
