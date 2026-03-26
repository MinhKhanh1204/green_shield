import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const CANVAS_SIZE = 680;

/**
 * Renders design (Fabric JSON) on template by displaying Fabric canvases directly.
 * Avoids toDataURL to prevent "tainted canvas" SecurityError when images are cross-origin.
 */
export default function DesignPreviewCanvas({ template, designSnapshot, activeSide = 'front', zoom = 100 }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!template || !designSnapshot) return;

    setLoading(true);

    let parsed;
    try {
      parsed = typeof designSnapshot === 'string'
        ? JSON.parse(designSnapshot)
        : designSnapshot;
    } catch {
      setLoading(false);
      return;
    }

    const { front, back } = parsed;
    const frontJson = front || { objects: [] };
    const backJson = back || { objects: [] };

    const imgUrl =
      activeSide === 'front'
        ? template.frontImageUrl
        : template.backImageUrl;

    const savedJson =
      activeSide === 'front'
        ? frontJson
        : backJson;

    if (!canvasRef.current) return;

    let canvasEl = canvasRef.current.querySelector('canvas');

    if (!canvasEl) {
      canvasEl = document.createElement('canvas');
      canvasEl.width = CANVAS_SIZE;
      canvasEl.height = CANVAS_SIZE;
      canvasRef.current.appendChild(canvasEl);
    }

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

      const scale = Math.min(
        CANVAS_SIZE / img.width,
        CANVAS_SIZE / img.height
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (CANVAS_SIZE - img.width * scale) / 2,
        top: (CANVAS_SIZE - img.height * scale) / 2,
        selectable: false,
        evented: false,
      });

      c.setBackgroundImage(img, () => {
        if (savedJson?.objects?.length) {
          c.loadFromJSON(savedJson, () => {
            c.setZoom(zoom / 100); // 🔥
            c.renderAll();
            setLoading(false);
          });
        } else {
          c.setZoom(zoom / 100); // 🔥
          c.renderAll();
          setLoading(false);
        }
      });
    });

  }, [template, designSnapshot, activeSide, zoom]);

  return (
    <div
      className="preview-single-view"
      style={{
        opacity: loading ? 0 : 1,
        transition: 'opacity 0.25s ease',
      }}
    >
      {loading && <div className="preview-loading-inline">Đang tạo xem trước...</div>}
      <div ref={canvasRef} className="preview-canvas-wrap" />
    </div>
  );
}
