import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  Factory,
  Leaf,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  Users,
  Warehouse,
} from 'lucide-react'
import { getTraceability } from '../../services/product'
import { imageAlt, imageUrl, isEnglish, localized } from '../products/productView'
import { useSeo } from '../../components/Seo'
import AppSkeleton from '../../components/ui/AppSkeleton'
import './TraceabilityPage.css'

const MapGL = lazy(() => import('../../components/map/MapGL'))

function number(value) {
  return Number(value) || 0
}

function formatNumber(value, english) {
  return number(value).toLocaleString(english ? 'en-US' : 'vi-VN', {
    maximumFractionDigits: 1,
  })
}

export default function TraceabilityPage() {
  const { traceCode } = useParams()
  const { t, i18n } = useTranslation()
  const english = isEnglish(i18n)
  const [status, setStatus] = useState('loading')
  const [trace, setTrace] = useState(null)
  const [selectedZoneId, setSelectedZoneId] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    getTraceability(traceCode, { signal: controller.signal })
      .then((data) => {
        setTrace(data)
        const initialZoneId = data.primaryZoneId || data.zones?.[0]?.id || ''
        setSelectedZoneId(initialZoneId)
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus(error.status === 404 ? 'not-found' : 'error')
      })
    return () => controller.abort()
  }, [traceCode])

  const product = trace?.product
  const productName = localized(product, 'name', english)
  const material = localized(product, 'material', english)
  const zones = useMemo(() => trace?.zones || [], [trace])
  const farmers = useMemo(() => zones.flatMap((zone) => zone.farmers || []), [zones])
  const points = useMemo(() => zones.flatMap((zone) => zone.collectionPoints || []), [zones])
  const selectedZone = zones.find((zone) => String(zone.id) === String(selectedZoneId)) || zones[0]

  const totals = useMemo(() => zones.reduce((summary, zone) => ({
    area: summary.area + number(zone.area),
    capacity: summary.capacity + number(zone.capacity),
    farmers: summary.farmers + number(zone.stats?.activeFarmerCount),
    stock: summary.stock + number(zone.stats?.currentStock),
  }), { area: 0, capacity: 0, farmers: 0, stock: 0 }), [zones])

  useSeo({
    title: product ? `${productName} - GreenShield Trace` : 'GreenShield Trace',
    description: t('traceability.description'),
    path: `/traceability/${traceCode}`,
    image: product?.mainImage ? imageUrl(product.mainImage) : undefined,
    locale: english ? 'en' : 'vi',
    robots: status === 'ready' ? 'index, follow' : 'noindex, nofollow',
  })

  if (status === 'loading') {
    return <main className="trace-page trace-page--state"><AppSkeleton variant="map" /><p>{t('traceability.loading')}</p></main>
  }

  if (status !== 'ready' || !product) {
    return (
      <main className="trace-page trace-page--state">
        <MapPinned />
        <h1>{t('traceability.notFoundTitle')}</h1>
        <p>{t('traceability.notFoundDescription')}</p>
        <Link to="/products"><ArrowLeft size={18} />{t('traceability.backProducts')}</Link>
      </main>
    )
  }

  return (
    <main className="trace-page">
      <div className="trace-page__inner">
        <header className="trace-topbar">
          <Link to="/products"><ArrowLeft size={17} />{t('traceability.backProducts')}</Link>
          <div><i aria-hidden="true" /><ShieldCheck size={16} />{t('traceability.verified')}</div>
        </header>

        <section className="trace-hero">
          <div className="trace-hero__copy">
            <p className="trace-eyebrow">{t('traceability.eyebrow')}</p>
            <h1>{productName}</h1>
            <p>{t('traceability.description')}</p>
            <dl className="trace-hero__meta">
              <div><dt>{t('catalog.detail.material')}</dt><dd><Leaf size={17} />{material}</dd></div>
              <div><dt>{t('traceability.zoneCount')}</dt><dd><MapPinned size={17} />{zones.length}</dd></div>
            </dl>
          </div>
          <figure className="trace-hero__visual">
            {product.mainImage ? <img src={imageUrl(product.mainImage)} alt={imageAlt(product.mainImage, english, productName)} /> : <Leaf />}
            <div className="trace-hero__image-status"><PackageCheck size={17} />{t('traceability.verified')}</div>
            <figcaption><span>Trace ID</span><strong>{trace.traceCode}</strong></figcaption>
          </figure>
        </section>

        <section className="trace-summary" aria-label={t('traceability.mapTitle')}>
          <article><div><MapPinned /></div><span>{t('traceability.zoneCount')}</span><strong>{String(zones.length).padStart(2, '0')}</strong></article>
          <article><div><Database /></div><span>{t('traceability.area')}</span><strong>{formatNumber(totals.area, english)} <small>ha</small></strong></article>
          <article><div><Factory /></div><span>{t('traceability.annualCapacity')}</span><strong>{formatNumber(totals.capacity, english)} <small>{t('traceability.tonPerYear')}</small></strong></article>
          <article><div><Users /></div><span>{t('traceability.farmers')}</span><strong>{String(totals.farmers).padStart(2, '0')}</strong></article>
        </section>

        {!zones.length ? (
          <section className="trace-empty">
            <MapPinned />
            <h2>{t('traceability.noZonesTitle')}</h2>
            <p>{t('traceability.noZonesDescription')}</p>
          </section>
        ) : (
          <section className="trace-map-section">
            <header>
              <div><p className="trace-eyebrow">{t('traceability.eyebrow')}</p><h2>{t('traceability.mapTitle')}</h2></div>
              <div className="trace-zone-tabs" role="tablist" aria-label={t('traceability.zoneCount')}>
                {zones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    role="tab"
                    aria-selected={String(zone.id) === String(selectedZone?.id)}
                    className={String(zone.id) === String(selectedZone?.id) ? 'active' : ''}
                    onClick={() => setSelectedZoneId(zone.id)}
                  >
                    {zone.primarySource ? <ShieldCheck size={15} /> : <MapPinned size={15} />}{zone.name}
                  </button>
                ))}
              </div>
            </header>

            <div className="trace-map-layout">
              <div className="trace-map-canvas">
                <Suspense fallback={<AppSkeleton variant="map" />}>
                  <MapGL
                    regions={zones}
                    farmers={farmers}
                    points={points}
                    mapStyle="light"
                    selectedRegionId={selectedZone?.id}
                    detailPanelVisible
                    visibility={{ region: true, farmers: true, points: true }}
                    localeText={{ mode2D: '2D', mode3D: '3D', modeLabel: t('map.modeLabel') }}
                    onSelect={(item) => {
                      if (item?.type === 'region') setSelectedZoneId(item.id)
                      if (item?.type === 'farmer') setSelectedZoneId(farmers.find((entry) => String(entry.id) === String(item.id))?.zoneId || selectedZoneId)
                      if (item?.type === 'point') setSelectedZoneId(points.find((entry) => String(entry.id) === String(item.id))?.zoneId || selectedZoneId)
                    }}
                  />
                </Suspense>
              </div>

              {selectedZone ? (
                <aside className="trace-zone-detail">
                  <div className="trace-zone-detail__head">
                    <div><span>{selectedZone.primarySource ? t('traceability.primary') : t('traceability.status')}</span><h3>{selectedZone.name}</h3></div>
                    <ShieldCheck />
                  </div>
                  <p className="trace-zone-detail__location"><MapPinned size={17} />{[selectedZone.district, selectedZone.province].filter(Boolean).join(', ')}</p>
                  <div className="trace-zone-detail__grid">
                    <div><span>{t('traceability.area')}</span><strong>{formatNumber(selectedZone.area, english)} ha</strong></div>
                    <div><span>{t('traceability.annualCapacity')}</span><strong>{formatNumber(selectedZone.capacity, english)} {t('traceability.tonPerYear')}</strong></div>
                    <div><span>{t('traceability.farmers')}</span><strong>{number(selectedZone.stats?.activeFarmerCount)} / {number(selectedZone.stats?.farmerCount)}</strong></div>
                    <div><span>{t('traceability.farmerCapacity')}</span><strong>{formatNumber(selectedZone.stats?.farmerCapacity, english)} {t('traceability.tonPerYear')}</strong></div>
                    <div><span>{t('traceability.collectionPoints')}</span><strong>{number(selectedZone.stats?.activeCollectionPointCount)} / {number(selectedZone.stats?.collectionPointCount)}</strong></div>
                    <div><span>{t('traceability.currentStock')}</span><strong>{formatNumber(selectedZone.stats?.currentStock, english)} / {formatNumber(selectedZone.stats?.collectionCapacity, english)} {t('traceability.ton')}</strong></div>
                  </div>
                  <div className="trace-stock">
                    <div><span>{t('traceability.stockRate')}</span><strong>{number(selectedZone.stats?.stockRate)}%</strong></div>
                    <i><b style={{ width: `${Math.min(100, number(selectedZone.stats?.stockRate))}%` }} /></i>
                  </div>
                  <div className="trace-zone-network">
                    <section>
                      <header><span>{t('traceability.farmers')}</span><b>{selectedZone.farmers?.length || 0}</b></header>
                      {(selectedZone.farmers || []).slice(0, 3).map((farmer) => (
                        <div key={farmer.id}><span>{farmer.name}</span><strong>{formatNumber(farmer.capacity, english)} {t('traceability.tonPerYear')}</strong></div>
                      ))}
                    </section>
                    <section>
                      <header><span>{t('traceability.collectionPoints')}</span><b>{selectedZone.collectionPoints?.length || 0}</b></header>
                      {(selectedZone.collectionPoints || []).slice(0, 2).map((point) => (
                        <div key={point.id}><span>{point.name}</span><strong>{formatNumber(point.currentStock, english)} / {formatNumber(point.capacity, english)} {t('traceability.ton')}</strong></div>
                      ))}
                    </section>
                  </div>
                  <div className="trace-zone-detail__status"><Warehouse size={17} />{t('traceability.active')}</div>
                </aside>
              ) : null}
            </div>
          </section>
        )}

        <Link className="trace-back" to="/products"><ArrowLeft size={18} />{t('traceability.backProducts')}</Link>
      </div>
    </main>
  )
}
