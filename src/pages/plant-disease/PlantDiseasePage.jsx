import { ArrowLeft, Leaf, ScanLine, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import InputPanel from '../../components/plant-disease/InputPanel'
import OutputPanel from '../../components/plant-disease/OutputPanel'
import SuggestedProductsPanel from '../../components/plant-disease/SuggestedProductsPanel'
import { usePlantDiseaseAnalysis } from '../../hooks/usePlantDiseaseAnalysis'
import styles from './PlantDiseasePage.module.css'

export function PlantDiseasePage() {
  const navigate = useNavigate()
  const {
    analysisCount,
    result,
    error,
    isAnalyzing,
    analyze,
    clearAnalysis,
  } = usePlantDiseaseAnalysis()

  return (
    <div className={styles.page}>
      <div className={styles.ambientGlow} aria-hidden="true" />

      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Home
        </button>
        <div className={styles.brandMark}><Leaf size={22} /></div>
        <span className={styles.headerLabel}>GreenShield AI Lab</span>
      </header>

      <main className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}><Sparkles size={15} /> Plant health intelligence</span>
            <h1>See what the leaf is <em>telling you.</em></h1>
            <p>Upload a focused leaf photo or video for an AI-assisted disease assessment, treatment guidance and relevant care products.</p>
          </div>
          <div className={styles.heroSignal} aria-hidden="true">
            <ScanLine size={42} />
            <span>Visual diagnosis</span>
          </div>
        </section>

        <div className={styles.workspace}>
          <InputPanel
            isAnalyzing={isAnalyzing}
            onAnalyze={analyze}
            onClearAnalysis={clearAnalysis}
          />
          <OutputPanel
            analysisCount={analysisCount}
            error={error}
            isAnalyzing={isAnalyzing}
            result={result}
          />
        </div>

        <SuggestedProductsPanel products={result?.suggestedProducts} />
      </main>
    </div>
  )
}
