import { normalizeAnalysisResult } from '../utils/plantDiseaseResult'

const DEFAULT_ENDPOINT = '/predict'
const DEFAULT_DEV_API_BASE = 'http://localhost:7860'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

function resolveApiBase() {
  const configuredBase = (
    import.meta.env.VITE_PLANT_DISEASE_API_BASE
    || import.meta.env.VITE_PY_API_BASE
    || ''
  ).replace(/\/$/, '')

  if (configuredBase) return configuredBase
  return import.meta.env.DEV ? DEFAULT_DEV_API_BASE : ''
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json().catch(() => ({}))

  const text = await response.text().catch(() => '')
  return text ? { detail: text } : {}
}

export function validatePlantMedia(file, expectedType) {
  if (!(file instanceof File)) {
    throw new Error('Please select a leaf image or video before analysis.')
  }

  const isImage = ALLOWED_IMAGE_TYPES.has(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type)

  if (!isImage && !isVideo) {
    throw new Error('Only JPG, PNG, WebP, MP4, WebM and MOV files are supported.')
  }

  if (expectedType === 'image' && !isImage) {
    throw new Error('Please select a JPG, PNG or WebP image.')
  }

  if (expectedType === 'video' && !isVideo) {
    throw new Error('Please select an MP4, WebM or MOV video.')
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new Error('The image must be smaller than 10 MB.')
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error('The video must be smaller than 50 MB.')
  }

  return isVideo ? 'video' : 'image'
}

export function validatePlantImage(file) {
  return validatePlantMedia(file, 'image')
}

export class PlantDiseaseApi {
  constructor(baseUrl = resolveApiBase()) {
    this.baseUrl = baseUrl
  }

  async analyze(file, { signal } = {}) {
    validatePlantMedia(file)

    const formData = new FormData()
    formData.append('file', file)

    let response
    try {
      response = await fetch(`${this.baseUrl}${DEFAULT_ENDPOINT}`, {
        method: 'POST',
        body: formData,
        signal,
      })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      throw new Error('Cannot connect to the plant disease analysis service.')
    }

    const data = await readResponseBody(response)
    if (!response.ok) {
      throw new Error(
        data.detail
        || data.error
        || `The image could not be analyzed (HTTP ${response.status}).`,
      )
    }

    return normalizeAnalysisResult(data)
  }

  analyzeInput(file, options) {
    return this.analyze(file, options)
  }
}

export const plantDiseaseApi = new PlantDiseaseApi()
