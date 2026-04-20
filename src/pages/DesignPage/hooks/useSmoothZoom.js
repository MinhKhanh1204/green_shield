import { useCallback, useEffect, useRef } from 'react';

export default function useSmoothZoom({ zoom, setZoom }) {
  const zoomAnimRef = useRef(null);
  const zoomValueRef = useRef(100);

  useEffect(() => {
    zoomValueRef.current = zoom;
  }, [zoom]);

  useEffect(() => () => {
    if (zoomAnimRef.current) {
      cancelAnimationFrame(zoomAnimRef.current);
      zoomAnimRef.current = null;
    }
  }, []);

  const smoothZoomTo = useCallback((target) => {
    const clampedTarget = Math.max(50, Math.min(300, Number(target) || 100));
    if (zoomAnimRef.current) {
      cancelAnimationFrame(zoomAnimRef.current);
      zoomAnimRef.current = null;
    }

    const step = () => {
      const current = zoomValueRef.current;
      const next = current + (clampedTarget - current) * 0.18;
      const done = Math.abs(clampedTarget - next) < 0.4;
      const finalValue = done ? clampedTarget : next;
      zoomValueRef.current = finalValue;
      setZoom(Math.round(finalValue));
      if (!done) {
        zoomAnimRef.current = requestAnimationFrame(step);
      } else {
        zoomAnimRef.current = null;
      }
    };

    zoomAnimRef.current = requestAnimationFrame(step);
  }, [setZoom]);

  return {
    zoomValueRef,
    smoothZoomTo,
  };
}
