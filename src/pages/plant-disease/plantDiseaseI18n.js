const ERROR_KEYS = {
  INVALID_FILE: 'plantDisease.errors.invalidFile',
  UNSUPPORTED_TYPE: 'plantDisease.errors.unsupportedType',
  IMAGE_ONLY: 'plantDisease.errors.imageOnly',
  VIDEO_ONLY: 'plantDisease.errors.videoOnly',
  IMAGE_TOO_LARGE: 'plantDisease.errors.imageTooLarge',
  VIDEO_TOO_LARGE: 'plantDisease.errors.videoTooLarge',
  CAMERA_UNSUPPORTED: 'plantDisease.errors.cameraUnsupported',
  CAMERA_DENIED: 'plantDisease.errors.cameraDenied',
  CAPTURE_FAILED: 'plantDisease.errors.captureFailed',
  SERVICE_UNAVAILABLE: 'plantDisease.errors.serviceUnavailable',
  ANALYSIS_FAILED: 'plantDisease.errors.analysisFailed',
}

export function translatePlantDiseaseError(error, t) {
  const key = ERROR_KEYS[error?.code]
  if (key) {
    const size = error.code === 'IMAGE_TOO_LARGE' ? 10 : 50
    return t(key, { size })
  }
  return error?.message || t('plantDisease.errors.analysisFailed')
}
