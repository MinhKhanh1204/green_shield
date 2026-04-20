import { useEffect } from 'react';
import { fabric } from 'fabric';
import { CANVAS_SIZE } from '../utils/designConstants';

export default function useCanvasEffects({
  template,
  loading,
  side,
  templateId,
  snapshotState,
  fabricRef,
  designRef,
  clipBoundsRef,
  clipSideRef,
  bgRectRef,
  selectedTextRef,
  isSpacePressedRef,
  canvasInitializedRef,
  initializedSideRef,
  lastCanvasLoadKeyRef,
  moveRafRef,
  pendingMoveTargetRef,
  lastSnapResultRef,
  zoomValueRef,
  setCanvasSideReady,
  setGuides,
  setDistanceHint,
  setAutoAlignHint,
  setTextProps,
  setActiveObjectInfo,
  setContextMenu,
  applyObjectLockState,
  closeContextMenu,
  ensureObjectId,
  exportCanvasJson,
  getSnapPoints,
  detectSnap,
  applySnap,
  handleRedo,
  handleUndo,
  initHistoryForCurrentSide,
  isEditableObject,
  pushHistory,
  smoothZoomTo,
  syncLayers,
  syncSelectionState,
}) {
  useEffect(() => {
    if (!template || loading) return;
    const loadKey = `${template?.id || 'template'}:${side}:${loading ? '1' : '0'}`;
    if (lastCanvasLoadKeyRef.current === loadKey && fabricRef.current) return;
    lastCanvasLoadKeyRef.current = loadKey;

    canvasInitializedRef.current = true;
    initializedSideRef.current = side;
    let disposed = false;
    let blockNativeContextMenu = null;
    const currentSide = side;
    const designStore = designRef.current;
    const canvas = fabricRef.current || new fabric.Canvas('design-canvas', { width: CANVAS_SIZE, height: CANVAS_SIZE });
    fabricRef.current = canvas;
    canvas.off();
    canvas.setWidth(CANVAS_SIZE);
    canvas.setHeight(CANVAS_SIZE);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    const onKeyDown = (event) => {
      if (disposed) return;

      if (event.code === 'Space') {
        isSpacePressedRef.current = true;
      }

      const isUndo = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z';
      const isRedo = ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y')
        || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z');
      if (isUndo) {
        event.preventDefault();
        handleUndo();
        return;
      }
      if (isRedo) {
        event.preventDefault();
        handleRedo();
        return;
      }

      const active = canvas.getActiveObject();
      if (!active || !isEditableObject(active)) return;
      if (active.type === 'i-text' && active.isEditing) return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        syncSelectionState(null);
        pushHistory(canvas);
        return;
      }

      const step = event.shiftKey ? 10 : 1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (event.key === 'ArrowLeft') active.set('left', (active.left || 0) - step);
        if (event.key === 'ArrowRight') active.set('left', (active.left || 0) + step);
        if (event.key === 'ArrowUp') active.set('top', (active.top || 0) - step);
        if (event.key === 'ArrowDown') active.set('top', (active.top || 0) + step);
        active.setCoords();
        canvas.requestRenderAll();
        syncSelectionState(active);
        pushHistory(canvas);
      }
    };

    const onKeyUp = (event) => {
      if (event.code === 'Space') isSpacePressedRef.current = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    const originalCornerSize = fabric.Object.prototype.cornerSize;
    const originalPadding = fabric.Object.prototype.padding;
    fabric.Object.prototype.cornerSize = 8;
    fabric.Object.prototype.padding = 0;

    const imageUrl = side === 'front' ? template.frontImageUrl : template.backImageUrl;

    const parseArea = (value) => {
      if (!value) return { x: 10, y: 10, width: 80, height: 80 };
      try {
        const parsed = typeof value === 'object' ? value : JSON.parse(value || '{}');
        return { x: 10, y: 10, width: 80, height: 80, ...parsed };
      } catch {
        return { x: 10, y: 10, width: 80, height: 80 };
      }
    };

    const customArea = parseArea(side === 'front' ? template.frontCustomArea : template.backCustomArea);
    const { x = 10, y = 10, width = 80, height = 80 } = customArea;

    fabric.Image.fromURL(imageUrl, (img) => {
      if (disposed) return;
      if (initializedSideRef.current !== currentSide) {
        canvas.clear();
      }

      initializedSideRef.current = currentSide;
      const imgW = img?.width || 1;
      const imgH = img?.height || 1;
      const scale = Math.min(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;
      const imgLeft = (CANVAS_SIZE - scaledW) / 2;
      const imgTop = (CANVAS_SIZE - scaledH) / 2;

      const clipX = imgLeft + (scaledW * x) / 100;
      const clipY = imgTop + (scaledH * y) / 100;
      const clipW = (scaledW * width) / 100;
      const clipH = (scaledH * height) / 100;

      const createObjectClipPath = () => new fabric.Rect({
        left: clipX,
        top: clipY,
        width: clipW,
        height: clipH,
        absolutePositioned: true,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });

      const applyObjectClipPath = (object) => {
        if (!isEditableObject(object)) return;
        object.clipPath = createObjectClipPath();
      };

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

      clipBoundsRef.current = { clipX, clipY, clipW, clipH };
      clipSideRef.current = side;
      if (!disposed) setCanvasSideReady(side);
      bgRectRef.current = null;

      let guideRect;
      let isPanning = false;
      let lastPosX = 0;
      let lastPosY = 0;
      let historyReady = false;

      const clampToClip = (object) => {
        if (!object || object === guideRect || object === bgRectRef.current) return;
        let widthVal = (object.width || 0) * (object.scaleX || 1);
        let heightVal = (object.height || 0) * (object.scaleY || 1);
        const baseW = object.width || 1;
        const baseH = object.height || 1;
        if (widthVal > clipW || heightVal > clipH) {
          const scaleLimit = Math.min(clipW / baseW, clipH / baseH);
          object.set({ scaleX: Math.min(object.scaleX || 1, scaleLimit), scaleY: Math.min(object.scaleY || 1, scaleLimit) });
          widthVal = baseW * (object.scaleX || 1);
          heightVal = baseH * (object.scaleY || 1);
        }
        const maxLeft = clipX + clipW - widthVal;
        const maxTop = clipY + clipH - heightVal;
        object.set({
          left: Math.max(clipX, Math.min(object.left, maxLeft)),
          top: Math.max(clipY, Math.min(object.top, maxTop)),
        });
      };

      const applyDraggingVisual = (object) => {
        if (!object || !isEditableObject(object) || object.__dragLifted) return;
        object.__baseShadow = object.shadow || null;
        object.__dragLifted = true;
        object.set({
          shadow: {
            color: 'rgba(22,163,74,0.25)',
            blur: 18,
            offsetX: 0,
            offsetY: 8,
          },
        });
      };

      const clearDraggingVisual = (object) => {
        if (!object || !object.__dragLifted) return;
        object.set({ shadow: object.__baseShadow || null });
        object.__baseShadow = null;
        object.__dragLifted = false;
        object.__smoothLeft = null;
        object.__smoothTop = null;
      };

      const setGuideState = (nextGuides) => {
        setGuides((prev) => {
          if (prev.length !== nextGuides.length) return nextGuides;
          for (let index = 0; index < prev.length; index += 1) {
            const before = prev[index];
            const after = nextGuides[index];
            if (!after) return nextGuides;
            if (
              before.axis !== after.axis
              || Math.round(before.left) !== Math.round(after.left)
              || Math.round(before.top) !== Math.round(after.top)
              || Math.round(before.length) !== Math.round(after.length)
            ) {
              return nextGuides;
            }
          }
          return prev;
        });
      };

      const renderGuides = (guideList) => {
        if (!guideList?.length || !canvas.upperCanvasEl) {
          setGuideState([]);
          return;
        }
        const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const toScreen = (xValue, yValue) => fabric.util.transformPoint(new fabric.Point(xValue, yValue), vpt);

        const mapped = guideList.map((guide, index) => {
          if (guide.axis === 'x') {
            const p1 = toScreen(guide.value, guide.from);
            const p2 = toScreen(guide.value, guide.to);
            const top = canvasRect.top + Math.min(p1.y, p2.y);
            return {
              id: `gx-${index}`,
              axis: 'x',
              kind: guide.kind || 'align',
              label: guide.label || '',
              left: canvasRect.left + p1.x,
              top,
              length: Math.abs(p2.y - p1.y),
            };
          }
          const p1 = toScreen(guide.from, guide.value);
          const p2 = toScreen(guide.to, guide.value);
          const left = canvasRect.left + Math.min(p1.x, p2.x);
          return {
            id: `gy-${index}`,
            axis: 'y',
            kind: guide.kind || 'align',
            label: guide.label || '',
            left,
            top: canvasRect.top + p1.y,
            length: Math.abs(p2.x - p1.x),
          };
        });

        setGuideState(mapped);
      };

      const clearGuides = () => {
        setGuideState([]);
      };

      const runSnap = (object) => {
        if (!object || !isEditableObject(object)) {
          clearGuides();
          setDistanceHint(null);
          return;
        }

        const snapInput = getSnapPoints({
          movingObject: object,
          canvas,
          clipBounds: { clipX, clipY, clipW, clipH },
        });
        const snapResult = detectSnap({
          sourcePoints: snapInput?.sourcePoints,
          targetsX: snapInput?.targetsX || [],
          targetsY: snapInput?.targetsY || [],
          threshold: 6,
        });
        applySnap({
          object,
          snapResult,
          magneticStrength: 0.8,
        });

        lastSnapResultRef.current = snapResult;
        if (Number.isFinite(snapResult.distance)) {
          setDistanceHint(Math.max(1, Math.round(snapResult.distance)));
        } else {
          setDistanceHint(null);
        }

        const currentRect = object.getBoundingRect(true, true);
        const currentCenterX = currentRect.left + currentRect.width / 2;
        const currentCenterY = currentRect.top + currentRect.height / 2;
        const centerX = clipX + clipW / 2;
        const centerY = clipY + clipH / 2;
        const nearCenterX = Math.abs(currentCenterX - centerX) <= 48;
        const nearCenterY = Math.abs(currentCenterY - centerY) <= 48;

        if (!snapResult.snapX && nearCenterX) {
          setAutoAlignHint('💡 Căn giữa: đối tượng đang gần tâm ngang.');
        } else if (!snapResult.snapY && nearCenterY) {
          setAutoAlignHint('💡 Căn giữa: đối tượng đang gần tâm dọc.');
        } else if (snapResult.snapX?.target?.kind === 'center' || snapResult.snapY?.target?.kind === 'center') {
          setAutoAlignHint('💡 Căn giữa');
        } else if (snapResult.snapX || snapResult.snapY) {
          setAutoAlignHint('💡 Căn theo cạnh');
        } else {
          setAutoAlignHint('');
        }

        renderGuides(snapResult.guides);
      };

      canvas.setBackgroundImage(img, () => {
        if (disposed) return;

        const createGuide = () => {
          const bgRect = new fabric.Rect({
            left: clipX,
            top: clipY,
            width: clipW,
            height: clipH,
            fill: bgRectRef.current?.fill || 'rgba(0,0,0,0)',
            selectable: false,
            evented: false,
            excludeFromExport: false,
            name: '__bgRect__',
            dataRole: 'system',
          });
          canvas.add(bgRect);
          bgRectRef.current = bgRect;
          bgRect.sendToBack();

          guideRect = new fabric.Rect({
            left: clipX,
            top: clipY,
            width: clipW,
            height: clipH,
            stroke: '#52c41a',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            fill: 'transparent',
            selectable: false,
            evented: false,
            excludeFromExport: true,
            dataRole: 'system',
          });
          canvas.add(guideRect);
          guideRect.bringToFront();
        };

        const getSnapshotSafe = () => {
          try {
            if (snapshotState) {
              const parsed = JSON.parse(snapshotState);
              if (parsed.templateId === Number(templateId)) return parsed;
            }
            const key = `designSnapshot_${templateId}`;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed.templateId === Number(templateId)) return parsed;
            return null;
          } catch {
            return null;
          }
        };

        const snapshotSafe = getSnapshotSafe();
        const saved = designStore[currentSide] || snapshotSafe?.[currentSide] || null;

        if (saved && Object.keys(saved).length > 0) {
          canvas.loadFromJSON(saved, () => {
            if (disposed) return;
            canvas.getObjects().forEach((object) => {
              const isLegacyBgRect =
                object?.type === 'rect'
                && Math.abs((object.left || 0) - clipX) < 0.5
                && Math.abs((object.top || 0) - clipY) < 0.5
                && Math.abs((object.width || 0) - clipW) < 0.5
                && Math.abs((object.height || 0) - clipH) < 0.5
                && object?.selectable === false
                && object?.evented === false;
              if (object.dataRole === 'system' || object.name === '__bgRect__' || object.excludeFromExport || isLegacyBgRect) {
                canvas.remove(object);
              }
            });
            createGuide();
            canvas.forEachObject((object) => {
              object.set({ cornerSize: 8, padding: 0 });
              ensureObjectId(object);
              applyObjectClipPath(object);
              applyObjectLockState(object, Boolean(object.locked));
              clampToClip(object);
            });
            canvas.renderAll();
            initHistoryForCurrentSide(canvas);
            syncLayers(canvas);
            historyReady = true;
          });
        } else {
          createGuide();
          canvas.renderAll();
          initHistoryForCurrentSide(canvas);
          syncLayers(canvas);
          historyReady = true;
        }
      });

      const onAdded = (e) => {
        if (disposed) return;
        const object = e.target;
        if (!object) return;
        ensureObjectId(object);
        applyObjectClipPath(object);
        object.set({ cornerSize: 8, padding: 0 });
        applyObjectLockState(object, Boolean(object.locked));
        clampToClip(object);
        syncLayers(canvas);
        if (historyReady) pushHistory(canvas);
      };

      const onModified = (e) => {
        if (disposed) return;
        const finalSnap = lastSnapResultRef.current;
        if (e?.target && finalSnap && (finalSnap.snapX || finalSnap.snapY)) {
          applySnap({ object: e.target, snapResult: finalSnap, magneticStrength: 1 });
        }
        lastSnapResultRef.current = null;
        clearGuides();
        setDistanceHint(null);
        setAutoAlignHint('');
        clearDraggingVisual(e.target);
        clampToClip(e.target);
        syncLayers(canvas);
        if (historyReady) pushHistory(canvas);
      };

      const onMoving = (e) => {
        if (disposed) return;
        const object = e.target;
        if (!object) return;
        pendingMoveTargetRef.current = object;
        if (moveRafRef.current) return;
        moveRafRef.current = requestAnimationFrame(() => {
          moveRafRef.current = null;
          const activeTarget = pendingMoveTargetRef.current;
          pendingMoveTargetRef.current = null;
          if (!activeTarget || disposed) return;
          applyDraggingVisual(activeTarget);
          runSnap(activeTarget);
          clampToClip(activeTarget);
          canvas.requestRenderAll();
        });
      };

      const onScaling = (e) => {
        if (disposed) return;
        lastSnapResultRef.current = null;
        clearGuides();
        setDistanceHint(null);
        setAutoAlignHint('');
        clearDraggingVisual(e.target);
        clampToClip(e.target);
      };

      const onRemoved = () => {
        if (disposed) return;
        lastSnapResultRef.current = null;
        clearGuides();
        setDistanceHint(null);
        setAutoAlignHint('');
        syncLayers(canvas);
        if (historyReady) pushHistory(canvas);
      };

      const onTextChanged = () => {
        if (disposed) return;
        if (historyReady) pushHistory(canvas);
      };

      canvas.on('object:added', onAdded);
      canvas.on('object:modified', onModified);
      canvas.on('object:moving', onMoving);
      canvas.on('object:scaling', onScaling);
      canvas.on('object:removed', onRemoved);
      canvas.on('text:changed', onTextChanged);

      const onMouseDown = (opt) => {
        if (disposed) return;
        if (opt.e?.button === 2) {
          const target = opt.target;
          if (isEditableObject(target)) {
            ensureObjectId(target);
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            syncSelectionState(target);
            syncLayers(canvas);
            const menuWidth = 210;
            const menuHeight = 220;
            setContextMenu({
              x: Math.max(8, Math.min(opt.e.clientX, window.innerWidth - menuWidth)),
              y: Math.max(8, Math.min(opt.e.clientY, window.innerHeight - menuHeight)),
              objectId: target.dataId,
            });
          } else {
            setContextMenu(null);
          }
          return;
        }

        setContextMenu(null);
        if (opt.target && !isSpacePressedRef.current) return;
        isPanning = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        canvas.setCursor('grab');
      };

      const onMouseMove = (opt) => {
        if (!isPanning || disposed) return;
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        lastPosX = e.clientX;
        lastPosY = e.clientY;
        canvas.requestRenderAll();
      };

      const onMouseUp = () => {
        if (disposed) return;
        isPanning = false;
        canvas.setCursor('default');
      };

      const onMouseWheel = (opt) => {
        if (disposed) return;
        const delta = opt.e.deltaY;
        smoothZoomTo(zoomValueRef.current - delta * 0.05);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      };

      canvas.on('mouse:down', onMouseDown);
      canvas.on('mouse:move', onMouseMove);
      canvas.on('mouse:up', onMouseUp);
      canvas.on('mouse:wheel', onMouseWheel);

      blockNativeContextMenu = (event) => event.preventDefault();
      canvas.upperCanvasEl?.addEventListener('contextmenu', blockNativeContextMenu);
      document.addEventListener('click', closeContextMenu);

      const onSelectionCreated = (e) => {
        syncSelectionState(e.selected?.[0]);
        syncLayers(canvas);
      };
      const onSelectionUpdated = (e) => {
        syncSelectionState(e.selected?.[0]);
        syncLayers(canvas);
      };
      const onSelectionCleared = () => {
        if (disposed) return;
        setDistanceHint(null);
        setAutoAlignHint('');
        syncSelectionState(null);
        syncLayers(canvas);
      };
      canvas.on('selection:created', onSelectionCreated);
      canvas.on('selection:updated', onSelectionUpdated);
      canvas.on('selection:cleared', onSelectionCleared);

      return () => {
        if (moveRafRef.current) {
          cancelAnimationFrame(moveRafRef.current);
          moveRafRef.current = null;
        }
      };
    }, { crossOrigin: 'anonymous' });

    return () => {
      disposed = true;
      if (moveRafRef.current) {
        cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = null;
      }
      pendingMoveTargetRef.current = null;
      setGuides([]);
      selectedTextRef.current = null;
      setTextProps(null);
      setActiveObjectInfo(null);
      if (canvas.getObjects().length > 0) {
        designStore[currentSide] = exportCanvasJson(canvas);
      }
      canvas.off();
      if (blockNativeContextMenu) {
        canvas.upperCanvasEl?.removeEventListener('contextmenu', blockNativeContextMenu);
      }
      document.removeEventListener('click', closeContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      fabric.Object.prototype.cornerSize = originalCornerSize;
      fabric.Object.prototype.padding = originalPadding;
    };
  }, [
    template,
    loading,
    side,
    templateId,
    snapshotState,
    fabricRef,
    designRef,
    clipBoundsRef,
    clipSideRef,
    bgRectRef,
    selectedTextRef,
    isSpacePressedRef,
    canvasInitializedRef,
    initializedSideRef,
    lastCanvasLoadKeyRef,
    moveRafRef,
    pendingMoveTargetRef,
    lastSnapResultRef,
    zoomValueRef,
    setCanvasSideReady,
    setGuides,
    setDistanceHint,
    setAutoAlignHint,
    setTextProps,
    setActiveObjectInfo,
    setContextMenu,
    applyObjectLockState,
    closeContextMenu,
    ensureObjectId,
    exportCanvasJson,
    getSnapPoints,
    detectSnap,
    applySnap,
    handleRedo,
    handleUndo,
    initHistoryForCurrentSide,
    isEditableObject,
    pushHistory,
    smoothZoomTo,
    syncLayers,
    syncSelectionState,
  ]);

  useEffect(() => () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.dispose();
    fabricRef.current = null;
  }, [fabricRef]);
}
