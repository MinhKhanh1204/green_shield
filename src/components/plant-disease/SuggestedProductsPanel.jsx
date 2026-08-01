import { BadgeDollarSign, Boxes, PackageSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from '../../pages/plant-disease/PlantDiseasePage.module.css'

const formatPrice = (value, language, fallback) => {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) return fallback
  const english = language.startsWith('en')
  return `${price.toLocaleString(english ? 'en-US' : 'vi-VN')} ${english ? 'VND' : '₫'}`
}

export default function SuggestedProductsPanel({ products }) {
  const { t, i18n } = useTranslation()
  if (!products?.length) return null

  return (
    <section className={styles.productsSection} aria-labelledby="suggested-products-title">
      <div className={styles.productsHeading}>
        <span><PackageSearch size={19} /></span>
        <div><p>{t('plantDisease.nextStep')}</p><h2 id="suggested-products-title">{t('plantDisease.suggestedProducts')}</h2></div>
      </div>

      <div className={styles.productGrid}>
        {products.map((product, index) => (
          <article className={styles.productCard} key={product.id || `${product.name}-${index}`}>
            <div className={styles.productImage}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} loading="lazy" />
                : <PackageSearch size={32} aria-hidden="true" />}
            </div>
            <div className={styles.productBody}>
              <span className={styles.productCode}>{product.id || t('plantDisease.recommended')}</span>
              <h3>{product.name || t('plantDisease.suggestedProduct')}</h3>
              <p>{product.description || t('plantDisease.productDetailsUpdating')}</p>
              {product.instructions ? <small>{product.instructions}</small> : null}
              <div className={styles.productMeta}>
                <span><BadgeDollarSign size={16} /> {formatPrice(product.price, i18n.language, t('plantDisease.contactForPrice'))}</span>
                <span><Boxes size={16} /> {product.quantity ?? t('plantDisease.notAvailable')} {t('plantDisease.available')}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
