import React, { useEffect, useState } from 'react';
import { Select, Tooltip } from 'antd';
import { Dock, DockItem } from '@/components/ui/dock';

export default function FloatingToolbar({
  activeObjectInfo,
  isTextObject,
  isImageObject,
  isShapeObject,
  textProps,
  setShowLayerOverlay,
  updateTextProp,
  cycleTextCase,
  cycleTextAlign,
  updateActiveObjectStyle,
  updateActiveObjectProp,
  duplicateActiveObject,
  deleteActiveObject,
  fontOptions,
  fontSizePresets,
  activeFillColor,
  toolbarPosition,
  onOpenDesignTab,
}) {
  const [activeControl, setActiveControl] = useState(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target.closest('.toolbar-floating-wrap')) {
        setActiveControl(null);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setActiveControl(null);
  }, [activeObjectInfo?.type]);

  if (!activeObjectInfo) return null;

  const wrapperStyle = toolbarPosition
    ? { position: 'fixed', left: toolbarPosition.x, top: toolbarPosition.y }
    : { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)' };

  const opacityValue = Number(activeObjectInfo?.opacity ?? 1);
  const borderValue = Number(activeObjectInfo?.strokeWidth ?? 0);
  const radiusValue = Number(activeObjectInfo?.radius ?? 0);

  const toggleControl = (controlKey) => {
    setActiveControl((prev) => (prev === controlKey ? null : controlKey));
  };

  return (
    <div className="toolbar-floating-wrap" style={wrapperStyle} onClick={(e) => e.stopPropagation()}>
      <Dock
        className="toolbar-floating toolbar-floating--in-body"
        itemSize={40}
        magnification={1.2}
        distance={100}
        spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
      >
        {isTextObject && (
          <div className="toolbar-group">
            <DockItem className="dock-item--font-select" enableScale={false}>
              <Select
                value={textProps?.fontFamily}
                options={fontOptions}
                onChange={(v) => updateTextProp('fontFamily', v)}
                popupMatchSelectWidth={220}
                className="toolbar-select toolbar-select--font"
                showSearch
              />
            </DockItem>

            <DockItem className="dock-item--size-select" enableScale={false}>
              <Select
                value={Number(textProps?.fontSize || 16)}
                options={fontSizePresets.map((size) => ({ value: size, label: `${size}px` }))}
                onChange={(v) => updateTextProp('fontSize', v)}
                className="toolbar-select toolbar-select--size"
              />
            </DockItem>

            <Tooltip title="Màu chữ">
              <DockItem enableScale={false}>
                <button className="dock-item-btn dock-color-trigger" onClick={() => onOpenDesignTab?.('color-fill')}>
                  <span className="material-symbols-rounded">format_color_text</span>
                  <span className="dock-color-dot" style={{ background: textProps?.fill || '#111827' }} />
                </button>
              </DockItem>
            </Tooltip>
            <Tooltip title="In đậm"><DockItem enableScale={false} active={textProps?.fontWeight === 'bold'}><button className={`dock-item-btn${textProps?.fontWeight === 'bold' ? ' active' : ''}`} onClick={() => updateTextProp('fontWeight', textProps?.fontWeight === 'bold' ? 'normal' : 'bold')}>B</button></DockItem></Tooltip>
            <Tooltip title="In nghiêng"><DockItem enableScale={false} active={textProps?.fontStyle === 'italic'}><button className={`dock-item-btn${textProps?.fontStyle === 'italic' ? ' active' : ''}`} onClick={() => updateTextProp('fontStyle', textProps?.fontStyle === 'italic' ? 'normal' : 'italic')}>I</button></DockItem></Tooltip>
            <Tooltip title="Gạch chân"><DockItem enableScale={false} active={textProps?.underline}><button className={`dock-item-btn${textProps?.underline ? ' active' : ''}`} onClick={() => updateTextProp('underline', !textProps?.underline)}>U</button></DockItem></Tooltip>
            <Tooltip title="Kiểu chữ hoa/thường"><DockItem enableScale={false}><button className="dock-item-btn" onClick={cycleTextCase}>aA</button></DockItem></Tooltip>
            <Tooltip title="Căn lề"><DockItem enableScale={false}><button className="dock-item-btn" onClick={cycleTextAlign}><span className="material-symbols-rounded">format_align_center</span></button></DockItem></Tooltip>
          </div>
        )}

        {(isImageObject || isShapeObject) && (
          <div className="toolbar-group">
            <Tooltip title="Màu đối tượng">
              <DockItem enableScale={false}>
                <button className="dock-item-btn dock-color-trigger" onClick={() => onOpenDesignTab?.('color-fill')}>
                  <span className="material-symbols-rounded">palette</span>
                  <span className="dock-color-dot" style={{ background: activeFillColor || '#111827' }} />
                </button>
              </DockItem>
            </Tooltip>

            <Tooltip title="Độ mờ">
              <DockItem enableScale={false}>
                <button
                  className={`dock-item-btn${activeControl === 'opacity' ? ' active' : ''}`}
                  onClick={() => toggleControl('opacity')}
                >
                  <span className="material-symbols-rounded">opacity</span>
                </button>
              </DockItem>
            </Tooltip>

            <Tooltip title="Viền">
              <DockItem enableScale={false}>
                <button
                  className={`dock-item-btn${activeControl === 'border' ? ' active' : ''}`}
                  style={{ boxShadow: `inset 0 0 0 1px ${activeObjectInfo?.stroke || 'transparent'}` }}
                  onClick={() => {
                    toggleControl('border');
                    onOpenDesignTab?.('color-border');
                  }}
                >
                  <span className="material-symbols-rounded">border_outer</span>
                </button>
              </DockItem>
            </Tooltip>

            <Tooltip title="Bo góc">
              <DockItem enableScale={false}>
                <button
                  className={`dock-item-btn${activeControl === 'radius' ? ' active' : ''}`}
                  onClick={() => toggleControl('radius')}
                >
                  <span className="material-symbols-rounded">rounded_corner</span>
                </button>
              </DockItem>
            </Tooltip>
          </div>
        )}

        <div className="toolbar-group">
          <Tooltip title="Nhân đôi"><DockItem enableScale={false}><button className="dock-item-btn" onClick={duplicateActiveObject}><span className="material-symbols-rounded">content_copy</span></button></DockItem></Tooltip>
          <Tooltip title="Xóa"><DockItem enableScale={false}><button className="dock-item-btn" onClick={deleteActiveObject}><span className="material-symbols-rounded">delete</span></button></DockItem></Tooltip>
          <Tooltip title="Lớp"><DockItem enableScale={false}><button className="dock-item-btn" onClick={() => setShowLayerOverlay((v) => !v)}><span className="material-symbols-rounded">layers</span></button></DockItem></Tooltip>
        </div>
      </Dock>

      {activeControl === 'opacity' && (isImageObject || isShapeObject) && (
        <div className="toolbar-inline-control magic-dock design-zoom-bar">
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.01}
            value={opacityValue}
            onChange={(e) => updateActiveObjectProp({ opacity: Number(e.target.value) })}
          />
          <input
            type="number"
            min={0.05}
            max={1}
            step={0.01}
            value={opacityValue}
            onChange={(e) => updateActiveObjectProp({ opacity: Number(e.target.value) })}
          />
        </div>
      )}

      {activeControl === 'border' && (isImageObject || isShapeObject) && (
        <div className="toolbar-inline-control magic-dock design-zoom-bar">
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={borderValue}
            onChange={(e) => updateActiveObjectStyle({ strokeWidth: Number(e.target.value) })}
          />
          <input
            type="number"
            min={0}
            max={10}
            step={1}
            value={borderValue}
            onChange={(e) => updateActiveObjectStyle({ strokeWidth: Number(e.target.value) })}
          />
        </div>
      )}

      {activeControl === 'radius' && (isImageObject || isShapeObject) && (
        <div className="toolbar-inline-control magic-dock design-zoom-bar">
          <input
            type="range"
            min={0}
            max={80}
            step={1}
            value={radiusValue}
            onChange={(e) => updateActiveObjectStyle({ radius: Number(e.target.value) })}
          />
          <input
            type="number"
            min={0}
            max={80}
            step={1}
            value={radiusValue}
            onChange={(e) => updateActiveObjectStyle({ radius: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  );
}
