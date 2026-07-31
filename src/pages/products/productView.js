import { resolveProductAssetUrl } from '../../services/product'

export const CATEGORY_FILTERS = ['ALL', 'PACKAGING', 'TABLEWARE', 'LIFESTYLE']

export function isEnglish(i18n) {
  return (i18n.resolvedLanguage || i18n.language || 'vi').toLowerCase().startsWith('en')
}

export function localized(product, field, english) {
  if (!product) return ''
  const suffix = english ? 'En' : 'Vi'
  return product[`${field}${suffix}`] || product[`${field}${english ? 'Vi' : 'En'}`] || ''
}

export function localizedList(product, field, english) {
  const suffix = english ? 'En' : 'Vi'
  const primary = product?.[`${field}${suffix}`]
  const fallback = product?.[`${field}${english ? 'Vi' : 'En'}`]
  return Array.isArray(primary) && primary.length ? primary : (Array.isArray(fallback) ? fallback : [])
}

export function imageUrl(image, thumbnail = false) {
  return resolveProductAssetUrl(thumbnail ? image?.thumbnailUrl || image?.imageUrl : image?.imageUrl)
}

export function imageAlt(image, english, fallback = '') {
  return (english ? image?.altTextEn : image?.altTextVi)
    || (english ? image?.altTextVi : image?.altTextEn)
    || fallback
}

export function formatMoney(value, english = false) {
  if (value === null || value === undefined || value === '') return ''
  return new Intl.NumberFormat(english ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function saleModeKey(value) {
  return `catalog.saleModes.${value || 'RETAIL'}`
}
