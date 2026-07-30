import { BadgeDollarSign, Boxes, PackageSearch } from 'lucide-react'
import styles from '../../pages/plant-disease/PlantDiseasePage.module.css'

const formatPrice = (value) => {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) return 'Contact for price'
  return `${price.toLocaleString('vi-VN')} VND`
}

export default function SuggestedProductsPanel({ products }) {
  if (!products?.length) return null

  return (
    <section className={styles.productsSection} aria-labelledby="suggested-products-title">
      <div className={styles.productsHeading}>
        <span><PackageSearch size={19} /></span>
        <div><p>Next step</p><h2 id="suggested-products-title">Suggested care products</h2></div>
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
              <span className={styles.productCode}>{product.id || 'Recommended'}</span>
              <h3>{product.name}</h3>
              <p>{product.description || 'Product details are being updated.'}</p>
              {product.instructions ? <small>{product.instructions}</small> : null}
              <div className={styles.productMeta}>
                <span><BadgeDollarSign size={16} /> {formatPrice(product.price)}</span>
                <span><Boxes size={16} /> {product.quantity ?? 'N/A'} available</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
