const toText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  return String(value)
}

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

const toConfidence = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.min(1, Math.max(0, parsed > 1 ? parsed / 100 : parsed))
}

export function normalizeSuggestedProduct(data = {}) {
  return {
    id: toText(data.MaSanPham ?? data.id ?? data.code),
    name: toText(data.TenSanPham ?? data.name),
    description: toText(data.MoTa ?? data.description),
    instructions: toText(data.HuongDan ?? data.instructions),
    price: data.Gia ?? data.price ?? data.actual_price ?? null,
    quantity: data.SoLuongCo ?? data.quantity ?? null,
    imageUrl: toText(data.imageUrl ?? data.image_url),
  }
}

export function normalizeAnalysisResult(data = {}) {
  const suggestedProducts = data.suggestedProducts ?? data.suggested_products ?? []

  return {
    id: toText(data.id, `${Date.now()}`),
    plantName: toText(data.plantName ?? data.plant_name),
    status: toText(data.status, 'UNKNOWN').toUpperCase(),
    analyzedAt: data.analyzedAt ?? data.analyzed_at ?? new Date().toISOString(),
    confidence: toConfidence(data.confidence),
    scientificName: toText(data.scientificName ?? data.scientific_name),
    type: toText(data.type ?? data.diseaseType ?? data.disease_type),
    severity: toText(data.severity),
    symptoms: toList(data.symptoms),
    treatment: toList(data.treatment),
    recovery: toText(data.recovery),
    suggestedProducts: Array.isArray(suggestedProducts)
      ? suggestedProducts.map(normalizeSuggestedProduct)
      : [],
  }
}
