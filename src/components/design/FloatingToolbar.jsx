import React from 'react';
import { Input, Select, Slider, Tooltip } from 'antd';
import { AlignCenterOutlined, AppstoreOutlined, ColumnHeightOutlined, CopyOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

export default function FloatingToolbar({
  activeObjectInfo,
  isTextObject,
  isImageObject,
  isShapeObject,
  textProps,
  floatingTool,
  setFloatingTool,
  setShowLayerOverlay,
  updateTextProp,
  cycleTextCase,
  cycleTextAlign,
  updateActiveObjectStyle,
  updateActiveObjectProp,
  fitImageToClip,
  duplicateActiveObject,
  deleteActiveObject,
  fontOptions,
  fontSizePresets,
  activeFillColor,
  toolbarPosition,
}) {
  if (!activeObjectInfo) return null;

  const toolbarStyle = toolbarPosition
    ? { left: toolbarPosition.x, top: toolbarPosition.y }
    : { left: 120, top: 76 };
  const panelStyle = toolbarPosition
    ? { left: toolbarPosition.x, top: toolbarPosition.y + 46 }
    : { left: 120, top: 122 };

  return (
    <>
      <div className="toolbar-floating toolbar-floating--in-body" style={toolbarStyle} onClick={(e) => e.stopPropagation()}>
        {isTextObject && (
          <>
            <Tooltip title="Font family">
              <Select
                value={textProps?.fontFamily}
                options={fontOptions}
                onChange={(v) => updateTextProp('fontFamily', v)}
                style={{ width: 180 }}
                showSearch
                optionFilterProp="label"
              />
            </Tooltip>
            <Tooltip title="Font size">
              <Select
                value={Number(textProps?.fontSize) || 16}
                options={fontSizePresets.map((n) => ({ value: n, label: String(n) }))}
                onChange={(v) => updateTextProp('fontSize', v)}
                style={{ width: 92 }}
              />
            </Tooltip>
            <Tooltip title="Text color">
              <label className="toolbar-icon-btn toolbar-color-btn">
                <input type="color" value={textProps?.fill || '#111827'} onChange={(e) => updateTextProp('fill', e.target.value)} />
              </label>
            </Tooltip>
            <Tooltip title="Bold"><button className={`toolbar-icon-btn${textProps?.fontWeight === 'bold' ? ' active' : ''}`} onClick={() => updateTextProp('fontWeight', textProps?.fontWeight === 'bold' ? 'normal' : 'bold')}>B</button></Tooltip>
            <Tooltip title="Italic"><button className={`toolbar-icon-btn${textProps?.fontStyle === 'italic' ? ' active' : ''}`} onClick={() => updateTextProp('fontStyle', textProps?.fontStyle === 'italic' ? 'normal' : 'italic')}>I</button></Tooltip>
            <Tooltip title="Underline"><button className={`toolbar-icon-btn${textProps?.underline ? ' active' : ''}`} onClick={() => updateTextProp('underline', !textProps?.underline)}>U</button></Tooltip>
            <Tooltip title="Text case"><button className="toolbar-icon-btn" onClick={cycleTextCase}>aA</button></Tooltip>
            <Tooltip title="Align"><button className="toolbar-icon-btn" onClick={cycleTextAlign}><AlignCenterOutlined /></button></Tooltip>
          </>
        )}

        {(isImageObject || isShapeObject) && (
          <>
            <Tooltip title="Object color">
              <label className="toolbar-icon-btn toolbar-color-btn">
                <input type="color" value={activeFillColor || '#111827'} onChange={(e) => updateActiveObjectStyle({ fill: e.target.value })} />
              </label>
            </Tooltip>
            <Tooltip title="Opacity"><button className="toolbar-icon-btn" onClick={() => setFloatingTool((p) => (p === 'opacity' ? null : 'opacity'))}><EyeOutlined /></button></Tooltip>
            <Tooltip title="Border"><button className="toolbar-icon-btn" onClick={() => setFloatingTool((p) => (p === 'border' ? null : 'border'))}><AppstoreOutlined /></button></Tooltip>
            <Tooltip title="Radius"><button className="toolbar-icon-btn" onClick={() => setFloatingTool((p) => (p === 'radius' ? null : 'radius'))}><ColumnHeightOutlined /></button></Tooltip>
            {isImageObject && <Tooltip title="Fit to print area"><button className="toolbar-icon-btn" onClick={fitImageToClip}>Fit</button></Tooltip>}
          </>
        )}

        <Tooltip title="Duplicate"><button className="toolbar-icon-btn" onClick={duplicateActiveObject}><CopyOutlined /></button></Tooltip>
        <Tooltip title="Delete"><button className="toolbar-icon-btn" onClick={deleteActiveObject}><DeleteOutlined /></button></Tooltip>
        <Tooltip title="Layers"><button className="toolbar-icon-btn" onClick={() => setShowLayerOverlay((v) => !v)}><AppstoreOutlined /></button></Tooltip>
      </div>

      {floatingTool && (
        <div className="toolbar-floating-panel toolbar-floating-panel--in-body" style={panelStyle} onClick={(e) => e.stopPropagation()}>
          {floatingTool === 'opacity' && (
            <div className="floating-slider-row">
              <Slider min={0.05} max={1} step={0.01} value={activeObjectInfo.opacity} onChange={(v) => updateActiveObjectProp({ opacity: v })} />
            </div>
          )}

          {floatingTool === 'border' && (
            <div className="floating-border-tools">
              <label className="toolbar-icon-btn toolbar-color-btn" title="Border color">
                <input type="color" onChange={(e) => updateActiveObjectStyle({ stroke: e.target.value })} />
              </label>
              <button className="toolbar-icon-btn" onClick={() => updateActiveObjectStyle({ strokeWidth: 1 })}>1</button>
              <button className="toolbar-icon-btn" onClick={() => updateActiveObjectStyle({ strokeWidth: 2 })}>2</button>
              <button className="toolbar-icon-btn" onClick={() => updateActiveObjectStyle({ strokeWidth: 4 })}>4</button>
            </div>
          )}

          {floatingTool === 'radius' && (
            <div className="floating-slider-row">
              <Slider min={0} max={80} step={1} defaultValue={0} onChange={(v) => updateActiveObjectStyle({ radius: v })} />
            </div>
          )}

          {floatingTool === 'size' && (
            <div className="floating-size-list">
              {fontSizePresets.map((size) => (
                <button key={size} className={`font-item${Number(textProps?.fontSize) === size ? ' active' : ''}`} onClick={() => updateTextProp('fontSize', size)}>
                  {size}
                </button>
              ))}
              <Input type="number" min={8} max={200} value={textProps?.fontSize || 16} onChange={(e) => updateTextProp('fontSize', Number(e.target.value) || 16)} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
