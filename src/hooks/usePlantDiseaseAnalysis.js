import { useCallback, useEffect, useRef, useState } from 'react'
import { plantDiseaseApi } from '../services/plantDiseaseApi'

const COUNT_STORAGE_KEY = 'plant_disease_analysis_count'

function readStoredCount() {
  if (typeof window === 'undefined') return 0

  const value = Number.parseInt(window.sessionStorage.getItem(COUNT_STORAGE_KEY) || '0', 10)
  return Number.isFinite(value) ? value : 0
}

export function usePlantDiseaseAnalysis() {
  const [analysisCount, setAnalysisCount] = useState(readStoredCount)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const requestRef = useRef(null)

  useEffect(() => () => requestRef.current?.abort(), [])

  const analyze = useCallback(async (file) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller

    setIsAnalyzing(true)
    setError(null)

    try {
      const analysisResult = await plantDiseaseApi.analyze(file, {
        signal: controller.signal,
      })

      setResult(analysisResult)
      setAnalysisCount((currentCount) => {
        const nextCount = currentCount + 1
        window.sessionStorage.setItem(COUNT_STORAGE_KEY, String(nextCount))
        return nextCount
      })

      return analysisResult
    } catch (analysisError) {
      if (analysisError?.name === 'AbortError') return null

      setResult(null)
      setError(analysisError?.message || 'Analysis failed. Please try again.')
      return null
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setIsAnalyzing(false)
      }
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
    setResult(null)
    setError(null)
    setIsAnalyzing(false)
  }, [])

  return {
    analysisCount,
    result,
    error,
    isAnalyzing,
    analyze,
    clearAnalysis,
  }
}
