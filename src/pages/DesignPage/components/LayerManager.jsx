import React from 'react';

export default function LayerManager({
  isOpen,
  layers,
  dragLayerId,
  dragOverLayerId,
  setShowLayerOverlay,
  selectLayer,
  setDragLayerId,
  setDragOverLayerId,
  reorderLayerByDrag,
  getLayerLabel,
  moveLayer,
  toggleLayerVisibility,
  toggleLayerLock,
}) {
  if (!isOpen) return null;

  return (
    <div className="layer-overlay-panel" onClick={(event) => event.stopPropagation()}>
      <div className="layer-overlay-head">
        <span>Lop</span>
        <button type="button" onClick={() => setShowLayerOverlay(false)}>X</button>
      </div>
      {layers.length === 0 ? (
        <p className="design-layer-empty">Chua co doi tuong.</p>
      ) : (
        <div className="design-layer-list">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`design-layer-item draggable-layer${layer.isActive ? ' active' : ''}${dragLayerId === layer.id ? ' is-dragging' : ''}${dragOverLayerId === layer.id ? ' is-drag-over' : ''}`}
              onClick={() => selectLayer(layer.id)}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', layer.id);
                setDragLayerId(layer.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragLayerId && dragLayerId !== layer.id) setDragOverLayerId(layer.id);
              }}
              onDragLeave={() => {
                if (dragOverLayerId === layer.id) setDragOverLayerId(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                reorderLayerByDrag(dragLayerId, layer.id);
                setDragLayerId(null);
                setDragOverLayerId(null);
              }}
              onDragEnd={() => {
                setDragLayerId(null);
                setDragOverLayerId(null);
              }}
            >
              <div className="design-layer-title">
                <span>{getLayerLabel(layer)}</span>
              </div>
              <div className="design-layer-actions" onClick={(event) => event.stopPropagation()}>
                <button type="button" title="Dua len tren cung" onClick={() => moveLayer(layer.id, 'top')}><span className="material-symbols-rounded">vertical_align_top</span></button>
                <button type="button" title="Dua len" onClick={() => moveLayer(layer.id, 'up')}><span className="material-symbols-rounded">keyboard_arrow_up</span></button>
                <button type="button" title="Dua xuong" onClick={() => moveLayer(layer.id, 'down')}><span className="material-symbols-rounded">keyboard_arrow_down</span></button>
                <button type="button" title="Dua xuong duoi cung" onClick={() => moveLayer(layer.id, 'bottom')}><span className="material-symbols-rounded">vertical_align_bottom</span></button>
                <button type="button" title="Hien/an" onClick={() => toggleLayerVisibility(layer.id)}>{layer.visible ? <span className="material-symbols-rounded">visibility</span> : <span className="material-symbols-rounded">visibility_off</span>}</button>
                <button type="button" title="Khoa" onClick={() => toggleLayerLock(layer.id)}>{layer.locked ? <span className="material-symbols-rounded">lock</span> : <span className="material-symbols-rounded">lock_open</span>}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
