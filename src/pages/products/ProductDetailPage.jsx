import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Leaf,
  MapPinned,
  PackageOpen,
  X,
} from 'lucide-react'
import { getProductBySlug } from '../../services/product'
import {
  formatMoney,
  imageAlt,
  imageUrl,
  isEnglish,
  localized,
  localizedList,
  saleModeKey,
} from './productView'
import './products.css'

function DetailList({ title, items }) {
  if (!items.length) return null
  return (
    <section className="product-detail-list">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}><Check size={17} aria-hidden="true" />{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const english = isEnglish(i18n)
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setProduct(null)
    setActiveIndex(0)
    getProductBySlug(slug, { signal: controller.signal })
      .then((data) => {
        setProduct(data)
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus(error.status === 404 ? 'not-found' : 'error')
      })
    return () => controller.abort()
  }, [slug, reloadKey])

  const images = useMemo(() => (product?.images || []).slice(0, 5), [product])
  const activeImage = images[activeIndex] || null
  const name = localized(product, 'name', english)

  useEffect(() => {
    if (!product) return undefined
    const previousTitle = document.title
    document.title = `${name} | GreenShield Mekong`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = localized(product, 'shortDescription', english)
    return () => { document.title = previousTitle }
  }, [english, name, product])

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % images.length)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [images.length, lightboxOpen])

  if (status === 'loading') {
    return (
      <main className="product-detail-page">
        <div className="product-detail-loading" aria-label={t('catalog.loading')}>
          <div className="product-skeleton product-skeleton--detail" />
          <div><div className="product-skeleton product-skeleton--line" /><div className="product-skeleton product-skeleton--line" /></div>
        </div>
      </main>
    )
  }

  if (status !== 'ready' || !product) {
    return (
      <main className="product-detail-page">
        <div className="product-state product-state--detail">
          <PackageOpen size={42} aria-hidden="true" />
          <h1>{status === 'not-found' ? t('catalog.detail.notFound') : t('catalog.error.title')}</h1>
          <p>{status === 'not-found' ? t('catalog.detail.notFoundDescription') : t('catalog.error.description')}</p>
          {status === 'error' ? <button type="button" onClick={() => setReloadKey((value) => value + 1)}>{t('catalog.error.retry')}</button> : null}
          <Link to="/products">{t('catalog.detail.backToProducts')}</Link>
        </div>
      </main>
    )
  }

  const benefits = localizedList(product, 'benefits', english)
  const applications = localizedList(product, 'applications', english)
  const specifications = localizedList(product, 'specifications', english)
  const isTableware = ['dia-la-sen', 'chen-la-luc-binh'].includes(product.slug)

  return (
    <main className="product-detail-page">
      <nav className="product-breadcrumb" aria-label={t('catalog.detail.breadcrumb')}>
        <Link to="/">{t('nav.home')}</Link><ChevronRight size={14} aria-hidden="true" />
        <Link to="/products">{t('nav.products')}</Link><ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{name}</span>
      </nav>

      <section className="product-detail-hero">
        <div className="product-gallery">
          <button
            type="button"
            className="product-gallery__main"
            onClick={() => activeImage && setLightboxOpen(true)}
            aria-label={t('catalog.detail.openGallery')}
          >
            {activeImage ? (
              <img src={imageUrl(activeImage)} alt={imageAlt(activeImage, english, name)} />
            ) : (
              <span><Leaf aria-hidden="true" /></span>
            )}
            <i>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</i>
          </button>
          {images.length > 1 ? (
            <div className="product-gallery__thumbs" role="list" aria-label={t('catalog.detail.gallery')}> 
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={index === activeIndex ? 'is-active' : ''}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${t('catalog.detail.image')} ${index + 1}`}
                >
                  <img src={imageUrl(image, true)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="product-detail-info">
          <div className="product-detail-info__badges">
            <span>{t(`catalog.categories.${product.category}`)}</span>
            <span>{t(saleModeKey(product.saleMode))}</span>
          </div>
          <p className="products-eyebrow">GreenShield / {String(product.displayOrder).padStart(2, '0')}</p>
          <h1>{name}</h1>
          <p className="product-detail-info__short">{localized(product, 'shortDescription', english)}</p>
          <div className="product-detail-info__material">
            <span>{t('catalog.detail.material')}</span>
            <strong>{localized(product, 'material', english)}</strong>
          </div>
          <div className="product-pricing">
            <div><span>{t('catalog.detail.unitPrice')}</span><strong>{formatMoney(product.domesticUnitPrice, english)}</strong></div>
            {product.domesticComboPrice ? (
              <div><span>{t('catalog.detail.comboPrice', { count: product.comboQuantity })}</span><strong>{formatMoney(product.domesticComboPrice, english)}</strong></div>
            ) : null}
            <div className="product-pricing__muted"><span>{t('catalog.detail.exportPrice')}</span><strong>{formatMoney(product.exportUnitPrice, english)}</strong></div>
          </div>
          <div className="product-detail-info__actions">
            <Link className="product-button product-button--primary" to="/#contact">{t('catalog.detail.sample')}<ArrowUpRight size={18} /></Link>
            <Link className="product-button product-button--ghost" to="/#contact">{t('catalog.detail.contactB2b')}</Link>
          </div>
          <p className="product-detail-info__note">{t('catalog.detail.priceNote')}</p>
        </aside>
      </section>

      <section className="product-description-band">
        <p>{t('catalog.detail.storyEyebrow')}</p>
        <h2>{localized(product, 'description', english)}</h2>
      </section>

      <div className="product-detail-lists">
        <DetailList title={t('catalog.detail.benefits')} items={benefits} />
        <DetailList title={t('catalog.detail.applications')} items={applications} />
        <DetailList title={t('catalog.detail.specifications')} items={specifications} />
      </div>

      {isTableware ? (
        <section className="tableware-combo">
          <div>
            <p>{t('catalog.detail.tablewareEyebrow')}</p>
            <h2>{t('catalog.detail.tablewareTitle')}</h2>
            <p>{t('catalog.detail.tablewareDescription')}</p>
          </div>
          <article>
            <span>{t('catalog.detail.combo')}</span>
            <strong>{product.comboQuantity} x {name}</strong>
            <b>{formatMoney(product.domesticComboPrice, english)}</b>
          </article>
        </section>
      ) : null}

      <section className="product-traceability">
        <div className="product-traceability__icon"><MapPinned aria-hidden="true" /></div>
        <div>
          <p>{t('catalog.detail.traceEyebrow')}</p>
          <h2>{t('catalog.detail.traceTitle')}</h2>
          <p>{t('catalog.detail.traceDescription')}</p>
        </div>
        <Link to="/map">{t('catalog.detail.traceCta')}<ArrowUpRight size={18} /></Link>
      </section>

      {images[2] ? (
        <figure className="product-lifestyle">
          <img src={imageUrl(images[2])} alt={imageAlt(images[2], english, name)} loading="lazy" />
          <figcaption>{localized(product, 'material', english)} / GreenShield Mekong</figcaption>
        </figure>
      ) : null}

      {product.relatedProducts?.length ? (
        <section className="related-products">
          <header className="product-section-heading">
            <p>{t('catalog.detail.relatedEyebrow')}</p>
            <h2>{t('catalog.detail.relatedTitle')}</h2>
          </header>
          <div className="related-products__grid">
            {product.relatedProducts.map((related) => (
              <Link key={related.id} to={`/products/${related.slug}`}>
                {related.mainImage ? <img src={imageUrl(related.mainImage)} alt={imageAlt(related.mainImage, english, localized(related, 'name', english))} loading="lazy" /> : null}
                <span>{localized(related, 'material', english)}</span>
                <h3>{localized(related, 'name', english)}</h3>
                <b>{formatMoney(related.domesticUnitPrice, english)} <ArrowUpRight size={16} /></b>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="product-detail-back"><Link to="/products"><ArrowLeft size={18} />{t('catalog.detail.backToProducts')}</Link></div>

      {lightboxOpen && activeImage ? (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={t('catalog.detail.gallery')}>
          <button type="button" className="product-lightbox__close" onClick={() => setLightboxOpen(false)} aria-label={t('catalog.detail.closeGallery')}><X /></button>
          {images.length > 1 ? <button type="button" className="product-lightbox__prev" onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)} aria-label={t('catalog.detail.previousImage')}><ArrowLeft /></button> : null}
          <img src={imageUrl(activeImage)} alt={imageAlt(activeImage, english, name)} />
          {images.length > 1 ? <button type="button" className="product-lightbox__next" onClick={() => setActiveIndex((index) => (index + 1) % images.length)} aria-label={t('catalog.detail.nextImage')}><ArrowRight /></button> : null}
        </div>
      ) : null}
    </main>
  )
}
