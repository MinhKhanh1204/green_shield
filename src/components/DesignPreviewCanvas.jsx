import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const CANVAS_SIZE = 680;

/**
 * Renders design (Fabric JSON) on template by displaying Fabric canvases directly.
 * Avoids toDataURL to prevent "tainted canvas" SecurityError when images are cross-origin.
 */
export default function DesignPreviewCanvas({ template, designSnapshot, activeSide = 'front' }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!template || !designSnapshot) return;

    setLoading(true);
    let parsed;
    try {
      parsed = typeof designSnapshot === 'string' ? JSON.parse(designSnapshot) : designSnapshot;
    } catch {
      setLoading(false);
      return;
    }

    const { front, back } = parsed;
    const frontJson = front || { objects: [] };
    const backJson = back || { objects: [] };
    const imgUrl = activeSide === 'front' ? template.frontImageUrl : template.backImageUrl;
    const savedJson = activeSide === 'front' ? frontJson : backJson;

    if (!canvasRef?.current) return;

    const canvasEl = document.createElement('canvas');
    canvasEl.width = CANVAS_SIZE;
    canvasEl.height = CANVAS_SIZE;
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(canvasEl);

    const c = new fabric.StaticCanvas(canvasEl, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      renderOnAddRemove: false,
    });

    fabric.Image.fromURL(imgUrl, (img) => {
      if (!img || !img.width) {
        setLoading(false);
        return;
      }
      const imgW = img.width || 1;
      const imgH = img.height || 1;
      const scale = Math.min(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;
      const imgLeft = (CANVAS_SIZE - scaledW) / 2;
      const imgTop = (CANVAS_SIZE - scaledH) / 2;

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: imgLeft,
        top: imgTop,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
      });

      c.setBackgroundImage(img, () => {
        if (savedJson && (savedJson.objects?.length > 0 || savedJson.version)) {
          c.loadFromJSON(savedJson, () => {
            c.renderAll();
            setLoading(false);
          });
        } else {
          c.renderAll();
          setLoading(false);
        }
      });
    });

    return () => {
      c.dispose();
    };
  }, [template, designSnapshot, activeSide]);

  return (
    <div className="preview-single-view">
      {loading && <div className="preview-loading-inline">Đang tạo preview...</div>}
      <div ref={canvasRef} className="preview-canvas-wrap" />
    </div>
  );
}
