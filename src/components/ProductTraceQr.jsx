import { useEffect, useRef } from 'react'
import { renderProductTraceQr } from '../utils/productTraceQr'
import styles from './ProductTraceQr.module.css'

export default function ProductTraceQr({ traceCode, label, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    renderProductTraceQr(canvasRef.current, traceCode).catch(() => {})
  }, [traceCode])

  if (!traceCode) return null

  return (
    <span className={`${styles.qr} ${className}`} role="img" title={label} aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </span>
  )
}
