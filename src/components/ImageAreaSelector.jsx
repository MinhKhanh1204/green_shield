import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import './ImageAreaSelector.css';

const PREVIEW_SIZE = 400;
const DEFAULT_AREA = { x: 10, y: 10, width: 80, height: 80 };

/**
 * Visual area selector: display image and let user drag/resize the custom area.
 * value/onChange use {x, y, width, height} in percentage (0-100).
 */
export default function ImageAreaSelector({ imageUrl, value, onChange }) {
  const area = value && typeof value === 'object'
    ? { ...DEFAULT_AREA, ...value }
    : DEFAULT_AREA;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const px = (pct) => (PREVIEW_SIZE * pct) / 100;

  const rndStyle = {
    left: px(area.x),
    top: px(area.y),
    width: px(area.width),
    height: px(area.height),
  };

  const handleDragStop = (e, d) => {
    if (!onChange) return;
    const newX = Math.max(0, Math.min(100 - area.width, (d.x / PREVIEW_SIZE) * 100));
    const newY = Math.max(0, Math.min(100 - area.height, (d.y / PREVIEW_SIZE) * 100));
    onChange({ ...area, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 });
  };

  const handleResizeStop = (e, direction, ref) => {
    if (!onChange) return;
    const w = (parseFloat(ref.style.width) / PREVIEW_SIZE) * 100;
    const h = (parseFloat(ref.style.height) / PREVIEW_SIZE) * 100;
    const newX = (parseFloat(ref.style.left) / PREVIEW_SIZE) * 100;
    const newY = (parseFloat(ref.style.top) / PREVIEW_SIZE) * 100;
    const clampedW = Math.max(5, Math.min(100 - newX, w));
    const clampedH = Math.max(5, Math.min(100 - newY, h));
    onChange({
      x: Math.round(Math.max(0, newX) * 10) / 10,
      y: Math.round(Math.max(0, newY) * 10) / 10,
      width: Math.round(clampedW * 10) / 10,
      height: Math.round(clampedH * 10) / 10,
    });
  };

  if (!imageUrl) {
    return (
      <div className="image-area-selector image-area-selector--empty">
        <span>Chọn ảnh trước để vẽ vùng custom</span>
      </div>
    );
  }

  return (
    <div className="image-area-selector">
      <div
        className="image-area-selector__preview"
        style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
      >
        <img
          src={imageUrl}
          alt="Preview"
          onLoad={() => { setImgLoaded(true); setImgError(false); }}
          onError={() => setImgError(true)}
        />
        {imgLoaded && !imgError && (
          <Rnd
            className="image-area-selector__rnd"
            size={{ width: rndStyle.width, height: rndStyle.height }}
            position={{ x: rndStyle.left, y: rndStyle.top }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            bounds="parent"
            enableResizing={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
            resizeHandleStyles={{
              top: { height: 8, top: -4 },
              bottom: { height: 8, bottom: -4 },
              left: { width: 8, left: -4 },
              right: { width: 8, right: -4 },
            }}
          >
            <div className="image-area-selector__overlay" />
          </Rnd>
        )}
        {imgError && <div className="image-area-selector__error">Không tải được ảnh</div>}
      </div>
      <div className="image-area-selector__values">
        x: {area.x}% · y: {area.y}% · w: {area.width}% · h: {area.height}%
      </div>
    </div>
  );
}
