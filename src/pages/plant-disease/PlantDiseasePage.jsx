import { ScanLine, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import superLubiImage from '../../assets/super-lubi.png'
import InputPanel from '../../components/plant-disease/InputPanel'
import OutputPanel from '../../components/plant-disease/OutputPanel'
import SuggestedProductsPanel from '../../components/plant-disease/SuggestedProductsPanel'
import { usePlantDiseaseAnalysis } from '../../hooks/usePlantDiseaseAnalysis'
import styles from './PlantDiseasePage.module.css'

export function PlantDiseasePage() {
  const { t } = useTranslation()
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

      <main className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}><Sparkles size={15} /> {t('plantDisease.heroKicker')}</span>
            <h1>{t('plantDisease.heroTitle')} <em>{t('plantDisease.heroTitleAccent')}</em></h1>
            <p>{t('plantDisease.heroDescription')}</p>
          </div>
          <div className={styles.heroSignal} aria-hidden="true">
            <ScanLine className={styles.heroSignalIcon} size={22} strokeWidth={1.8} />
            <img className={styles.heroSignalImage} src={superLubiImage} alt="" />
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
