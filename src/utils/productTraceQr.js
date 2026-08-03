import QRCode from 'qrcode'

const CONFIGURED_SITE_ORIGIN = import.meta.env.VITE_PUBLIC_SITE_ORIGIN?.trim().replace(/\/$/, '')

function publicSiteOrigin() {
  if (CONFIGURED_SITE_ORIGIN) return CONFIGURED_SITE_ORIGIN
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://greenshieldmekong.com'
}

export function productTraceUrl(traceCode) {
  if (!traceCode) return ''
  return `${publicSiteOrigin()}/traceability/${encodeURIComponent(traceCode)}`
}

export function renderProductTraceQr(canvas, traceCode, width = 256) {
  if (!canvas || !traceCode) return Promise.resolve()
  return QRCode.toCanvas(canvas, productTraceUrl(traceCode), {
    width,
    margin: 3,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#063b2b',
      light: '#ffffff',
    },
  })
}

function downloadFile(content, fileName, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function downloadProductTraceQr(traceCode, format) {
  if (!traceCode) throw new Error('Missing trace code')
  const baseName = `greenshield-trace-${traceCode.toLowerCase()}`

  if (format === 'svg') {
    const svg = await QRCode.toString(productTraceUrl(traceCode), {
      type: 'svg',
      margin: 3,
      errorCorrectionLevel: 'H',
      color: { dark: '#063b2b', light: '#ffffff' },
    })
    downloadFile(svg, `${baseName}.svg`, 'image/svg+xml')
    return
  }

  const dataUrl = await QRCode.toDataURL(productTraceUrl(traceCode), {
    width: 1024,
    margin: 3,
    errorCorrectionLevel: 'H',
    color: { dark: '#063b2b', light: '#ffffff' },
  })
  const response = await fetch(dataUrl)
  downloadFile(await response.blob(), `${baseName}.png`, 'image/png')
}
