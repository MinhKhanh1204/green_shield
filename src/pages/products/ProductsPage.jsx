import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Leaf,
  PackageOpen,
  RefreshCw,
  Utensils,
} from 'lucide-react'
import { getProducts } from '../../services/product'
import {
  formatMoney,
  imageAlt,
  imageUrl,
  isEnglish,
  localized,
  saleModeKey,
} from './productView'
import './products.css'

const MATERIAL_STORIES = [
  { key: 'hyacinth', number: '01', icon: Leaf },
  { key: 'lotus', number: '02', icon: Utensils },
  { key: 'circular', number: '03', icon: RefreshCw },
]

function ProductSkeleton({ index }) {
  const wideClass = index >= 3 ? ' product-card--wide' : ''
  return (
    <article className={`product-card product-card--skeleton${wideClass}`} aria-hidden="true">
      <div className="product-skeleton product-skeleton--image" />
      <div className="product-skeleton product-skeleton--line" />
      <div className="product-skeleton product-skeleton--short" />
    </article>
  )
}

function ProductCard({ product, index, english, t }) {
  const name = localized(product, 'name', english)
  const material = localized(product, 'material', english)
  const featuredClass = index >= 3 ? ' product-card--wide' : ''

  return (
    <article className={`product-card${featuredClass}`}>
      <Link className="product-card__media" to={`/products/${product.slug}`} aria-label={name}>
        {product.mainImage ? (
          <img
            src={imageUrl(product.mainImage, true)}
            alt={imageAlt(product.mainImage, english, name)}
            sizes="(max-width: 820px) 100vw, (max-width: 1080px) 50vw, 33vw"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        ) : (
          <div className="product-card__placeholder"><Leaf aria-hidden="true" /></div>
        )}
        <span className="product-card__index">{String(index + 1).padStart(2, '0')}</span>
        {product.featured ? <span className="product-card__featured">{t('catalog.featured')}</span> : null}
      </Link>
      <div className="product-card__body">
        <div className="product-card__heading">
          <div>
            <p className="product-card__material">{material}</p>
            <h2><Link to={`/products/${product.slug}`}>{name}</Link></h2>
          </div>
          <Link className="product-card__round-link" to={`/products/${product.slug}`} aria-label={t('catalog.explore')}>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="product-card__meta">
          <span>{t(saleModeKey(product.saleMode))}</span>
          <strong>{t('catalog.fromPrice', { price: formatMoney(product.domesticUnitPrice, english) })}</strong>
        </div>
      </div>
    </article>
  )
}

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const english = isEnglish(i18n)
  const [catalog, setCatalog] = useState([])
  const [status, setStatus] = useState('loading')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getProducts({}, { signal: controller.signal })
      .then((data) => {
        setCatalog(Array.isArray(data) ? data : [])
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error')
      })
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    const previousTitle = document.title
    document.title = t('catalog.seo.listTitle')
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = t('catalog.seo.listDescription')
    return () => { document.title = previousTitle }
  }, [t])

  // Keep the exhibition focused while preserving backend display order.
  const products = useMemo(() => catalog.slice(0, 5), [catalog])
  const labProducts = products
  const campaignProduct = useMemo(
    () => products.find((product) => product.featured && product.mainImage) || products.find((product) => product.mainImage),
    [products],
  )

  return (
    <main className="products-page">
      <section id="product-exhibition" className="product-exhibition" aria-labelledby="exhibition-title">
        <header className="product-section-heading">
          <p>{t('catalog.exhibition.eyebrow')}</p>
          <h2 id="exhibition-title">{t('catalog.exhibition.title')}</h2>
          <span>{String(products.length).padStart(2, '0')}</span>
        </header>

        {status === 'loading' ? (
          <div className="product-grid" aria-label={t('catalog.loading')}>
            {Array.from({ length: 5 }, (_, index) => <ProductSkeleton key={index} index={index} />)}
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="product-state" role="alert">
            <PackageOpen size={38} aria-hidden="true" />
            <h2>{t('catalog.error.title')}</h2>
            <p>{t('catalog.error.description')}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)}>{t('catalog.error.retry')}</button>
          </div>
        ) : null}

        {status === 'ready' && !products.length ? (
          <div className="product-state">
            <Leaf size={38} aria-hidden="true" />
            <h2>{t('catalog.empty.title')}</h2>
            <p>{t('catalog.empty.description')}</p>
          </div>
        ) : null}

        {status === 'ready' && products.length ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} english={english} t={t} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="product-material-lab" aria-labelledby="material-lab-title">
        <div className="product-material-lab__glow" aria-hidden="true" />
        <header>
          <p>{t('catalog.technology.eyebrow')}</p>
          <h2 id="material-lab-title">{t('catalog.technology.title')}</h2>
          <span>{t('catalog.technology.description')}</span>
        </header>

        <div className="product-material-lab__collage">
          {labProducts.map((product, index) => (
            <Link key={product.id} to={`/products/${product.slug}`} className={`product-lab-card product-lab-card--${index + 1}`}>
              {product.mainImage ? <img src={imageUrl(product.mainImage, true)} alt={imageAlt(product.mainImage, english, localized(product, 'name', english))} sizes="(max-width: 820px) 70vw, 19vw" loading="lazy" decoding="async" /> : null}
              <span>{localized(product, 'name', english)}</span>
            </Link>
          ))}
        </div>

        <div className="material-stories__grid">
          {MATERIAL_STORIES.map((story) => (
            <article key={story.key}>
              <div><span>{story.number}</span>{React.createElement(story.icon, { 'aria-hidden': true })}</div>
              <h3>{t(`catalog.materials.${story.key}.title`)}</h3>
              <p>{t(`catalog.materials.${story.key}.description`)}</p>
            </article>
          ))}
        </div>
      </section>

      {campaignProduct ? (
        <section className="product-campaign" aria-labelledby="product-campaign-title">
          <div className="product-campaign__copy">
            <p>{t('catalog.campaign.eyebrow')}</p>
            <h2 id="product-campaign-title">{t('catalog.campaign.title')}</h2>
            <span>{t('catalog.campaign.description')}</span>
            <Link to={`/products/${campaignProduct.slug}`}>
              {t('catalog.campaign.cta')} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="product-campaign__visual">
            <div aria-hidden="true" />
            {campaignProduct.mainImage ? (
              <img src={imageUrl(campaignProduct.mainImage)} alt={imageAlt(campaignProduct.mainImage, english, localized(campaignProduct, 'name', english))} sizes="(max-width: 820px) 92vw, 48vw" loading="lazy" decoding="async" />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="product-benefit-strip" aria-label={t('catalog.benefits.label')}>
        {['biodegradable', 'foodSafe', 'local', 'horeca'].map((key) => (
          <span key={key}><i aria-hidden="true" />{t(`catalog.benefits.${key}`)}</span>
        ))}
      </section>
    </main>
  )
}
