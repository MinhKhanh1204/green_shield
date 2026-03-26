import React, { useEffect, useRef, useState, useCallback, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { message, Slider, Tooltip, ConfigProvider, theme } from 'antd';
import {
  FontSizeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  CopyOutlined,
  AlignCenterOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons';
import {
  PiHeart, PiStar, PiFlower, PiSun, PiLeaf, PiCheck, PiPlus, PiGift,
  PiCake, PiCamera, PiCoffee, PiPizza, PiTree, PiFish, PiBird, PiCat,
  PiMusicNote, PiBookmark, PiMapPin, PiEnvelope, PiPhone, PiSparkle,
  PiMoon, PiCloud, PiCloudSun, PiCloudRain, PiSnowflake, PiRainbow, PiLightning, PiFire,
  PiHouse, PiCar, PiAirplane, PiBicycle, PiRocket, PiAnchor, PiBalloon, PiSailboat,
  PiFlag, PiTrophy, PiMedal, PiCrown, PiDiamond, PiDiamondsFour,
  PiDog, PiPawPrint, PiButterfly, PiTreePalm, PiTreeEvergreen, PiFlowerLotus, PiFlowerTulip,
  PiHamburger, PiCookie, PiIceCream, PiWine, PiBeerBottle,
  PiSmiley, PiSmileyWink, PiHeartStraight, PiStarHalf, PiThumbsUp, PiThumbsDown,
  PiCircle, PiSquare, PiHexagon, PiTriangle,
  PiUser, PiUsers, PiEnvelopeOpen, PiVideoCamera, PiWatch,
  PiSunglasses, PiUmbrella, PiMountains, PiWaves,
} from 'react-icons/pi';
import { fabric } from 'fabric';
import { getBagTemplate } from '../services/bagTemplate';
import { getTextures } from '../services/texture';
import GreenAiPanel from '../components/design/GreenAiPanel';
import GreenQrPanel from '../components/design/GreenQrPanel';
import Topbar from '../components/design/Topbar';
import LeftPanel from '../components/design/LeftPanel';
import FloatingToolbar from '../components/design/FloatingToolbar';
import useGreenAi from '../hooks/useGreenAi';
import useGreenQr from '../hooks/useGreenQr';
import useEditorState from '../hooks/useEditorState';
import useFabricCanvas from '../hooks/useFabricCanvas';
import './DesignPage.css';

const CANVAS_SIZE = 680;
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const FABRIC_JSON_PROPS = [
  'name',
  'excludeFromExport',
  'curveType',
  'dataId',
  'dataRole',
  'locked',
  'lockMovementX',
  'lockMovementY',
  'lockScalingX',
  'lockScalingY',
  'lockRotation',
  'hasControls',
];

const CURVE_PRESETS = {
  arcUp: 'M 0 80 Q 100 0 200 80',
  arcDown: 'M 0 0 Q 100 80 200 0',
  wave: 'M 0 40 Q 50 0 100 40 Q 150 80 200 40',
  arcLeft: 'M 80 0 Q 0 50 80 100',
  arcRight: 'M 0 0 Q 80 50 0 100',
};

const ICON_LIST = [
  { Icon: PiHeart, label: 'TrÃ¡i tim' },
  { Icon: PiHeartStraight, label: 'TrÃ¡i tim tháº³ng' },
  { Icon: PiStar, label: 'NgÃ´i sao' },
  { Icon: PiStarHalf, label: 'Ná»­a sao' },
  { Icon: PiSparkle, label: 'Láº¥p lÃ¡nh' },
  { Icon: PiFlower, label: 'Hoa' },
  { Icon: PiFlowerLotus, label: 'Hoa sen' },
  { Icon: PiFlowerTulip, label: 'Tulip' },
  { Icon: PiSun, label: 'Máº·t trá»i' },
  { Icon: PiMoon, label: 'Máº·t trÄƒng' },
  { Icon: PiCloud, label: 'MÃ¢y' },
  { Icon: PiCloudSun, label: 'MÃ¢y náº¯ng' },
  { Icon: PiCloudRain, label: 'MÃ¢y mÆ°a' },
  { Icon: PiSnowflake, label: 'Tuyáº¿t' },
  { Icon: PiRainbow, label: 'Cáº§u vá»“ng' },
  { Icon: PiLightning, label: 'SÃ©t' },
  { Icon: PiFire, label: 'Lá»­a' },
  { Icon: PiLeaf, label: 'LÃ¡' },
  { Icon: PiTree, label: 'CÃ¢y' },
  { Icon: PiTreePalm, label: 'CÃ¢y cá»' },
  { Icon: PiTreeEvergreen, label: 'CÃ¢y thÃ´ng' },
  { Icon: PiMountains, label: 'NÃºi' },
  { Icon: PiWaves, label: 'SÃ³ng' },
  { Icon: PiCheck, label: 'Check' },
  { Icon: PiPlus, label: 'Cá»™ng' },
  { Icon: PiGift, label: 'QuÃ ' },
  { Icon: PiCake, label: 'BÃ¡nh' },
  { Icon: PiCoffee, label: 'CÃ  phÃª' },
  { Icon: PiPizza, label: 'Pizza' },
  { Icon: PiHamburger, label: 'Hamburger' },
  { Icon: PiCookie, label: 'Cookie' },
  { Icon: PiIceCream, label: 'Kem' },
  { Icon: PiWine, label: 'RÆ°á»£u' },
  { Icon: PiBeerBottle, label: 'Bia' },
  { Icon: PiCamera, label: 'MÃ¡y áº£nh' },
  { Icon: PiFish, label: 'CÃ¡' },
  { Icon: PiBird, label: 'Chim' },
  { Icon: PiCat, label: 'MÃ¨o' },
  { Icon: PiDog, label: 'ChÃ³' },
  { Icon: PiPawPrint, label: 'Dáº¥u chÃ¢n' },
  { Icon: PiButterfly, label: 'BÆ°á»›m' },
  { Icon: PiMusicNote, label: 'Ná»‘t nháº¡c' },
  { Icon: PiBookmark, label: 'ÄÃ¡nh dáº¥u' },
  { Icon: PiMapPin, label: 'Vá»‹ trÃ­' },
  { Icon: PiEnvelope, label: 'ThÆ°' },
  { Icon: PiEnvelopeOpen, label: 'ThÆ° má»Ÿ' },
  { Icon: PiPhone, label: 'Äiá»‡n thoáº¡i' },
  { Icon: PiHouse, label: 'NhÃ ' },
  { Icon: PiCar, label: 'Xe hÆ¡i' },
  { Icon: PiAirplane, label: 'MÃ¡y bay' },
  { Icon: PiBicycle, label: 'Xe Ä‘áº¡p' },
  { Icon: PiRocket, label: 'TÃªn lá»­a' },
  { Icon: PiAnchor, label: 'Má» neo' },
  { Icon: PiBalloon, label: 'BÃ³ng bay' },
  { Icon: PiSailboat, label: 'Thuyá»n' },
  { Icon: PiFlag, label: 'Cá»' },
  { Icon: PiTrophy, label: 'CÃºp' },
  { Icon: PiMedal, label: 'Huy chÆ°Æ¡ng' },
  { Icon: PiCrown, label: 'VÆ°Æ¡ng miá»‡n' },
  { Icon: PiDiamond, label: 'Kim cÆ°Æ¡ng' },
  { Icon: PiDiamondsFour, label: 'Bá»‘n Ã´' },
  { Icon: PiSmiley, label: 'Máº·t cÆ°á»i' },
  { Icon: PiSmileyWink, label: 'Máº·t nhÃ¡y máº¯t' },
  { Icon: PiThumbsUp, label: 'Like' },
  { Icon: PiThumbsDown, label: 'Dislike' },
  { Icon: PiCircle, label: 'HÃ¬nh trÃ²n' },
  { Icon: PiSquare, label: 'HÃ¬nh vuÃ´ng' },
  { Icon: PiHexagon, label: 'Lá»¥c giÃ¡c' },
  { Icon: PiTriangle, label: 'Tam giÃ¡c' },
  { Icon: PiUser, label: 'NgÆ°á»i' },
  { Icon: PiUsers, label: 'NhÃ³m ngÆ°á»i' },
  { Icon: PiVideoCamera, label: 'Video' },
  { Icon: PiWatch, label: 'Äá»“ng há»“' },
  { Icon: PiSunglasses, label: 'KÃ­nh rÃ¢m' },
  { Icon: PiUmbrella, label: 'Ã”' },
];

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Work Sans', label: 'Work Sans' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Fira Sans', label: 'Fira Sans' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'PT Sans', label: 'PT Sans' },
  { value: 'Noto Sans', label: 'Noto Sans' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Lexend', label: 'Lexend' },
  { value: 'Figtree', label: 'Figtree' },
  { value: 'Karla', label: 'Karla' },
  { value: 'Mukta', label: 'Mukta' },
  { value: 'Cabin', label: 'Cabin' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  { value: 'Archivo', label: 'Archivo' },
  { value: 'Barlow', label: 'Barlow' },
  { value: 'Kanit', label: 'Kanit' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Roboto Slab', label: 'Roboto Slab' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'Anton', label: 'Anton' },
  { value: 'Righteous', label: 'Righteous' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Lobster', label: 'Lobster' },
  { value: 'Great Vibes', label: 'Great Vibes' },
  { value: 'Satisfy', label: 'Satisfy' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Comfortaa', label: 'Comfortaa' },
  { value: 'Kalam', label: 'Kalam' },
  { value: 'Philosopher', label: 'Philosopher' },
  { value: 'Syne', label: 'Syne' },
  { value: 'Tilt Neon', label: 'Tilt Neon' },
  { value: 'Signika', label: 'Signika' },
  { value: 'Exo 2', label: 'Exo 2' },
  { value: 'Maven Pro', label: 'Maven Pro' },
  { value: 'Inconsolata', label: 'Inconsolata' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Space Mono', label: 'Space Mono' },
];

const FONT_SIZE_PRESETS = [12, 14, 16, 20, 24, 32, 40, 48, 64, 96];

export default function DesignPage() {
  const LEFT_TAB_BAR_WIDTH = 76;
  const LEFT_MIN_WIDTH = 280;
  const LEFT_MAX_WIDTH = 420;
  const MIN_CENTER_WIDTH = 560;

  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const fabricRef = useRef(null);
  const clipBoundsRef = useRef(null); // { clipX, clipY, clipW, clipH }
  const clipSideRef = useRef('front'); // side tÆ°Æ¡ng á»©ng vá»›i clipBoundsRef
  const bgRectRef = useRef(null);     // fabric.Rect for edit-area background fill
  const [template, setTemplate] = useState(null);
  const [textures, setTextures] = useState([]);
  const [side, setSide] = useState('front');
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
    floatingTool,
    setFloatingTool,
    floatingObjectMenuPos,
    setFloatingObjectMenuPos,
    showLayerOverlay,
    setShowLayerOverlay,
    dragLayerId,
    setDragLayerId,
    dragOverLayerId,
    setDragOverLayerId,
  } = useEditorState();
  const [bgColor, setBgColorState] = useState('#ffffff');
  const [textProps, setTextProps] = useState(null); // { fontFamily, fontSize, fill, fontWeight, fontStyle, charSpacing } khi chá»n text
  const selectedTextRef = useRef(null);
  const [activeObjectInfo, setActiveObjectInfo] = useState(null);
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [layers, setLayers] = useState([]);
  const [canvasSideReady, setCanvasSideReady] = useState(null);
  const historyRef = useRef({ front: [], back: [] });
  const historyIndexRef = useRef({ front: -1, back: -1 });
  const isRestoringHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isSpacePressedRef = useRef(false);
  const objectIdCounterRef = useRef(1);
  const resizeStateRef = useRef(null);
  const canvasInitializedRef = useRef(false);
  const initializedSideRef = useRef(null);
  const isUnmountingRef = useRef(false);
  const lastCanvasLoadKeyRef = useRef('');

  useEffect(() => () => {
    isUnmountingRef.current = true;
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), [setContextMenu]);

  const startResizePanel = useCallback((panel, event) => {
    event.preventDefault();
    resizeStateRef.current = {
      panel,
      startX: event.clientX,
      startLeftWidth: leftSidebarWidth,
    };
  }, [leftSidebarWidth]);

  useEffect(() => {
    const onMouseMove = (event) => {
      const stateInfo = resizeStateRef.current;
      if (!stateInfo) return;
      const viewportWidth = window.innerWidth;

      if (stateInfo.panel === 'left') {
        const maxByViewport = viewportWidth - MIN_CENTER_WIDTH;
        const next = stateInfo.startLeftWidth + (event.clientX - stateInfo.startX);
        const clamped = Math.max(LEFT_MIN_WIDTH, Math.min(Math.min(LEFT_MAX_WIDTH, maxByViewport), next));
        setLeftSidebarWidth(clamped);
      }
    };

    const onMouseUp = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [leftSidebarWidth, setLeftSidebarWidth]);

  useEffect(() => {
    const snapshot = state?.designSnapshot;
    if (snapshot) {
      try {
        const parsed = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
        designRef.current.front = parsed.front ?? null;
        designRef.current.back = parsed.back ?? null;
      } catch {
        // ignore invalid snapshot
      }
    }
  }, [state?.designSnapshot]);

  useEffect(() => {
    Promise.all([getBagTemplate(templateId), getTextures()])
      .then(([t, tex]) => {
        setTemplate(t);
        setTextures(tex);
      })
      .catch(() => message.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [templateId]);

  const isEditableObject = useCallback((obj) => {
    if (!obj) return false;
    if (obj.dataRole === 'system') return false;
    if (obj.name === '__bgRect__') return false;
    if (obj.excludeFromExport) return false;
    return true;
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
      setFloatingTool(null);
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
  }, [isEditableObject, setActiveTab, setFloatingObjectMenuPos, setFloatingTool]);

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

  const updateHistoryButtons = useCallback((targetSide = side) => {
    const arr = historyRef.current[targetSide] || [];
    const idx = historyIndexRef.current[targetSide] ?? -1;
    setCanUndo(idx > 0);
    setCanRedo(idx >= 0 && idx < arr.length - 1);
  }, [side]);

  const initHistoryForCurrentSide = useCallback((canvas) => {
    const json = serializeCanvas(canvas);
    historyRef.current[side] = [json];
    historyIndexRef.current[side] = 0;
    updateHistoryButtons(side);
  }, [serializeCanvas, side, updateHistoryButtons]);

  const pushHistory = useCallback((canvas) => {
    if (isRestoringHistoryRef.current) return;
    const json = serializeCanvas(canvas);
    const arr = historyRef.current[side] || [];
    const idx = historyIndexRef.current[side] ?? -1;
    if (idx >= 0 && arr[idx] === json) return;

    const next = arr.slice(0, idx + 1);
    next.push(json);
    const limit = 60;
    if (next.length > limit) next.shift();

    historyRef.current[side] = next;
    historyIndexRef.current[side] = next.length - 1;
    updateHistoryButtons(side);
  }, [serializeCanvas, side, updateHistoryButtons]);

  const applyHistoryIndex = useCallback((nextIndex) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const arr = historyRef.current[side] || [];
    if (nextIndex < 0 || nextIndex >= arr.length) return;

    isRestoringHistoryRef.current = true;
    canvas.loadFromJSON(arr[nextIndex], () => {
      canvas.requestRenderAll();
      historyIndexRef.current[side] = nextIndex;
      isRestoringHistoryRef.current = false;
      syncSelectionState(canvas.getActiveObject());
      syncLayers(canvas);
      updateHistoryButtons(side);
    });
  }, [side, syncSelectionState, syncLayers, updateHistoryButtons]);

  const handleUndo = useCallback(() => {
    const idx = historyIndexRef.current[side] ?? -1;
    if (idx <= 0) return;
    applyHistoryIndex(idx - 1);
  }, [applyHistoryIndex, side]);

  const handleRedo = useCallback(() => {
    const arr = historyRef.current[side] || [];
    const idx = historyIndexRef.current[side] ?? -1;
    if (idx < 0 || idx >= arr.length - 1) return;
    applyHistoryIndex(idx + 1);
  }, [applyHistoryIndex, side]);

  useEffect(() => {
    updateHistoryButtons(side);
  }, [side, updateHistoryButtons]);

  useEffect(() => {
    if (!template || loading) return;
    const loadKey = `${template?.id || 'template'}:${side}:${loading ? '1' : '0'}`;
    if (lastCanvasLoadKeyRef.current === loadKey) return;
    lastCanvasLoadKeyRef.current = loadKey;

    canvasInitializedRef.current = true;
    initializedSideRef.current = side;
    let disposed = false;
    let blockNativeContextMenu = null;
    const currentSide = side;
    const designStore = designRef.current;
    const c = fabricRef.current || new fabric.Canvas('design-canvas', { width: CANVAS_SIZE, height: CANVAS_SIZE });
    fabricRef.current = c;
    c.off();
    c.clear();
    c.setWidth(CANVAS_SIZE);
    c.setHeight(CANVAS_SIZE);
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // Keep handlers in outer scope so cleanup can detach them safely.
    const onKeyDown = (e) => {
      if (disposed) return;

      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }

      const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
      const isRedo = ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
        || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z');
      if (isUndo) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (isRedo) {
        e.preventDefault();
        handleRedo();
        return;
      }

      const active = c.getActiveObject();
      if (!active || !isEditableObject(active)) return;
      if (active.type === 'i-text' && active.isEditing) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        c.remove(active);
        c.discardActiveObject();
        c.requestRenderAll();
        syncSelectionState(null);
        pushHistory(c);
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') active.set('left', (active.left || 0) - step);
        if (e.key === 'ArrowRight') active.set('left', (active.left || 0) + step);
        if (e.key === 'ArrowUp') active.set('top', (active.top || 0) - step);
        if (e.key === 'ArrowDown') active.set('top', (active.top || 0) + step);
        active.setCoords();
        c.requestRenderAll();
        syncSelectionState(active);
        pushHistory(c);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'Space') isSpacePressedRef.current = false;
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    /* Nhá» gá»n nÃºt kÃ©o/resize */
    const origCornerSize = fabric.Object.prototype.cornerSize;
    const origPadding = fabric.Object.prototype.padding;
    fabric.Object.prototype.cornerSize = 8;
    fabric.Object.prototype.padding = 0;

    const imgUrl = side === 'front' ? template.frontImageUrl : template.backImageUrl;
    const parseArea = (val) => {
      if (!val) return { x: 10, y: 10, width: 80, height: 80 };
      try {
        const o = typeof val === 'object' ? val : JSON.parse(val || '{}');
        return { x: 10, y: 10, width: 80, height: 80, ...o };
      } catch {
        return { x: 10, y: 10, width: 80, height: 80 };
      }
    };
    const customArea = parseArea(side === 'front' ? template.frontCustomArea : template.backCustomArea);
    const { x = 10, y = 10, width = 80, height = 80 } = customArea;

    fabric.Image.fromURL(imgUrl, (img) => {
      if (disposed) return;
      const imgW = img?.width || 1;
      const imgH = img?.height || 1;
      const scale = Math.min(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;
      const imgLeft = (CANVAS_SIZE - scaledW) / 2;
      const imgTop = (CANVAS_SIZE - scaledH) / 2;

      // x, y, width, height are percentages on the source image.
      // Convert them to coordinates on the scaled and centered image.
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

      const applyObjectClipPath = (obj) => {
        if (!isEditableObject(obj)) return;
        obj.clipPath = createObjectClipPath();
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

      // Store clip bounds for external use (applyBgColor, AI patch)
      clipBoundsRef.current = { clipX, clipY, clipW, clipH };
      clipSideRef.current = side;
      if (!disposed) setCanvasSideReady(side);
      bgRectRef.current = null;

      let guideRect;
      let snapGuideV;
      let snapGuideH;
      let isPanning = false;
      let lastPosX = 0;
      let lastPosY = 0;
      let historyReady = false;
      let snapFadeTimerV = null;
      let snapFadeTimerH = null;

      const lerp = (start, end, t) => start + (end - start) * t;
      const smoothMove = (obj, targetLeft, targetTop) => {
        const startLeft = Number.isFinite(obj.__smoothLeft) ? obj.__smoothLeft : (obj.left || 0);
        const startTop = Number.isFinite(obj.__smoothTop) ? obj.__smoothTop : (obj.top || 0);
        const nextLeft = lerp(startLeft, targetLeft, 0.35);
        const nextTop = lerp(startTop, targetTop, 0.35);
        obj.__smoothLeft = nextLeft;
        obj.__smoothTop = nextTop;
        obj.set({ left: nextLeft, top: nextTop });
      };

      const clampToClip = (obj) => {
        if (!obj || obj === guideRect || obj === bgRectRef.current) return;
        let w = (obj.width || 0) * (obj.scaleX || 1);
        let h = (obj.height || 0) * (obj.scaleY || 1);
        const baseW = obj.width || 1;
        const baseH = obj.height || 1;
        if (w > clipW || h > clipH) {
          const scaleLimit = Math.min(clipW / baseW, clipH / baseH);
          obj.set({ scaleX: Math.min(obj.scaleX || 1, scaleLimit), scaleY: Math.min(obj.scaleY || 1, scaleLimit) });
          w = baseW * (obj.scaleX || 1);
          h = baseH * (obj.scaleY || 1);
        }
        const maxLeft = clipX + clipW - w;
        const maxTop = clipY + clipH - h;
        obj.set({
          left: Math.max(clipX, Math.min(obj.left, maxLeft)),
          top: Math.max(clipY, Math.min(obj.top, maxTop)),
        });
      };

      const showSnapGuides = (x, y) => {
        if (snapGuideV) {
          if (Number.isFinite(x)) {
            snapGuideV.set({
              x1: x,
              y1: clipY,
              x2: x,
              y2: clipY + clipH,
              visible: true,
              stroke: '#22c55e',
              strokeWidth: 1.5,
              opacity: 0.8,
            });
            if (snapFadeTimerV) clearTimeout(snapFadeTimerV);
            snapFadeTimerV = setTimeout(() => {
              snapGuideV?.set({ opacity: 0.4 });
              c.requestRenderAll();
            }, 120);
          } else {
            snapGuideV.set({ visible: false });
          }
        }
        if (snapGuideH) {
          if (Number.isFinite(y)) {
            snapGuideH.set({
              x1: clipX,
              y1: y,
              x2: clipX + clipW,
              y2: y,
              visible: true,
              stroke: '#22c55e',
              strokeWidth: 1.5,
              opacity: 0.8,
            });
            if (snapFadeTimerH) clearTimeout(snapFadeTimerH);
            snapFadeTimerH = setTimeout(() => {
              snapGuideH?.set({ opacity: 0.4 });
              c.requestRenderAll();
            }, 120);
          } else {
            snapGuideH.set({ visible: false });
          }
        }
      };

      const hideSnapGuides = () => {
        if (snapFadeTimerV) {
          clearTimeout(snapFadeTimerV);
          snapFadeTimerV = null;
        }
        if (snapFadeTimerH) {
          clearTimeout(snapFadeTimerH);
          snapFadeTimerH = null;
        }
        showSnapGuides(null, null);
      };

      const applyDraggingVisual = (obj) => {
        if (!obj || !isEditableObject(obj) || obj.__dragLifted) return;
        obj.__baseScaleX = obj.scaleX || 1;
        obj.__baseScaleY = obj.scaleY || 1;
        obj.__baseShadow = obj.shadow || null;
        obj.__dragLifted = true;
        obj.set({
          scaleX: (obj.__baseScaleX || 1) * 1.015,
          scaleY: (obj.__baseScaleY || 1) * 1.015,
          shadow: {
            color: 'rgba(22,163,74,0.25)',
            blur: 28,
            offsetX: 0,
            offsetY: 12,
          },
        });
      };

      const clearDraggingVisual = (obj) => {
        if (!obj || !obj.__dragLifted) return;
        obj.set({
          scaleX: obj.__baseScaleX || 1,
          scaleY: obj.__baseScaleY || 1,
          shadow: obj.__baseShadow || null,
        });
        obj.__baseScaleX = null;
        obj.__baseScaleY = null;
        obj.__baseShadow = null;
        obj.__dragLifted = false;
        obj.__smoothLeft = null;
        obj.__smoothTop = null;
      };

      const applySnapToClip = (obj) => {
        if (!obj || !isEditableObject(obj)) return;

        const threshold = 8;
        const centerX = clipX + clipW / 2;
        const centerY = clipY + clipH / 2;
        const rect = obj.getBoundingRect(true, true);
        const sourceX = [
          { key: 'left', value: rect.left },
          { key: 'center', value: rect.left + rect.width / 2 },
          { key: 'right', value: rect.left + rect.width },
        ];
        const sourceY = [
          { key: 'top', value: rect.top },
          { key: 'center', value: rect.top + rect.height / 2 },
          { key: 'bottom', value: rect.top + rect.height },
        ];
        const targetsX = [
          { value: clipX, tag: 'clip-left' },
          { value: centerX, tag: 'clip-center' },
          { value: clipX + clipW, tag: 'clip-right' },
        ];
        const targetsY = [
          { value: clipY, tag: 'clip-top' },
          { value: centerY, tag: 'clip-center' },
          { value: clipY + clipH, tag: 'clip-bottom' },
        ];

        c.getObjects().forEach((other) => {
          if (other === obj || !isEditableObject(other) || other.visible === false) return;
          const r = other.getBoundingRect(true, true);
          targetsX.push(
            { value: r.left, tag: 'obj-left' },
            { value: r.left + r.width / 2, tag: 'obj-center' },
            { value: r.left + r.width, tag: 'obj-right' }
          );
          targetsY.push(
            { value: r.top, tag: 'obj-top' },
            { value: r.top + r.height / 2, tag: 'obj-center' },
            { value: r.top + r.height, tag: 'obj-bottom' }
          );
        });

        let bestX = null;
        sourceX.forEach((s) => {
          targetsX.forEach((t) => {
            const diff = t.value - s.value;
            const abs = Math.abs(diff);
            if (abs > threshold) return;
            if (!bestX || abs < bestX.abs) bestX = { diff, abs, target: t.value, tag: t.tag };
          });
        });

        let bestY = null;
        sourceY.forEach((s) => {
          targetsY.forEach((t) => {
            const diff = t.value - s.value;
            const abs = Math.abs(diff);
            if (abs > threshold) return;
            if (!bestY || abs < bestY.abs) bestY = { diff, abs, target: t.value, tag: t.tag };
          });
        });

        if (bestX) obj.set('left', (obj.left || 0) + bestX.diff);
        if (bestY) obj.set('top', (obj.top || 0) + bestY.diff);

        showSnapGuides(
          bestX?.target ?? null,
          bestY?.target ?? null
        );
      };

      c.setBackgroundImage(img, () => {
        if (disposed) return;

        const createGuide = () => {
          // Background fill rect (inside edit area, below content)
          const br = new fabric.Rect({
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
          c.add(br);
          bgRectRef.current = br;
          br.sendToBack();

          // Green dashed guide frame on top
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
          c.add(guideRect);
          guideRect.bringToFront();

          snapGuideV = new fabric.Line([0, 0, 0, 0], {
            stroke: '#00e0a4',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            visible: false,
            name: '__snapGuide__',
            dataRole: 'system',
          });
          snapGuideH = new fabric.Line([0, 0, 0, 0], {
            stroke: '#00e0a4',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            visible: false,
            name: '__snapGuide__',
            dataRole: 'system',
          });
          c.add(snapGuideV);
          c.add(snapGuideH);
          snapGuideV.bringToFront();
          snapGuideH.bringToFront();
        };

        const saved = designStore[currentSide];
        if (saved) {
          c.loadFromJSON(saved, () => {
            if (disposed) return;
            // Remove system artifacts loaded from previous snapshots, then recreate stable guides
            c.getObjects().forEach((o) => {
              const isLegacyBgRect =
                o?.type === 'rect'
                && Math.abs((o.left || 0) - clipX) < 0.5
                && Math.abs((o.top || 0) - clipY) < 0.5
                && Math.abs((o.width || 0) - clipW) < 0.5
                && Math.abs((o.height || 0) - clipH) < 0.5
                && o?.selectable === false
                && o?.evented === false;
              if (o.dataRole === 'system' || o.name === '__bgRect__' || o.excludeFromExport || isLegacyBgRect) {
                c.remove(o);
              }
            });
            createGuide();
            c.forEachObject((o) => {
              o.set({ cornerSize: 8, padding: 0 });
              ensureObjectId(o);
              applyObjectClipPath(o);
              applyObjectLockState(o, Boolean(o.locked));
              clampToClip(o);
            });
            c.renderAll();
            initHistoryForCurrentSide(c);
            syncLayers(c);
            historyReady = true;
          });
        } else {
          createGuide();
          c.renderAll();
          initHistoryForCurrentSide(c);
          syncLayers(c);
          historyReady = true;
        }
      });

      const onAdded = (e) => {
        if (disposed) return;
        const obj = e.target;
        if (!obj) return;
        ensureObjectId(obj);
        applyObjectClipPath(obj);
        obj.set({ cornerSize: 8, padding: 0 });
        applyObjectLockState(obj, Boolean(obj.locked));
        clampToClip(obj);
        syncLayers(c);
        if (historyReady) pushHistory(c);
      };
      const onModified = (e) => {
        if (disposed) return;
        hideSnapGuides();
        clearDraggingVisual(e.target);
        clampToClip(e.target);
        syncLayers(c);
        if (historyReady) pushHistory(c);
      };
      const onMoving = (e) => {
        if (disposed) return;
        const obj = e.target;
        if (!obj) return;
        const targetLeft = obj.left || 0;
        const targetTop = obj.top || 0;
        smoothMove(obj, targetLeft, targetTop);
        applyDraggingVisual(e.target);
        applySnapToClip(e.target);
        clampToClip(e.target);
      };
      const onScaling = (e) => {
        if (disposed) return;
        hideSnapGuides();
        clearDraggingVisual(e.target);
        clampToClip(e.target);
      };
      const onRemoved = () => {
        if (disposed) return;
        hideSnapGuides();
        syncLayers(c);
        if (historyReady) pushHistory(c);
      };
      const onTextChanged = () => {
        if (disposed) return;
        if (historyReady) pushHistory(c);
      };

      c.on('object:added', onAdded);
      c.on('object:modified', onModified);
      c.on('object:moving', onMoving);
      c.on('object:scaling', onScaling);
      c.on('object:removed', onRemoved);
      c.on('text:changed', onTextChanged);

      // kéo canvas như scroll (pan view)
      const onMouseDown = (opt) => {
        if (disposed) return;
        if (opt.e?.button === 2) {
          const target = opt.target;
          if (isEditableObject(target)) {
            ensureObjectId(target);
            c.setActiveObject(target);
            c.requestRenderAll();
            syncSelectionState(target);
            syncLayers(c);
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
        if (opt.target && !isSpacePressedRef.current) return; // đang kéo object thì không pan (trừ khi giữ Space)
        isPanning = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        c.setCursor('grab');
      };

      const onMouseMove = (opt) => {
        if (!isPanning || disposed) return;
        const e = opt.e;
        const vpt = c.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        lastPosX = e.clientX;
        lastPosY = e.clientY;
        c.requestRenderAll();
      };

      const onMouseUp = () => {
        if (disposed) return;
        isPanning = false;
        c.setCursor('default');
        hideSnapGuides();
        clearDraggingVisual(c.getActiveObject());
        c.requestRenderAll();
      };
      const onMouseWheel = (opt) => {
        if (disposed) return;
        const delta = opt.e.deltaY;
        setZoom((prev) => Math.max(50, Math.min(300, Math.round((prev - delta * 0.05)))));
        opt.e.preventDefault();
        opt.e.stopPropagation();
      };

      c.on('mouse:down', onMouseDown);
      c.on('mouse:move', onMouseMove);
      c.on('mouse:up', onMouseUp);
      c.on('mouse:wheel', onMouseWheel);

      blockNativeContextMenu = (event) => event.preventDefault();
      c.upperCanvasEl?.addEventListener('contextmenu', blockNativeContextMenu);
      document.addEventListener('click', closeContextMenu);

      const onSelectionCreated = (e) => {
        syncSelectionState(e.selected?.[0]);
        syncLayers(c);
      };
      const onSelectionUpdated = (e) => {
        syncSelectionState(e.selected?.[0]);
        syncLayers(c);
      };
      const onSelectionCleared = () => {
        if (disposed) return;
        syncSelectionState(null);
        syncLayers(c);
      };
      c.on('selection:created', onSelectionCreated);
      c.on('selection:updated', onSelectionUpdated);
      c.on('selection:cleared', onSelectionCleared);
    }, { crossOrigin: 'anonymous' });

    return () => {
      disposed = true;
      selectedTextRef.current = null;
      setTextProps(null);
      setActiveObjectInfo(null);
      designStore[currentSide] = exportCanvasJson(c);
      c.off();
      if (blockNativeContextMenu) {
        c.upperCanvasEl?.removeEventListener('contextmenu', blockNativeContextMenu);
      }
      document.removeEventListener('click', closeContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      fabric.Object.prototype.cornerSize = origCornerSize;
      fabric.Object.prototype.padding = origPadding;
      if (isUnmountingRef.current) {
        c.dispose();
        fabricRef.current = null;
      }
    };
  }, [
    template,
    loading,
    side,
    applyObjectLockState,
    closeContextMenu,
    ensureObjectId,
    exportCanvasJson,
    handleRedo,
    handleUndo,
    initHistoryForCurrentSide,
    isEditableObject,
    pushHistory,
    setContextMenu,
    setZoom,
    syncLayers,
    syncSelectionState,
  ]);

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

  const hexToRgba = (hex, alpha = 0.28) => {
    if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
    const clean = hex.replace('#', '');
    const normalized = clean.length === 3
      ? clean.split('').map((c) => `${c}${c}`).join('')
      : clean;
    const n = Number.parseInt(normalized, 16);
    if (!Number.isFinite(n)) return `rgba(0,0,0,${alpha})`;
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const applyBgColor = (color) => {
    setBgColorState(color);
    if (!fabricRef.current || !bgRectRef.current) return;
    if (!color || color === 'none' || color === 'transparent') {
      bgRectRef.current.set({ fill: 'rgba(0,0,0,0)' });
    } else {
      bgRectRef.current.set({ fill: hexToRgba(color, 0.28) });
    }
    fabricRef.current.requestRenderAll();
  };

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
    const svg = renderToStaticMarkup(createElement(IconComponent, { size: 64 }));
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
    const text = new fabric.IText('Nhập text', { left: 150, top: 150, fontFamily: 'Arial' });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

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
        setTextProps((p) => (p ? { ...p, [key]: value } : null));
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
    setTextProps((p) => (p ? { ...p, [key]: value } : null));
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [pushHistory, syncSelectionState]);

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
      nextText = current.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
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
  }, [pushHistory, syncSelectionState]);

  const cycleTextAlign = useCallback(() => {
    const obj = selectedTextRef.current;
    if (!obj || obj.type !== 'i-text') return;
    const order = ['left', 'center', 'right'];
    const idx = order.indexOf(obj.textAlign || 'left');
    const next = order[(idx + 1) % order.length];
    updateTextProp('textAlign', next);
  }, [updateTextProp]);

  const updateActiveObjectStyle = useCallback((patch) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return;

    if (Object.prototype.hasOwnProperty.call(patch, 'fill')) {
      obj.set({ fill: patch.fill });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'stroke')) {
      obj.set({ stroke: patch.stroke });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'strokeWidth')) {
      obj.set({ strokeWidth: Number(patch.strokeWidth) || 0 });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'radius')) {
      const radius = Math.max(0, Number(patch.radius) || 0);
      obj.set({ rx: radius, ry: radius });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'flipX')) {
      obj.set({ flipX: Boolean(patch.flipX) });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'flipY')) {
      obj.set({ flipY: Boolean(patch.flipY) });
    }

    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [isEditableObject, pushHistory, syncSelectionState]);

  const updateActiveObjectProp = useCallback((patch) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return;

    if (Object.prototype.hasOwnProperty.call(patch, 'scale')) {
      const s = Math.max(0.1, Number(patch.scale) || 1);
      obj.set({ scaleX: s, scaleY: s });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'opacity')) {
      const opacity = Math.max(0.05, Math.min(1, Number(patch.opacity) || 1));
      obj.set({ opacity });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'angle')) {
      obj.set({ angle: Number(patch.angle) || 0 });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'x')) {
      obj.set({ left: Number(patch.x) || 0 });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'y')) {
      obj.set({ top: Number(patch.y) || 0 });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'visible')) {
      obj.set({ visible: Boolean(patch.visible) });
    }

    obj.setCoords();
    canvas.requestRenderAll();
    syncSelectionState(obj);
    pushHistory(canvas);
  }, [isEditableObject, pushHistory, syncSelectionState]);

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
  }, [isEditableObject, pushHistory, syncLayers, syncSelectionState]);

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
    if (t === 'i-text' || t === 'text') return 'Text';
    if (t === 'image') return 'Image';
    if (t === 'group') return 'Icon';
    if (t === 'path') return 'Shape';
    return 'Object';
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

  const getActiveEditableObject = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !isEditableObject(obj)) return null;
    return obj;
  }, [isEditableObject]);

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
  }, [applyObjectLockState, ensureObjectId, getActiveEditableObject, pushHistory, syncLayers, syncSelectionState]);

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
  }, [getActiveEditableObject, pushHistory, syncLayers, syncSelectionState]);

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
    if (action === 'delete') deleteActiveObject();
    closeContextMenu();
  }, [
    alignActiveObject,
    closeContextMenu,
    contextMenu?.objectId,
    deleteActiveObject,
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
    navigate(`/custom-bag/${templateId}/preview`, { state: { designSnapshot: buildSnapshot() } });
  };

  const goToOrder = () => {
    navigate(`/custom-bag/${templateId}/checkout`, { state: { designSnapshot: buildSnapshot() } });
  };

  const isTextObject = activeObjectInfo?.type === 'i-text';
  const isImageObject = activeObjectInfo?.type === 'image';
  const isShapeObject = Boolean(activeObjectInfo) && !isTextObject && !isImageObject;
  const floatingToolbarPos = floatingObjectMenuPos
    ? {
      x: Math.max(96, Math.min(window.innerWidth - 360, floatingObjectMenuPos.x - 230)),
      y: Math.max(72, floatingObjectMenuPos.y - 54),
    }
    : null;

  if (loading || !template) {
    return <div className="design-page"><div className="design-loading">Đang tải...</div></div>;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#22c55e',
          colorBgContainer: '#ffffff',
          colorBorder: '#e5e7eb',
          colorText: '#111827',
          borderRadius: 8,
          controlHeight: 36,
        },
      }}
    >
      <div className="design-page">
        <main
          className="design-canvas-wrap"
          onMouseEnter={() => setIsCanvasHovered(true)}
          onMouseLeave={() => setIsCanvasHovered(false)}
        >
          <div className={`lab-grid${isCanvasHovered ? ' active' : ''}`} aria-hidden="true" />
          <Topbar
            templateName={template.name}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onPreview={goToPreview}
            onOrder={goToOrder}
            onBack={() => navigate('/custom-bag')}
          />

          <div className="design-body">
            <FloatingToolbar
              activeObjectInfo={activeObjectInfo}
              isTextObject={isTextObject}
              isImageObject={isImageObject}
              isShapeObject={isShapeObject}
              textProps={textProps}
              floatingTool={floatingTool}
              setFloatingTool={setFloatingTool}
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
              activeFillColor={selectedTextRef.current?.fill}
              toolbarPosition={floatingToolbarPos}
            />

            <LeftPanel
              activeTab={activeTab}
              leftSidebarWidth={leftSidebarWidth}
              setActiveTab={setActiveTab}
              side={side}
              switchSide={switchSide}
              addText={addText}
              addImage={addImage}
              greenAiPanel={(
                <GreenAiPanel
                  greenAiPrompt={greenAiPrompt}
                  setGreenAiPrompt={setGreenAiPrompt}
                  greenAiGenerating={greenAiGenerating}
                  handleGreenAiGenerate={handleGreenAiGenerate}
                  greenAiError={greenAiError}
                  greenAiImageDataUrl={greenAiImageDataUrl}
                  savedAiItems={savedAiItems}
                  applySavedAiItem={applySavedAiItem}
                  removeSavedAiItem={removeSavedAiItem}
                />
              )}
              greenQrPanel={(
                <GreenQrPanel
                  greenQrMode={greenQrMode}
                  setGreenQrMode={setGreenQrMode}
                  greenQrText={greenQrText}
                  setGreenQrText={setGreenQrText}
                  stopGreenQrRecording={stopGreenQrRecording}
                  clearRecordedAudio={clearRecordedAudio}
                  setGreenQrAudioFile={setGreenQrAudioFile}
                  greenQrAudioFile={greenQrAudioFile}
                  greenQrRecording={greenQrRecording}
                  greenQrRecordSeconds={greenQrRecordSeconds}
                  fmtMmSs={fmtMmSs}
                  startGreenQrRecording={startGreenQrRecording}
                  greenQrGenerating={greenQrGenerating}
                  greenQrRecordedUrl={greenQrRecordedUrl}
                  greenQrRecordedFile={greenQrRecordedFile}
                  greenQrColor={greenQrColor}
                  setGreenQrColor={setGreenQrColor}
                  generateGreenQr={generateGreenQr}
                />
              )}
              iconList={ICON_LIST}
              addIconToCanvas={addIconToCanvas}
              bgColor={bgColor}
              applyBgColor={applyBgColor}
              textures={textures}
              addTexture={addTexture}
              startResizePanel={startResizePanel}
            />

            <div className="design-canvas-container">
              <div className="design-canvas-inner">
                <canvas id="design-canvas" />
              </div>
            </div>
            <div className="design-zoom-bar">
              <button className="design-zoom-btn" onClick={() => setZoom((z) => Math.max(50, z - 10))}>−</button>
              <Slider
                min={50}
                max={300}
                value={zoom}
                onChange={setZoom}
                className="design-zoom-slider"
                tooltip={{ formatter: (v) => `${v}%` }}
              />
              <button className="design-zoom-btn" onClick={() => setZoom((z) => Math.min(300, z + 10))}>+</button>
              <span className="design-zoom-label">{zoom}%</span>
            </div>
          </div>
        </main>

        {activeObjectInfo && floatingObjectMenuPos && (
          <div className="object-mini-menu" style={{ left: floatingObjectMenuPos.x, top: floatingObjectMenuPos.y }}>
            <Tooltip title="AI"><button type="button" onClick={() => setActiveTab('greenai')}><PiSparkle /></button></Tooltip>
            <Tooltip title="Lock / Unlock"><button type="button" onClick={() => {
              const obj = fabricRef.current?.getActiveObject();
              if (!obj?.dataId) return;
              toggleLayerLock(obj.dataId);
            }}><LockOutlined /></button></Tooltip>
            <Tooltip title="Duplicate"><button type="button" onClick={duplicateActiveObject}><CopyOutlined /></button></Tooltip>
            <Tooltip title="Delete"><button type="button" onClick={deleteActiveObject}><DeleteOutlined /></button></Tooltip>
            <Tooltip title="More"><button type="button" onClick={() => setShowLayerOverlay((v) => !v)}>...</button></Tooltip>
          </div>
        )}

        {showLayerOverlay && (
          <div className="layer-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="layer-overlay-head">
              <span>Layers</span>
              <button type="button" onClick={() => setShowLayerOverlay(false)}>✕</button>
            </div>
            {layers.length === 0 ? (
              <p className="design-layer-empty">No object.</p>
            ) : (
              <div className="design-layer-list">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`design-layer-item draggable-layer${layer.isActive ? ' active' : ''}${dragLayerId === layer.id ? ' is-dragging' : ''}${dragOverLayerId === layer.id ? ' is-drag-over' : ''}`}
                    onClick={() => selectLayer(layer.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', layer.id);
                      setDragLayerId(layer.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragLayerId && dragLayerId !== layer.id) setDragOverLayerId(layer.id);
                    }}
                    onDragLeave={() => {
                      if (dragOverLayerId === layer.id) setDragOverLayerId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
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
                    <div className="design-layer-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" title="Top" onClick={() => moveLayer(layer.id, 'top')}><VerticalAlignTopOutlined /></button>
                      <button type="button" title="Up" onClick={() => moveLayer(layer.id, 'up')}><ArrowUpOutlined /></button>
                      <button type="button" title="Down" onClick={() => moveLayer(layer.id, 'down')}><ArrowDownOutlined /></button>
                      <button type="button" title="Bottom" onClick={() => moveLayer(layer.id, 'bottom')}><VerticalAlignBottomOutlined /></button>
                      <button type="button" title="Show/Hide" onClick={() => toggleLayerVisibility(layer.id)}>{layer.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}</button>
                      <button type="button" title="Lock" onClick={() => toggleLayerLock(layer.id)}>{layer.locked ? <LockOutlined /> : <UnlockOutlined />}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {contextMenu && (
          <div
            className="design-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => handleContextAction('select')}>Chọn layer</button>
            <button type="button" onClick={() => handleContextAction('duplicate')}>Nhân đôi</button>
            <button type="button" onClick={() => handleContextAction('align-center')}>Căn giữa ngang</button>
            <button type="button" onClick={() => handleContextAction('align-middle')}>Căn giữa dọc</button>
            <button type="button" className="danger" onClick={() => handleContextAction('delete')}>Xóa</button>
          </div>
        )}
      </div>
    </ConfigProvider >
  );
}

