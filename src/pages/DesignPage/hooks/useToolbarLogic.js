import { useCallback, useMemo } from 'react';
import { fabric } from 'fabric';
import { CURVE_PRESETS } from '../utils/designConstants';

export default function useToolbarLogic({
  fabricRef,
  selectedTextRef,
  clipBoundsRef,
  isEditableObject,
  syncSelectionState,
  pushHistory,
  syncLayers,
  ensureObjectId,
  applyObjectLockState,
  setTextProps,
  activeObjectInfo,
  textProps,
}) {
  const updateTextProp = useCallback((key, value) => {
    const obj = selectedTextRef.current;
    if (!obj || !fabricRef.current) return;
    const canvas = fabricRef.current;

    if (key === 'fontFamily') {
      const fontSize = obj.fontSize || 24;
      document.fonts.load(`${fontSize}px "${value}"`).then(() => {
        obj.set('fontFamily', value);
        if (typeof obj.initDimensions === 'function') obj.initDimensions();
        canvas?.requestRenderAll();
        setTextProps((prev) => (prev ? { ...prev, [key]: value } : null));
        syncSelectionState(obj);
        pushHistory(canvas);
      });
      return;
    }

    if (key === 'curveType') {
      obj.curveType = value;
      if (value === 'none') {
        obj.set('path', null);
      } else {
        const svg = CURVE_PRESETS[value];
        if (svg) {
          try {
            const path = new fabric.Path(svg, { fill: 'transparent', stroke: 'transparent', visible: false, selectable: false, evented: false });
            obj.set('path', path);
          } catch {
            // ignore invalid path preset
          }
        }
      }
    } else {
      obj.set(key, value);
    }

    canvas.requestRenderAll();
    setTextProps((prev) => (prev ? { ...prev, [key]: value } : null));
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [fabricRef, pushHistory, selectedTextRef, setTextProps, syncSelectionState]);

  const cycleTextCase = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = selectedTextRef.current;
    if (!canvas || !obj || obj.type !== 'i-text') return;

    const mode = obj.textCaseMode || 'normal';
    const current = String(obj.text || '');
    let nextMode = 'upper';
    let nextText = current.toUpperCase();

    if (mode === 'upper') {
      nextMode = 'lower';
      nextText = current.toLowerCase();
    } else if (mode === 'lower') {
      nextMode = 'title';
      nextText = current.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    } else if (mode === 'title') {
      nextMode = 'normal';
      nextText = current;
    }

    obj.textCaseMode = nextMode;
    obj.set('text', nextText);
    if (typeof obj.initDimensions === 'function') obj.initDimensions();
    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [fabricRef, pushHistory, selectedTextRef, syncSelectionState]);

  const cycleTextAlign = useCallback(() => {
    const obj = selectedTextRef.current;
    if (!obj || obj.type !== 'i-text') return;
    const order = ['left', 'center', 'right'];
    const idx = order.indexOf(obj.textAlign || 'left');
    const next = order[(idx + 1) % order.length];
    updateTextProp('textAlign', next);
  }, [selectedTextRef, updateTextProp]);

  const updateActiveObjectStyle = useCallback((patch) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return;

    if (Object.prototype.hasOwnProperty.call(patch, 'fill')) obj.set({ fill: patch.fill });
    if (Object.prototype.hasOwnProperty.call(patch, 'stroke')) obj.set({ stroke: patch.stroke });
    if (Object.prototype.hasOwnProperty.call(patch, 'strokeWidth')) obj.set({ strokeWidth: Number(patch.strokeWidth) || 0 });
    if (Object.prototype.hasOwnProperty.call(patch, 'radius')) {
      const radius = Math.max(0, Number(patch.radius) || 0);
      obj.set({ rx: radius, ry: radius });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'flipX')) obj.set({ flipX: Boolean(patch.flipX) });
    if (Object.prototype.hasOwnProperty.call(patch, 'flipY')) obj.set({ flipY: Boolean(patch.flipY) });

    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [fabricRef, isEditableObject, pushHistory, syncSelectionState]);

  const updateActiveObjectProp = useCallback((patch) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return;

    if (Object.prototype.hasOwnProperty.call(patch, 'scale')) {
      const scale = Math.max(0.1, Number(patch.scale) || 1);
      obj.set({ scaleX: scale, scaleY: scale });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'opacity')) {
      const opacity = Math.max(0.05, Math.min(1, Number(patch.opacity) || 1));
      obj.set({ opacity });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'angle')) obj.set({ angle: Number(patch.angle) || 0 });
    if (Object.prototype.hasOwnProperty.call(patch, 'x')) obj.set({ left: Number(patch.x) || 0 });
    if (Object.prototype.hasOwnProperty.call(patch, 'y')) obj.set({ top: Number(patch.y) || 0 });
    if (Object.prototype.hasOwnProperty.call(patch, 'visible')) obj.set({ visible: Boolean(patch.visible) });

    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [fabricRef, isEditableObject, pushHistory, syncSelectionState]);

  const getActiveEditableObject = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return null;
    return obj;
  }, [fabricRef, isEditableObject]);

  const deleteActiveObject = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return;

    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    syncSelectionState(null);
    pushHistory(canvas);
    syncLayers(canvas);
  }, [fabricRef, isEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const duplicateActiveObject = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = getActiveEditableObject();
    if (!canvas || !obj) return;

    obj.clone((cloned) => {
      cloned.set({
        left: (obj.left || 0) + 20,
        top: (obj.top || 0) + 20,
      });
      ensureObjectId(cloned);
      applyObjectLockState(cloned, false);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      syncSelectionState(cloned);
      pushHistory(canvas);
      syncLayers(canvas);
    });
  }, [applyObjectLockState, ensureObjectId, fabricRef, getActiveEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const fitImageToClip = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = getActiveEditableObject();
    const clip = clipBoundsRef.current;
    if (!canvas || !obj || !clip || obj.type !== 'image') return;

    const { clipX, clipY, clipW, clipH } = clip;
    const imgW = obj.width || 1;
    const imgH = obj.height || 1;
    const scale = Math.max(clipW / imgW, clipH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    obj.set({
      scaleX: scale,
      scaleY: scale,
      left: clipX + (clipW - drawW) / 2,
      top: clipY + (clipH - drawH) / 2,
    });

    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
    syncLayers(canvas);
  }, [clipBoundsRef, fabricRef, getActiveEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const derivedState = useMemo(() => {
    const isTextObject = activeObjectInfo?.type === 'i-text';
    const isImageObject = activeObjectInfo?.type === 'image';
    const isShapeObject = Boolean(activeObjectInfo) && !isTextObject && !isImageObject;
    const activeFillColor = activeObjectInfo?.fill || textProps?.fill || '#111827';
    const activeBorderColor = activeObjectInfo?.stroke || 'transparent';

    return {
      isTextObject,
      isImageObject,
      isShapeObject,
      activeFillColor,
      activeBorderColor,
    };
  }, [activeObjectInfo, textProps?.fill]);

  return {
    updateTextProp,
    cycleTextCase,
    cycleTextAlign,
    updateActiveObjectStyle,
    updateActiveObjectProp,
    getActiveEditableObject,
    deleteActiveObject,
    duplicateActiveObject,
    fitImageToClip,
    ...derivedState,
  };
}
