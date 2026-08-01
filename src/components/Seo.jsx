/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import heroImage from '../assets/background-hero.webp'

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://greenshieldmekong.com').replace(/\/$/, '')
const BRAND_NAME = 'GreenShield Mekong'
const DEFAULT_IMAGE = heroImage

const ROUTE_COPY = {
  vi: {
    home: {
      title: 'GreenShield Mekong | Bao bì sinh học Mekong',
      description: 'GreenShield Mekong phát triển bao bì sinh học từ nguyên liệu địa phương, kết nối nông nghiệp, công nghệ và kinh tế tuần hoàn.'
    },
    products: {
      title: 'Sản phẩm sinh học | GreenShield Mekong',
      description: 'Khám phá các sản phẩm bao bì sinh học GreenShield Mekong từ lục bình, sen và nguyên liệu Mekong.'
    },
    customBag: {
      title: 'Green Lab 3D | Thiết kế túi tùy chỉnh | GreenShield Mekong',
      description: 'Thiết kế mẫu túi tùy chỉnh với vật liệu sinh học GreenShield Mekong trong Green Lab 3D.'
    },
    plantDisease: {
      title: 'AI Bệnh lá | GreenShield Mekong',
      description: 'Phân tích hình ảnh bệnh lá bằng AI và nhận gợi ý chăm sóc phù hợp cho cây trồng.'
    },
    map: {
      title: 'Vùng nguyên liệu Mekong | GreenShield Mekong',
      description: 'Theo dõi vùng nguyên liệu, hộ dân và điểm thu gom trong hệ sinh thái GreenShield Mekong.'
    },
    notFound: {
      title: 'Không tìm thấy trang | GreenShield Mekong',
      description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.'
    }
  },
  en: {
    home: {
      title: 'GreenShield Mekong | Bio-based Mekong packaging',
      description: 'GreenShield Mekong develops bio-based packaging from local materials, connecting agriculture, technology and the circular economy.'
    },
    products: {
      title: 'Bio-based products | GreenShield Mekong',
      description: 'Explore GreenShield Mekong bio-based packaging made from water hyacinth, lotus and Mekong materials.'
    },
    customBag: {
      title: 'Green Lab 3D | Custom bag design | GreenShield Mekong',
      description: 'Design a custom bag with GreenShield Mekong bio-based materials in Green Lab 3D.'
    },
    plantDisease: {
      title: 'AI Leaf Disease | GreenShield Mekong',
      description: 'Analyze leaf disease images with AI and receive practical care recommendations for crops.'
    },
    map: {
      title: 'Mekong material zones | GreenShield Mekong',
      description: 'Explore material zones, farmers and collection points across the GreenShield Mekong ecosystem.'
    },
    notFound: {
      title: 'Page not found | GreenShield Mekong',
      description: 'The page you are looking for does not exist or has moved.'
    }
  }
}

function absoluteUrl(value) {
  if (!value) return `${SITE_URL}/`
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, `${SITE_URL}/`).toString()
}

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${CSS.escape(key)}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

export function useSeo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index, follow',
  locale = 'vi',
  structuredData = null,
  enabled = true
}) {
  const structuredDataJson = JSON.stringify(structuredData)

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined

    const canonicalUrl = absoluteUrl(path || window.location.pathname)
    const imageUrl = absoluteUrl(image)
    const language = locale.startsWith('en') ? 'en_US' : 'vi_VN'

    document.title = title
    document.documentElement.lang = language === 'en_US' ? 'en' : 'vi'
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', robots)
    upsertMeta('name', 'googlebot', robots)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:site_name', BRAND_NAME)
    upsertMeta('property', 'og:locale', language)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)
    upsertCanonical(canonicalUrl)

    const existingSchema = document.head.querySelector('script[data-greenshield-seo]')
    if (existingSchema) existingSchema.remove()
    if (structuredDataJson) {
      const schema = document.createElement('script')
      schema.type = 'application/ld+json'
      schema.dataset.greenshieldSeo = 'true'
      schema.textContent = structuredDataJson
      document.head.appendChild(schema)
    }

    return undefined
  }, [description, enabled, image, locale, path, robots, structuredDataJson, title, type])
}

export function RouteSeo() {
  const location = useLocation()
  const { i18n } = useTranslation()
  const english = i18n.resolvedLanguage?.startsWith('en')
  const copy = ROUTE_COPY[english ? 'en' : 'vi']
  const pathname = location.pathname
  const isPrivate = pathname.startsWith('/admin')
    || pathname.includes('/design')
    || pathname.includes('/preview')
    || pathname.includes('/checkout')
    || pathname.startsWith('/order-success')
    || pathname.startsWith('/order-lookup')
    || pathname.startsWith('/audio')
    || pathname.startsWith('/tts')
  const isNotFound = pathname !== '/'
    && !pathname.startsWith('/products')
    && !pathname.startsWith('/custom-bag')
    && !pathname.startsWith('/plant-disease')
    && !pathname.startsWith('/map')
    && !pathname.startsWith('/order-success')
    && !pathname.startsWith('/order-lookup')
    && !pathname.startsWith('/audio')
    && !pathname.startsWith('/tts')
    && !pathname.startsWith('/admin')

  let routeCopy = copy.home
  if (pathname.startsWith('/products')) routeCopy = copy.products
  else if (pathname === '/custom-bag') routeCopy = copy.customBag
  else if (pathname.startsWith('/plant-disease')) routeCopy = copy.plantDisease
  else if (pathname.startsWith('/map')) routeCopy = copy.map
  else if (isNotFound) routeCopy = copy.notFound

  const structuredData = isPrivate || isNotFound ? null : {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        url: SITE_URL,
        logo: absoluteUrl('/logo.svg')
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND_NAME,
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: english ? 'en' : 'vi'
      }
    ]
  }

  useSeo({
    title: routeCopy.title,
    description: routeCopy.description,
    path: pathname,
    locale: english ? 'en' : 'vi',
    robots: isPrivate || isNotFound ? 'noindex, nofollow' : 'index, follow',
    structuredData
  })

  return null
}
