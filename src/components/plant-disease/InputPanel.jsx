import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, ImagePlus, LoaderCircle, RefreshCw, ScanSearch, Trash2, UploadCloud, Video } from 'lucide-react'
import teachingImage from '../../assets/teaching.png'
import { validatePlantMedia } from '../../services/plantDiseaseApi'
import styles from '../../pages/plant-disease/PlantDiseasePage.module.css'
import { translatePlantDiseaseError } from '../../pages/plant-disease/plantDiseaseI18n'

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime'

export default function InputPanel({ hasAnalysis, isAnalyzing, onAnalyze, onClearAnalysis }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState('image')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [inputError, setInputError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [cameraState, setCameraState] = useState('idle')
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraState('idle')
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl((currentUrl) => {
      if (currentUrl.startsWith('blob:')) URL.revokeObjectURL(currentUrl)
      return ''
    })
    setInputError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClearAnalysis()
  }, [onClearAnalysis])

  const selectFile = useCallback((file) => {
    try {
      validatePlantMedia(file, mode === 'video' ? 'video' : 'image')
      setInputError('')
      setSelectedFile(file)
      setPreviewUrl((currentUrl) => {
        if (currentUrl.startsWith('blob:')) URL.revokeObjectURL(currentUrl)
        return URL.createObjectURL(file)
      })
      onClearAnalysis()
    } catch (error) {
      setSelectedFile(null)
      setPreviewUrl((currentUrl) => {
        if (currentUrl.startsWith('blob:')) URL.revokeObjectURL(currentUrl)
        return ''
      })
      setInputError(translatePlantDiseaseError(error, t))
      onClearAnalysis()
    }
  }, [mode, onClearAnalysis, t])

  const startCamera = useCallback(async () => {
    stopCamera()
    setInputError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error')
      setInputError(t('plantDisease.errors.cameraUnsupported'))
      return
    }

    setCameraState('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraState('ready')
    } catch {
      stopCamera()
      setCameraState('error')
      setInputError(t('plantDisease.errors.cameraDenied'))
    }
  }, [stopCamera, t])

  useEffect(() => {
    if (mode === 'camera' && !previewUrl) startCamera()
    if (mode !== 'camera') stopCamera()
    return stopCamera
  }, [mode, previewUrl, startCamera, stopCamera])

  useEffect(() => () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const changeMode = (nextMode) => {
    if (nextMode === mode) return
    clearSelection()
    setMode(nextMode)
  }

  const captureImage = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) {
        setInputError(t('plantDisease.errors.captureFailed'))
        return
      }

      selectFile(new File([blob], `leaf-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  return (
    <section className={styles.panel} aria-labelledby="plant-disease-input-title">
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>{t('plantDisease.input')}</span>
          <h2 id="plant-disease-input-title">{t('plantDisease.leafMedia')}</h2>
        </div>
        <span className={styles.stepBadge}>01</span>
      </div>

      <div className={styles.modeTabs} role="tablist" aria-label={t('plantDisease.mediaSource')}>
        <button
          type="button"
          className={mode === 'image' ? styles.activeTab : styles.modeTab}
          onClick={() => changeMode('image')}
          role="tab"
          aria-selected={mode === 'image'}
        >
          <ImagePlus size={17} /> {t('plantDisease.image')}
        </button>
        <button
          type="button"
          className={mode === 'video' ? styles.activeTab : styles.modeTab}
          onClick={() => changeMode('video')}
          role="tab"
          aria-selected={mode === 'video'}
        >
          <Video size={17} /> {t('plantDisease.video')}
        </button>
        <button
          type="button"
          className={mode === 'camera' ? styles.activeTab : styles.modeTab}
          onClick={() => changeMode('camera')}
          role="tab"
          aria-selected={mode === 'camera'}
        >
          <Camera size={17} /> {t('plantDisease.camera')}
        </button>
      </div>

      {mode !== 'camera' && !previewUrl ? (
        <button
          type="button"
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <span className={styles.uploadIcon}><UploadCloud size={30} /></span>
          <strong>{t(mode === 'video' ? 'plantDisease.dropVideo' : 'plantDisease.dropImage')}</strong>
          <span>
            {t(mode === 'video' ? 'plantDisease.browseVideo' : 'plantDisease.browseImage')}
          </span>
        </button>
      ) : null}

      <input
        ref={fileInputRef}
        className={styles.visuallyHidden}
        type="file"
        accept={mode === 'video' ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES}
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {mode === 'camera' && !previewUrl ? (
        <div className={styles.cameraStage}>
          <video ref={videoRef} className={styles.cameraVideo} muted playsInline />
          {cameraState === 'loading' ? (
            <div className={styles.cameraOverlay}><LoaderCircle className={styles.spin} /> {t('plantDisease.openingCamera')}</div>
          ) : null}
          {cameraState === 'error' ? (
            <button type="button" className={styles.secondaryButton} onClick={startCamera}>
              <RefreshCw size={16} /> {t('plantDisease.retryCamera')}
            </button>
          ) : null}
          {cameraState === 'ready' ? (
            <button type="button" className={styles.captureButton} onClick={captureImage}>
              <Camera size={19} /> {t('plantDisease.captureLeaf')}
            </button>
          ) : null}
        </div>
      ) : null}

      {previewUrl ? (
        <div className={styles.previewCard}>
          {selectedFile?.type.startsWith('video/') ? (
            <video src={previewUrl} controls playsInline aria-label={t('plantDisease.selectedVideoPreview')} />
          ) : (
            <img src={previewUrl} alt={t('plantDisease.selectedImagePreview')} />
          )}
          <div className={styles.previewMeta}>
            <div>
              <strong>{selectedFile?.name}</strong>
              <span>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
            </div>
            <button type="button" className={styles.iconButton} onClick={clearSelection} aria-label={t('plantDisease.removeSelectedMedia')}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {inputError ? <p className={styles.inputError} role="alert">{inputError}</p> : null}

      <button
        type="button"
        className={styles.analyzeButton}
        disabled={!selectedFile || isAnalyzing}
        onClick={() => onAnalyze(selectedFile)}
      >
        {isAnalyzing ? <LoaderCircle className={styles.spin} size={19} /> : <ScanSearch size={19} />}
        {isAnalyzing ? t('plantDisease.analyzingLeaf') : t('plantDisease.analyzeLeaf')}
      </button>

      {hasAnalysis ? (
        <aside className={styles.teachingMoment} aria-label={t('plantDisease.teachingTitle')}>
          <div className={styles.teachingQuote}>
            <strong>{t('plantDisease.teachingTitle')}</strong>
            <span>{t('plantDisease.teachingDescription')}</span>
          </div>
          <img src={teachingImage} alt="" aria-hidden="true" />
        </aside>
      ) : null}
    </section>
  )
}
