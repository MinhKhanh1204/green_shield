import { Activity, AlertTriangle, CheckCircle2, Clock3, Dna, FlaskConical, ScanSearch, ShieldAlert } from 'lucide-react'
import styles from '../../pages/plant-disease/PlantDiseasePage.module.css'

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString()
}

function EmptyState({ isAnalyzing }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}><ScanSearch size={35} /></span>
      <strong>{isAnalyzing ? 'Reading leaf patterns...' : 'Awaiting a leaf image'}</strong>
      <p>{isAnalyzing ? 'The AI service is preparing the diagnosis.' : 'Upload or capture a clear image to begin.'}</p>
    </div>
  )
}

export default function OutputPanel({ analysisCount, error, isAnalyzing, result }) {
  const isDiseased = result?.status === 'DISEASED'

  return (
    <section className={styles.panel} aria-labelledby="plant-disease-output-title">
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>Diagnosis</span>
          <h2 id="plant-disease-output-title">Analysis result</h2>
        </div>
        <span className={styles.stepBadge}>02</span>
      </div>

      <div className={styles.statsStrip}>
        <Activity size={18} />
        <div><strong>{analysisCount}</strong><span>successful analyses this session</span></div>
      </div>

      {error ? (
        <div className={styles.errorCard} role="alert">
          <ShieldAlert size={25} />
          <div><strong>Analysis unavailable</strong><p>{error}</p></div>
        </div>
      ) : null}

      {!result && !error ? <EmptyState isAnalyzing={isAnalyzing} /> : null}

      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.resultTitleRow}>
            <div>
              <span className={styles.resultLabel}>Detected plant</span>
              <h3>{result.plantName}</h3>
            </div>
            <span className={isDiseased ? styles.statusDanger : styles.statusHealthy}>
              {isDiseased ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              {result.status}
            </span>
          </div>

          <div className={styles.confidenceBlock}>
            <div><span>Confidence</span><strong>{(result.confidence * 100).toFixed(1)}%</strong></div>
            <div className={styles.confidenceTrack}>
              <span style={{ width: `${result.confidence * 100}%` }} />
            </div>
          </div>

          <dl className={styles.factGrid}>
            <div><dt><Clock3 size={15} /> Analyzed</dt><dd>{formatDate(result.analyzedAt)}</dd></div>
            <div><dt><Dna size={15} /> Scientific name</dt><dd><i>{result.scientificName || 'Not available'}</i></dd></div>
            <div><dt><FlaskConical size={15} /> Disease type</dt><dd>{result.type || 'Not available'}</dd></div>
            <div><dt><AlertTriangle size={15} /> Severity</dt><dd>{result.severity || 'Not available'}</dd></div>
          </dl>

          {result.symptoms.length ? (
            <div className={styles.detailSection}>
              <h4>Observed symptoms</h4>
              <ul>{result.symptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}</ul>
            </div>
          ) : null}

          {result.treatment.length ? (
            <div className={styles.detailSection}>
              <h4>Recommended treatment</h4>
              <ol>{result.treatment.map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
          ) : null}

          {result.recovery ? (
            <div className={styles.recoveryNote}><strong>Recovery outlook</strong><p>{result.recovery}</p></div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
