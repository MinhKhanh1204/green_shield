import { Activity, AlertTriangle, CheckCircle2, Clock3, Dna, FlaskConical, ScanSearch, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import healthyMascot from '../../assets/plant-status-ok.png'
import diseasedMascot from '../../assets/plant-status-deny.png'
import styles from '../../pages/plant-disease/PlantDiseasePage.module.css'
import { translatePlantDiseaseError } from '../../pages/plant-disease/plantDiseaseI18n'

const formatDate = (value, language) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString(language.startsWith('en') ? 'en-US' : 'vi-VN')
}

function EmptyState({ isAnalyzing, t }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}><ScanSearch size={35} /></span>
      <strong>{isAnalyzing ? t('plantDisease.readingPatterns') : t('plantDisease.awaitingImage')}</strong>
      <p>{isAnalyzing ? t('plantDisease.servicePreparing') : t('plantDisease.uploadToBegin')}</p>
    </div>
  )
}

export default function OutputPanel({ analysisCount, error, isAnalyzing, result }) {
  const { t, i18n } = useTranslation()
  const isDiseased = result?.status === 'DISEASED'
  const isHealthy = result?.status === 'HEALTHY'
  const resultState = isDiseased ? 'diseased' : isHealthy ? 'healthy' : null
  const statusLabel = result?.status === 'DISEASED'
    ? t('plantDisease.status.diseased')
    : result?.status === 'HEALTHY'
      ? t('plantDisease.status.healthy')
      : t('plantDisease.status.unknown')

  return (
    <section
      className={`${styles.panel} ${isDiseased ? styles.panelDiseased : ''} ${isHealthy ? styles.panelHealthy : ''}`}
      aria-labelledby="plant-disease-output-title"
    >
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>{t('plantDisease.diagnosis')}</span>
          <h2 id="plant-disease-output-title">{t('plantDisease.analysisResult')}</h2>
        </div>
        <span className={styles.stepBadge}>02</span>
      </div>

      <div className={styles.statsStrip}>
        <Activity size={18} />
        <div><strong>{analysisCount}</strong><span>{t('plantDisease.successfulAnalyses')}</span></div>
      </div>

      {error ? (
        <div className={styles.errorCard} role="alert">
          <ShieldAlert size={25} />
          <div><strong>{t('plantDisease.analysisUnavailable')}</strong><p>{translatePlantDiseaseError(error, t)}</p></div>
        </div>
      ) : null}

      {!result && !error ? <EmptyState isAnalyzing={isAnalyzing} t={t} /> : null}

      {result ? (
        <div className={styles.resultCard}>
          {resultState ? (
            <div className={styles.verdictBanner} role="status" aria-live="polite">
              <img
                src={isDiseased ? diseasedMascot : healthyMascot}
                alt={t(`plantDisease.resultState.${resultState}.mascotAlt`)}
              />
              <div>
                <span className={styles.verdictKicker}>
                  {isDiseased ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                  {t(`plantDisease.resultState.${resultState}.previewBadge`)}
                </span>
                <h3>{t(`plantDisease.resultState.${resultState}.title`)}</h3>
                <p>{t(`plantDisease.resultState.${resultState}.description`)}</p>
              </div>
            </div>
          ) : null}

          <div className={styles.resultTitleRow}>
            <div>
              <span className={styles.resultLabel}>{t('plantDisease.detectedPlant')}</span>
              <h3>{result.plantName || t('plantDisease.unknownPlant')}</h3>
            </div>
            <span className={isDiseased ? styles.statusDanger : styles.statusHealthy}>
              {isDiseased ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              {statusLabel}
            </span>
          </div>

          <div className={styles.confidenceBlock}>
            <div><span>{t('plantDisease.confidence')}</span><strong>{(result.confidence * 100).toFixed(1)}%</strong></div>
            <div className={styles.confidenceTrack}>
              <span style={{ width: `${result.confidence * 100}%` }} />
            </div>
          </div>

          <dl className={styles.factGrid}>
            <div><dt><Clock3 size={15} /> {t('plantDisease.analyzed')}</dt><dd>{formatDate(result.analyzedAt, i18n.language) || t('plantDisease.notAvailable')}</dd></div>
            <div><dt><Dna size={15} /> {t('plantDisease.scientificName')}</dt><dd><i>{result.scientificName || t('plantDisease.notAvailable')}</i></dd></div>
            {!isHealthy ? <div><dt><FlaskConical size={15} /> {t('plantDisease.diseaseType')}</dt><dd>{result.type || t('plantDisease.notAvailable')}</dd></div> : null}
            {!isHealthy ? <div><dt><AlertTriangle size={15} /> {t('plantDisease.severity')}</dt><dd>{result.severity || t('plantDisease.notAvailable')}</dd></div> : null}
          </dl>

          {isHealthy ? (
            <div className={styles.healthyCare}>
              <h4><CheckCircle2 size={18} /> {t('plantDisease.healthyCareTitle')}</h4>
              <ul>
                <li>{t('plantDisease.healthyCareMonitor')}</li>
                <li>{t('plantDisease.healthyCareBalance')}</li>
                <li>{t('plantDisease.healthyCareRecheck')}</li>
              </ul>
            </div>
          ) : null}

          {!isHealthy && result.symptoms.length ? (
            <div className={styles.detailSection}>
              <h4>{t('plantDisease.observedSymptoms')}</h4>
              <ul>{result.symptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}</ul>
            </div>
          ) : null}

          {!isHealthy && result.treatment.length ? (
            <div className={styles.detailSection}>
              <h4>{t('plantDisease.recommendedTreatment')}</h4>
              <ol>{result.treatment.map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
          ) : null}

          {!isHealthy && result.recovery ? (
            <div className={styles.recoveryNote}><strong>{t('plantDisease.recoveryOutlook')}</strong><p>{result.recovery}</p></div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
