import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { message, ConfigProvider, theme } from 'antd';
import QRCode from 'qrcode';
import { fabric } from 'fabric';
import { getBagTemplate } from '../../services/bagTemplate';
import { getTextures } from '../../services/texture';
import useGreenAi from '../../hooks/useGreenAi';
import useGreenQr from '../../hooks/useGreenQr';
import useEditorState from '../../hooks/useEditorState';
import useFabricCanvas from '../../hooks/useFabricCanvas';
import CanvasManager from './components/CanvasManager';
import LayerManager from './components/LayerManager';
import ContextMenu from './components/ContextMenu';
import useDesignTheme from './hooks/useDesignTheme';
import usePanelResize from './hooks/usePanelResize';
import useSmoothZoom from './hooks/useSmoothZoom';
import useSnapGuides from './hooks/useSnapGuides';
import useHistoryManager from './hooks/useHistoryManager';
import useToolbarLogic from './hooks/useToolbarLogic';
import useCanvasEffects from './hooks/useCanvasEffects';
import {
  CANVAS_SIZE,
  FABRIC_JSON_PROPS,
  FONT_OPTIONS,
  FONT_SIZE_PRESETS,
  ICON_LIST,
  TEXT_PRESETS,
  iconToSvgString,
  isEditableCanvasObject,
} from './utils/designConstants';
import './styles.css';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const LEFT_MIN_WIDTH = 280;
const LEFT_MAX_WIDTH = 420;
const MIN_CENTER_WIDTH = 560;

export default function DesignPage() {
  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { themeMode, toggleThemeMode } = useDesignTheme();
  const fabricRef = useRef(null);
  const clipBoundsRef = useRef(null); // { clipX, clipY, clipW, clipH }
  const clipSideRef = useRef('front'); // Mặt đang dùng cùng clipBoundsRef
  const bgRectRef = useRef(null); // fabric.Rect làm nền vùng thiết kế
  const [template, setTemplate] = useState(null);
  const [textures, setTextures] = useState([]);
  const [side, setSide] = useState("front");
  const designRef = useRef({ front: null, back: null });
  const [loading, setLoading] = useState(true);
  const {
    zoom,
    setZoom,
    leftSidebarWidth,
    setLeftSidebarWidth,
    activeTab,
    setActiveTab,
    contextMenu,
    setContextMenu,
    floatingObjectMenuPos,
    setFloatingObjectMenuPos,
    showLayerOverlay,
    setShowLayerOverlay,
    dragLayerId,
    setDragLayerId,
    dragOverLayerId,
    setDragOverLayerId,
  } = useEditorState();
  const [textProps, setTextProps] = useState(null); // { fontFamily, fontSize, fill, fontWeight, fontStyle, charSpacing } khi chọn chữ
  const selectedTextRef = useRef(null);
  const [activeObjectInfo, setActiveObjectInfo] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [desktopQrUrl, setDesktopQrUrl] = useState('');
  const [distanceHint, setDistanceHint] = useState(null);
  const [autoAlignHint, setAutoAlignHint] = useState('');
  const [guides, setGuides] = useState([]);
  const [layers, setLayers] = useState([]);
  const [canvasSideReady, setCanvasSideReady] = useState(null);
  const isSpacePressedRef = useRef(false);
  const objectIdCounterRef = useRef(1);
  const canvasInitializedRef = useRef(false);
  const initializedSideRef = useRef(null);
  const lastCanvasLoadKeyRef = useRef('');
  const moveRafRef = useRef(null);
  const pendingMoveTargetRef = useRef(null);
  const lastSnapResultRef = useRef(null);

  const { getSnapPoints, detectSnap, applySnap } = useSnapGuides();
  const { zoomValueRef, smoothZoomTo } = useSmoothZoom({ zoom, setZoom });
  const { startResizePanel } = usePanelResize({
    leftSidebarWidth,
    setLeftSidebarWidth,
    leftMinWidth: LEFT_MIN_WIDTH,
    leftMaxWidth: LEFT_MAX_WIDTH,
    minCenterWidth: MIN_CENTER_WIDTH,
  });

  useEffect(() => () => {
    if (moveRafRef.current) {
      cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setIsMobileViewport(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || typeof window === 'undefined') {
      setDesktopQrUrl('');
      return;
    }

    QRCode.toDataURL(window.location.href, {
      width: 176,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(setDesktopQrUrl)
      .catch(() => setDesktopQrUrl(''));
  }, [isMobileViewport]);

  const closeContextMenu = useCallback(() => setContextMenu(null), [setContextMenu]);

  useEffect(() => {
    let snapshot = state?.designSnapshot;

    const key = `designSnapshot_${templateId}`;

    if (!snapshot) {
      snapshot = localStorage.getItem(key); // 🔥 FIX
    }

    if (snapshot) {
      try {
        const parsed =
          typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;

        designRef.current.front = parsed.front ?? null;
        designRef.current.back = parsed.back ?? null;
        if (parsed.templateId !== Number(templateId)) {
          console.warn("⚠️ snapshot sai template → bỏ qua");
          return;
        }
      } catch (e) {
        console.error("❌ parse snapshot lỗi", e);
      }
    }
  }, [state?.designSnapshot, templateId]);

  useEffect(() => {
    setLoading(true);

    Promise.all([getBagTemplate(templateId), getTextures()])
      .then(([t, tex]) => {
        setTemplate(t);
        setTextures(tex);
      })
      .catch(() => message.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [templateId]);

  useEffect(() => {
    if (!template) return;
    const frontPreload = new window.Image();
    const backPreload = new window.Image();
    if (template.frontImageUrl) frontPreload.src = template.frontImageUrl;
    if (template.backImageUrl) backPreload.src = template.backImageUrl;
  }, [template]);

  const isEditableObject = useCallback((obj) => {
    return isEditableCanvasObject(obj);
  }, []);

  const applyObjectLockState = useCallback((obj, locked) => {
    if (!obj) return;
    obj.locked = Boolean(locked);
    obj.set({
      lockMovementX: Boolean(locked),
      lockMovementY: Boolean(locked),
      lockScalingX: Boolean(locked),
      lockScalingY: Boolean(locked),
      lockRotation: Boolean(locked),
      hasControls: !locked,
    });
  }, []);

  const syncSelectionState = useCallback((obj) => {
    const clearSelectionGlow = () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.getObjects().forEach((item) => {
        if (!item?.__hasSelectionGlow) return;
        item.set({ shadow: item.__baseSelectionShadow || null });
        item.__baseSelectionShadow = null;
        item.__hasSelectionGlow = false;
      });
      canvas.requestRenderAll();
    };

    if (!isEditableObject(obj)) {
      clearSelectionGlow();
      selectedTextRef.current = null;
      setTextProps(null);
      setActiveObjectInfo(null);
      setFloatingObjectMenuPos(null);
      return;
    }

    const canvas = fabricRef.current;
    if (canvas?.upperCanvasEl && typeof obj.getBoundingRect === 'function') {
      const r = obj.getBoundingRect(true, true);
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const p = fabric.util.transformPoint(new fabric.Point(r.left + r.width, r.top), vpt);
      const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
      setFloatingObjectMenuPos({
        x: Math.max(10, Math.min(window.innerWidth - 240, canvasRect.left + p.x + 10)),
        y: Math.max(84, Math.min(window.innerHeight - 56, canvasRect.top + p.y - 34)),
      });
    }

    clearSelectionGlow();
    if (!obj.__hasSelectionGlow) {
      obj.__baseSelectionShadow = obj.shadow || null;
    }
    obj.__hasSelectionGlow = true;
    obj.set({
      borderColor: '#22c55e',
      cornerColor: '#22c55e',
      cornerStrokeColor: '#16a34a',
      cornerSize: 10,
      shadow: {
        color: 'rgba(34, 197, 94, 0.2)',
        blur: 18,
        offsetX: 0,
        offsetY: 0,
      },
    });

    const type = obj.type || 'object';
    setActiveObjectInfo({
      type,
      opacity: typeof obj.opacity === 'number' ? obj.opacity : 1,
      stroke: obj.stroke || '#111827',
      strokeWidth: Number(obj.strokeWidth || 0),
      radius: Number(obj.rx || obj.ry || 0),
      angle: Number(obj.angle || 0),
      scale: Number((((obj.scaleX || 1) + (obj.scaleY || 1)) / 2).toFixed(2)),
      visible: obj.visible !== false,
      x: Number(obj.left || 0),
      y: Number(obj.top || 0),
      locked: Boolean(obj.locked),
    });

    if (type !== 'i-text') {
      selectedTextRef.current = null;
      setTextProps(null);
      return;
    }

    selectedTextRef.current = obj;
    setTextProps({
      fontFamily: obj.fontFamily || 'Arial',
      fontSize: obj.fontSize || 24,
      fill: obj.fill || '#000000',
      fontWeight: obj.fontWeight || 'normal',
      fontStyle: obj.fontStyle || 'normal',
      underline: Boolean(obj.underline),
      linethrough: Boolean(obj.linethrough),
      textAlign: obj.textAlign || 'left',
      charSpacing: obj.charSpacing || 0,
      curveType: obj.curveType || (obj.path ? 'arcUp' : 'none'),
    });
    setActiveTab('text');
  }, [isEditableObject, setActiveTab, setFloatingObjectMenuPos]);

  const ensureObjectId = useCallback((obj) => {
    if (!obj) return null;
    if (!obj.dataId) {
      obj.dataId = `obj-${Date.now()}-${objectIdCounterRef.current++}`;
    }
    return obj.dataId;
  }, []);

  const syncLayers = useCallback((canvas = fabricRef.current) => {
    if (!canvas) {
      setLayers([]);
      return;
    }
    const active = canvas.getActiveObject();
    const editable = canvas.getObjects().filter(isEditableObject);
    const mapped = editable
      .map((obj, index) => {
        const id = ensureObjectId(obj);
        return {
          id,
          type: obj.type || 'object',
          visible: obj.visible !== false,
          locked: Boolean(obj.locked),
          zIndex: index,
          isActive: active?.dataId === id,
        };
      })
      .reverse();
    setLayers(mapped);
  }, [ensureObjectId, isEditableObject]);

  const exportCanvasJson = useCallback((canvas) => canvas.toJSON(FABRIC_JSON_PROPS), []);

  const serializeCanvas = useCallback((canvas) => (
    JSON.stringify(exportCanvasJson(canvas))
  ), [exportCanvasJson]);

  const {
    canUndo,
    canRedo,
    initHistoryForCurrentSide,
    pushHistory,
    handleUndo,
    handleRedo,
  } = useHistoryManager({
    side,
    fabricRef,
    serializeCanvas,
    syncSelectionState,
    syncLayers,
  });

  useCanvasEffects({
    template,
    loading,
    side,
    templateId,
    snapshotState: state?.designSnapshot,
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
  });

  useEffect(() => {
    if (fabricRef.current) {
      const c = fabricRef.current;
      c.zoomToPoint(new fabric.Point(CANVAS_SIZE / 2, CANVAS_SIZE / 2), zoom / 100);
      c.requestRenderAll();
    }
  }, [zoom]);

  const { switchSide, saveCurrentSide } = useFabricCanvas({
    fabricRef,
    designRef,
    side,
    setSide,
    exportCanvasJson,
  });

  const addTexture = (tex) => {
    if (!fabricRef.current) return;
    fabric.Image.fromURL(tex.imageUrl, (img) => {
      img.scaleToWidth(100);
      img.set({ left: 150, top: 150 });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
    });
  };

  const addIconToCanvas = useCallback((IconComponent) => {
    if (!fabricRef.current || !IconComponent) return;
    const svg = iconToSvgString(IconComponent);
    fabric.loadSVGFromString(svg, (objects, options) => {
      const group = fabric.util.groupSVGElements(objects, options);
      const scale = 80 / Math.max(group.width, group.height, 1);
      group.scale(scale);
      group.set({ left: 150, top: 150 });
      fabricRef.current.add(group);
      fabricRef.current.setActiveObject(group);
      fabricRef.current.requestRenderAll();
    });
  }, []);

  const addText = () => {
    if (!fabricRef.current) return;
    const text = new fabric.IText('Nhập văn bản', { left: 150, top: 150, fontFamily: 'Arial' });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const addTextPreset = useCallback((preset) => {
    if (!fabricRef.current || !preset) return;
    const text = new fabric.IText(preset.text || preset.title || 'Nhập văn bản', {
      left: 150,
      top: 150,
      originX: 'left',
      originY: 'top',
      ...preset.style,
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.requestRenderAll();
  }, []);

  const {
    updateTextProp,
    cycleTextCase,
    cycleTextAlign,
    updateActiveObjectStyle,
    updateActiveObjectProp,
    getActiveEditableObject,
    deleteActiveObject,
    duplicateActiveObject,
    fitImageToClip,
    isTextObject,
    isImageObject,
    isShapeObject,
    activeFillColor,
    activeBorderColor,
  } = useToolbarLogic({
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
  });

  const selectLayer = useCallback((id) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.dataId === id);
    if (!isEditableObject(obj)) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    syncSelectionState(obj);
    syncLayers(canvas);
  }, [isEditableObject, syncLayers, syncSelectionState]);

  const toggleLayerVisibility = useCallback((id) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.dataId === id);
    if (!isEditableObject(obj)) return;
    obj.set({ visible: obj.visible === false });
    canvas.requestRenderAll();
    if (canvas.getActiveObject() === obj && obj.visible === false) {
      canvas.discardActiveObject();
      syncSelectionState(null);
    } else if (canvas.getActiveObject() === obj) {
      syncSelectionState(obj);
    }
    pushHistory(canvas);
    syncLayers(canvas);
  }, [isEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const moveLayer = useCallback((id, direction) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.dataId === id);
    if (!isEditableObject(obj)) return;

    const editableObjects = canvas.getObjects().filter(isEditableObject);
    const editableIndexes = editableObjects.map((o) => canvas.getObjects().indexOf(o)).filter((n) => n >= 0);
    const minEditableIndex = Math.min(...editableIndexes);
    const maxEditableIndex = Math.max(...editableIndexes);

    if (direction === 'up') canvas.bringForward(obj);
    if (direction === 'down') canvas.sendBackwards(obj);
    if (direction === 'top') obj.moveTo(maxEditableIndex);
    if (direction === 'bottom') obj.moveTo(minEditableIndex);

    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
    syncLayers(canvas);
  }, [isEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const reorderLayerByDrag = useCallback((dragId, overId) => {
    const canvas = fabricRef.current;
    if (!canvas || !dragId || !overId || dragId === overId) return;

    const editable = canvas.getObjects().filter(isEditableObject);
    const from = editable.findIndex((o) => o.dataId === dragId);
    const to = editable.findIndex((o) => o.dataId === overId);
    if (from < 0 || to < 0 || from === to) return;

    const reordered = [...editable];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const editableIndexes = editable
      .map((o) => canvas.getObjects().indexOf(o))
      .filter((idx) => idx >= 0)
      .sort((a, b) => a - b);
    const baseIndex = editableIndexes[0] ?? 0;

    reordered.forEach((obj, idx) => {
      obj.moveTo(baseIndex + idx);
    });

    canvas.setActiveObject(moved);
    canvas.requestRenderAll();
    syncSelectionState(moved);
    pushHistory(canvas);
    syncLayers(canvas);
  }, [isEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const getLayerLabel = useCallback((layer) => {
    const t = String(layer?.type || '').toLowerCase();
    if (t === 'i-text' || t === 'text') return 'Văn bản';
    if (t === 'image') return 'Hình ảnh';
    if (t === 'group') return 'Biểu tượng';
    if (t === 'path') return 'Hình dạng';
    return 'Đối tượng';
  }, []);

  const toggleLayerLock = useCallback((id) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => o.dataId === id);
    if (!isEditableObject(obj)) return;
    const nextLocked = !obj.locked;
    applyObjectLockState(obj, nextLocked);
    if (canvas.getActiveObject() === obj && nextLocked) {
      canvas.discardActiveObject();
      syncSelectionState(null);
    } else if (canvas.getActiveObject() === obj) {
      syncSelectionState(obj);
    }
    canvas.requestRenderAll();
    pushHistory(canvas);
    syncLayers(canvas);
  }, [applyObjectLockState, isEditableObject, pushHistory, syncLayers, syncSelectionState]);


  const alignActiveObject = useCallback((mode) => {
    const canvas = fabricRef.current;
    const obj = getActiveEditableObject();
    const clip = clipBoundsRef.current;
    if (!canvas || !obj || !clip) return;
    const { clipX, clipY, clipW, clipH } = clip;
    const rect = obj.getBoundingRect(true, true);
    const centerX = clipX + clipW / 2;
    const centerY = clipY + clipH / 2;
    const objCx = rect.left + rect.width / 2;
    const objCy = rect.top + rect.height / 2;

    if (mode === 'left') obj.set('left', (obj.left || 0) + (clipX - rect.left));
    if (mode === 'center') obj.set('left', (obj.left || 0) + (centerX - objCx));
    if (mode === 'right') obj.set('left', (obj.left || 0) + ((clipX + clipW) - (rect.left + rect.width)));
    if (mode === 'top') obj.set('top', (obj.top || 0) + (clipY - rect.top));
    if (mode === 'middle') obj.set('top', (obj.top || 0) + (centerY - objCy));
    if (mode === 'bottom') obj.set('top', (obj.top || 0) + ((clipY + clipH) - (rect.top + rect.height)));

    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
    syncLayers(canvas);
  }, [getActiveEditableObject, pushHistory, syncLayers, syncSelectionState]);

  const getSelectedEditableObjects = useCallback(() => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return [];
    if (active.type === 'activeSelection' && typeof active.getObjects === 'function') {
      return active.getObjects().filter(isEditableObject);
    }
    return isEditableObject(active) ? [active] : [];
  }, [isEditableObject]);

  const alignSelectedObjects = useCallback((mode) => {
    const canvas = fabricRef.current;
    const objects = getSelectedEditableObjects();
    if (!canvas || objects.length < 2) return;
    const bounds = objects.map((obj) => ({ obj, rect: obj.getBoundingRect(true, true) }));
    const left = Math.min(...bounds.map((item) => item.rect.left));
    const right = Math.max(...bounds.map((item) => item.rect.left + item.rect.width));
    const top = Math.min(...bounds.map((item) => item.rect.top));
    const bottom = Math.max(...bounds.map((item) => item.rect.top + item.rect.height));
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    bounds.forEach(({ obj, rect }) => {
      if (mode === 'left') obj.set('left', (obj.left || 0) + (left - rect.left));
      if (mode === 'center') obj.set('left', (obj.left || 0) + (centerX - (rect.left + rect.width / 2)));
      if (mode === 'right') obj.set('left', (obj.left || 0) + (right - (rect.left + rect.width)));
      if (mode === 'top') obj.set('top', (obj.top || 0) + (top - rect.top));
      if (mode === 'middle') obj.set('top', (obj.top || 0) + (centerY - (rect.top + rect.height / 2)));
      if (mode === 'bottom') obj.set('top', (obj.top || 0) + (bottom - (rect.top + rect.height)));
      obj.setCoords();
    });

    canvas.requestRenderAll();
    pushHistory(canvas);
    syncLayers(canvas);
  }, [getSelectedEditableObjects, pushHistory, syncLayers]);

  const distributeSelectedObjects = useCallback((axis) => {
    const canvas = fabricRef.current;
    const objects = getSelectedEditableObjects();
    if (!canvas || objects.length < 3) return;

    const mapped = objects.map((obj) => {
      const rect = obj.getBoundingRect(true, true);
      return { obj, rect };
    }).sort((a, b) => (
      axis === 'x'
        ? (a.rect.left + a.rect.width / 2) - (b.rect.left + b.rect.width / 2)
        : (a.rect.top + a.rect.height / 2) - (b.rect.top + b.rect.height / 2)
    ));

    const first = mapped[0];
    const last = mapped[mapped.length - 1];
    const firstCenter = axis === 'x' ? first.rect.left + first.rect.width / 2 : first.rect.top + first.rect.height / 2;
    const lastCenter = axis === 'x' ? last.rect.left + last.rect.width / 2 : last.rect.top + last.rect.height / 2;
    const step = (lastCenter - firstCenter) / (mapped.length - 1);

    mapped.forEach((item, index) => {
      if (index === 0 || index === mapped.length - 1) return;
      const targetCenter = firstCenter + (step * index);
      const currentCenter = axis === 'x'
        ? item.rect.left + item.rect.width / 2
        : item.rect.top + item.rect.height / 2;
      const diff = targetCenter - currentCenter;
      if (axis === 'x') item.obj.set('left', (item.obj.left || 0) + diff);
      else item.obj.set('top', (item.obj.top || 0) + diff);
      item.obj.setCoords();
    });

    canvas.requestRenderAll();
    pushHistory(canvas);
    syncLayers(canvas);
  }, [getSelectedEditableObjects, pushHistory, syncLayers]);


  const handleContextAction = useCallback((action) => {
    const targetId = contextMenu?.objectId;
    if (!targetId) return;
    selectLayer(targetId);
    if (action === 'select') {
      setActiveTab(null);
      closeContextMenu();
      return;
    }
    if (action === 'duplicate') duplicateActiveObject();
    if (action === 'align-center') alignActiveObject('center');
    if (action === 'align-middle') alignActiveObject('middle');
    if (action === 'align-selection-left') alignSelectedObjects('left');
    if (action === 'align-selection-center') alignSelectedObjects('center');
    if (action === 'distribute-x') distributeSelectedObjects('x');
    if (action === 'delete') deleteActiveObject();
    closeContextMenu();
  }, [
    alignActiveObject,
    alignSelectedObjects,
    closeContextMenu,
    contextMenu?.objectId,
    deleteActiveObject,
    distributeSelectedObjects,
    duplicateActiveObject,
    setActiveTab,
    selectLayer,
  ]);

  const addImage = (file) => {
    if (!fabricRef.current || !file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return;
      fabric.Image.fromURL(dataUrl, (img) => {
        img.scaleToWidth(150);
        img.set({ left: 150, top: 150 });
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const addImageFromDataUrl = useCallback((dataUrl) => {
    if (!fabricRef.current || !dataUrl) return;
    fabric.Image.fromURL(dataUrl, (img) => {
      img.scaleToWidth(150);
      img.set({ left: 150, top: 150 });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.requestRenderAll();
    });
  }, []);

  const addImageToClipAreaFromDataUrl = useCallback((dataUrl) => {
    if (!fabricRef.current || !dataUrl || !clipBoundsRef.current) return;
    const { clipX, clipY, clipW, clipH } = clipBoundsRef.current;
    fabric.Image.fromURL(dataUrl, (img) => {
      const imgW = img?.width || 1;
      const imgH = img?.height || 1;
      const scale = Math.max(clipW / imgW, clipH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      img.set({
        left: clipX + (clipW - drawW) / 2,
        top: clipY + (clipH - drawH) / 2,
        scaleX: scale,
        scaleY: scale,
      });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.requestRenderAll();
    });
  }, []);

  const canApplyToCurrentSide = useCallback(() => {
    if (!fabricRef.current || !clipBoundsRef.current) return false;
    if (clipSideRef.current !== side) return false;
    return true;
  }, [side]);

  const {
    greenAiPrompt,
    setGreenAiPrompt,
    greenAiGenerating,
    greenAiImageDataUrl,
    greenAiError,
    savedAiItems,
    handleGreenAiGenerate,
    applySavedAiItem,
    removeSavedAiItem,
  } = useGreenAi({
    templateId,
    side,
    canvasSideReady,
    canApplyToCurrentSide,
    addImageToClipAreaFromDataUrl,
  });

  const {
    greenQrMode,
    setGreenQrMode,
    greenQrText,
    setGreenQrText,
    greenQrAudioFile,
    setGreenQrAudioFile,
    greenQrColor,
    setGreenQrColor,
    greenQrGenerating,
    greenQrRecordedFile,
    greenQrRecordedUrl,
    greenQrRecording,
    greenQrRecordSeconds,
    fmtMmSs,
    startGreenQrRecording,
    stopGreenQrRecording,
    clearRecordedAudio,
    generateGreenQr,
  } = useGreenQr({
    apiBase: API_BASE,
    addImageFromDataUrl,
  });

  const buildSnapshot = () => {
    saveCurrentSide();
    return JSON.stringify({
      front: designRef.current.front,
      back: designRef.current.back,
      templateId: Number(templateId),
    });
  };

  const goToPreview = () => {
    const snapshot = buildSnapshot();

    const key = `designSnapshot_${templateId}`; // 🔥 FIX

    localStorage.setItem(key, snapshot);

    navigate(`/custom-bag/${templateId}/preview`, {
      state: { designSnapshot: snapshot, zoom }
    });
  };

  const goToOrder = () => {
    navigate(`/custom-bag/${templateId}/checkout`, { state: { designSnapshot: buildSnapshot() } });
  };

  const handleContinueOnDesktop = useCallback(async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (!currentUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GreenShield Design Lab',
          text: 'Mở liên kết này trên máy tính để tiếp tục thiết kế.',
          url: currentUrl,
        });
        return;
      } catch {
        // Fall back to clipboard when share is dismissed or unsupported.
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        message.success('Đã sao chép liên kết, hãy mở trên desktop để tiếp tục.');
        return;
      } catch {
        // Fall through to info message below.
      }
    }

    message.info('Hãy mở liên kết hiện tại trên desktop để tiếp tục thiết kế.');
  }, []);

  const aiHint = autoAlignHint || '';
  const floatingToolbarPos = floatingObjectMenuPos
    ? {
      x: Math.max(96, Math.min(window.innerWidth - 360, floatingObjectMenuPos.x - 230)),
      y: Math.max(72, floatingObjectMenuPos.y - 54),
    }
    : null;

  if (loading || !template) {
    return <div className="design-loading">Đang tải studio...</div>;
  }

  if (isMobileViewport) {
    return (
      <div className="design-mobile-gate" role="region" aria-label="Desktop required">
        <div className="design-mobile-gate__card">
          <span className="material-symbols-rounded design-mobile-gate__icon" aria-hidden>
            laptop_mac
          </span>
          <h1>Trình thiết kế hiện chỉ hỗ trợ trên màn hình lớn</h1>
          <p>Vui lòng sử dụng màn hình lớn để có trải nghiệm tốt nhất.</p>

          <button type="button" className="design-mobile-gate__cta" onClick={handleContinueOnDesktop}>
            Tiếp tục trên desktop
          </button>

          <div className="design-mobile-gate__qr-block">
            <strong>Quét mã để mở nhanh liên kết trên thiết bị khác</strong>
            {desktopQrUrl ? (
              <img src={desktopQrUrl} alt="Mã QR mở Design Lab" className="design-mobile-gate__qr" />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#22c55e',
          colorBgContainer: themeMode === 'dark' ? '#0f1720' : '#ffffff',
          colorBorder: themeMode === 'dark' ? '#2f3f52' : '#e5e7eb',
          colorText: themeMode === 'dark' ? '#e5eef7' : '#111827',
          borderRadius: 8,
          controlHeight: 36,
        },
      }}
    >
      <div className="design-page">
        <CanvasManager
          themeMode={themeMode}
          template={template}
          canUndo={canUndo}
          canRedo={canRedo}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          goToPreview={goToPreview}
          goToOrder={goToOrder}
          navigate={navigate}
          toggleThemeMode={toggleThemeMode}
          activeObjectInfo={activeObjectInfo}
          isTextObject={isTextObject}
          isImageObject={isImageObject}
          isShapeObject={isShapeObject}
          textProps={textProps}
          setShowLayerOverlay={setShowLayerOverlay}
          updateTextProp={updateTextProp}
          cycleTextCase={cycleTextCase}
          cycleTextAlign={cycleTextAlign}
          updateActiveObjectStyle={updateActiveObjectStyle}
          updateActiveObjectProp={updateActiveObjectProp}
          fitImageToClip={fitImageToClip}
          duplicateActiveObject={duplicateActiveObject}
          deleteActiveObject={deleteActiveObject}
          fontOptions={FONT_OPTIONS}
          fontSizePresets={FONT_SIZE_PRESETS}
          activeFillColor={activeFillColor}
          floatingToolbarPos={floatingToolbarPos}
          setActiveTab={setActiveTab}
          guides={guides}
          distanceHint={distanceHint}
          aiHint={aiHint}
          activeTab={activeTab}
          leftSidebarWidth={leftSidebarWidth}
          addText={addText}
          addTextPreset={addTextPreset}
          textPresets={TEXT_PRESETS}
          addImage={addImage}
          greenAi={{
            greenAiPrompt,
            setGreenAiPrompt,
            greenAiGenerating,
            greenAiImageDataUrl,
            greenAiError,
            savedAiItems,
            handleGreenAiGenerate,
            applySavedAiItem,
            removeSavedAiItem,
          }}
          greenQr={{
            greenQrMode,
            setGreenQrMode,
            greenQrText,
            setGreenQrText,
            greenQrAudioFile,
            setGreenQrAudioFile,
            greenQrColor,
            setGreenQrColor,
            greenQrGenerating,
            greenQrRecordedFile,
            greenQrRecordedUrl,
            greenQrRecording,
            greenQrRecordSeconds,
            fmtMmSs,
            startGreenQrRecording,
            stopGreenQrRecording,
            clearRecordedAudio,
            generateGreenQr,
          }}
          textures={textures}
          addTexture={addTexture}
          iconList={ICON_LIST}
          addIconToCanvas={addIconToCanvas}
          startResizePanel={startResizePanel}
          activeBorderColor={activeBorderColor}
          side={side}
          switchSide={switchSide}
          zoomValueRef={zoomValueRef}
          smoothZoomTo={smoothZoomTo}
          zoom={zoom}
          floatingObjectMenuPos={floatingObjectMenuPos}
          fabricRef={fabricRef}
          toggleLayerLock={toggleLayerLock}
        />

        <LayerManager
          isOpen={showLayerOverlay}
          layers={layers}
          dragLayerId={dragLayerId}
          dragOverLayerId={dragOverLayerId}
          setShowLayerOverlay={setShowLayerOverlay}
          selectLayer={selectLayer}
          setDragLayerId={setDragLayerId}
          setDragOverLayerId={setDragOverLayerId}
          reorderLayerByDrag={reorderLayerByDrag}
          getLayerLabel={getLayerLabel}
          moveLayer={moveLayer}
          toggleLayerVisibility={toggleLayerVisibility}
          toggleLayerLock={toggleLayerLock}
        />

        <ContextMenu contextMenu={contextMenu} onAction={handleContextAction} />
      </div>
    </ConfigProvider >
  );
}
