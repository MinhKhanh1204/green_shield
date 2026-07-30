import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, LoaderCircle, RefreshCw, ScanSearch, Trash2, UploadCloud, Video } from 'lucide-react'
import { validatePlantMedia } from '../../services/plantDiseaseApi'
import styles from '../../pages/plant-disease/PlantDiseasePage.module.css'

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime'

export default function InputPanel({ isAnalyzing, onAnalyze, onClearAnalysis }) {
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
      setInputError(error.message)
      onClearAnalysis()
    }
  }, [mode, onClearAnalysis])

  const startCamera = useCallback(async () => {
    stopCamera()
    setInputError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error')
      setInputError('Camera access is not supported in this browser.')
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
      setInputError('Camera permission was denied or no camera is available.')
    }
  }, [stopCamera])

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
        setInputError('The camera image could not be captured.')
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
          <span className={styles.eyebrow}>Input</span>
          <h2 id="plant-disease-input-title">Leaf media</h2>
        </div>
        <span className={styles.stepBadge}>01</span>
      </div>

      <div className={styles.modeTabs} role="tablist" aria-label="Leaf media source">
        <button
          type="button"
          className={mode === 'image' ? styles.activeTab : styles.modeTab}
          onClick={() => changeMode('image')}
          role="tab"
          aria-selected={mode === 'image'}
        >
          <ImagePlus size={17} /> Image
        </button>
        <button
          type="button"
          className={mode === 'video' ? styles.activeTab : styles.modeTab}
          onClick={() => changeMode('video')}
          role="tab"
          aria-selected={mode === 'video'}
        >
          <Video size={17} /> Video
        </button>
        <button
          type="button"
          className={mode === 'camera' ? styles.activeTab : styles.modeTab}
          onClick={() => changeMode('camera')}
          role="tab"
          aria-selected={mode === 'camera'}
        >
          <Camera size={17} /> Camera
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
          <strong>Drop a clear leaf {mode} here</strong>
          <span>
            {mode === 'video'
              ? 'or click to browse MP4, WebM or MOV up to 50 MB'
              : 'or click to browse JPG, PNG or WebP up to 10 MB'}
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
            <div className={styles.cameraOverlay}><LoaderCircle className={styles.spin} /> Opening camera...</div>
          ) : null}
          {cameraState === 'error' ? (
            <button type="button" className={styles.secondaryButton} onClick={startCamera}>
              <RefreshCw size={16} /> Retry camera
            </button>
          ) : null}
          {cameraState === 'ready' ? (
            <button type="button" className={styles.captureButton} onClick={captureImage}>
              <Camera size={19} /> Capture leaf
            </button>
          ) : null}
        </div>
      ) : null}

      {previewUrl ? (
        <div className={styles.previewCard}>
          {selectedFile?.type.startsWith('video/') ? (
            <video src={previewUrl} controls playsInline aria-label="Selected leaf video preview" />
          ) : (
            <img src={previewUrl} alt="Selected leaf preview" />
          )}
          <div className={styles.previewMeta}>
            <div>
              <strong>{selectedFile?.name}</strong>
              <span>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
            </div>
            <button type="button" className={styles.iconButton} onClick={clearSelection} aria-label="Remove selected media">
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
        {isAnalyzing ? 'Analyzing leaf...' : 'Analyze leaf'}
      </button>
    </section>
  )
}
