import React, { useEffect, useRef, useState, useCallback, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { message, Slider, Tooltip, ConfigProvider, theme } from 'antd';
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
import { GreenAiPanelPremium, GreenQrPanelPremium } from '../components/design/AiPanelsPremium';
import Topbar from '../components/design/Topbar';
import LeftPanel from '../components/design/LeftPanel';
import FloatingToolbar from '../components/design/FloatingToolbar';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { Dock, DockItem } from '@/components/ui/dock';
import WebGLBackground from '@/components/ui/webgl-background';
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
  { Icon: PiHeart, label: 'Trái tim' },
  { Icon: PiHeartStraight, label: 'Trái tim thẳng' },
  { Icon: PiStar, label: 'Ngôi sao' },
  { Icon: PiStarHalf, label: 'Nửa sao' },
  { Icon: PiSparkle, label: 'Lấp lánh' },
  { Icon: PiFlower, label: 'Hoa' },
  { Icon: PiFlowerLotus, label: 'Hoa sen' },
  { Icon: PiFlowerTulip, label: 'Tulip' },
  { Icon: PiSun, label: 'Mặt trời' },
  { Icon: PiMoon, label: 'Mặt trăng' },
  { Icon: PiCloud, label: 'Mây' },
  { Icon: PiCloudSun, label: 'Mây nắng' },
  { Icon: PiCloudRain, label: 'Mây mưa' },
  { Icon: PiSnowflake, label: 'Tuyết' },
  { Icon: PiRainbow, label: 'Cầu vồng' },
  { Icon: PiLightning, label: 'Sét' },
  { Icon: PiFire, label: 'Lửa' },
  { Icon: PiLeaf, label: 'Lá' },
  { Icon: PiTree, label: 'Cây' },
  { Icon: PiTreePalm, label: 'Cây cọ' },
  { Icon: PiTreeEvergreen, label: 'Cây thông' },
  { Icon: PiMountains, label: 'Núi' },
  { Icon: PiWaves, label: 'Sóng' },
  { Icon: PiCheck, label: 'Dấu kiểm' },
  { Icon: PiPlus, label: 'Dấu cộng' },
  { Icon: PiGift, label: 'Quà' },
  { Icon: PiCake, label: 'Bánh' },
  { Icon: PiCoffee, label: 'Cà phê' },
  { Icon: PiPizza, label: 'Pizza' },
  { Icon: PiHamburger, label: 'Hamburger' },
  { Icon: PiCookie, label: 'Bánh quy' },
  { Icon: PiIceCream, label: 'Kem' },
  { Icon: PiWine, label: 'Rượu' },
  { Icon: PiBeerBottle, label: 'Bia' },
  { Icon: PiCamera, label: 'Máy ảnh' },
  { Icon: PiFish, label: 'Cá' },
  { Icon: PiBird, label: 'Chim' },
  { Icon: PiCat, label: 'Mèo' },
  { Icon: PiDog, label: 'Chó' },
  { Icon: PiPawPrint, label: 'Dấu chân' },
  { Icon: PiButterfly, label: 'Bướm' },
  { Icon: PiMusicNote, label: 'Nốt nhạc' },
  { Icon: PiBookmark, label: 'Đánh dấu' },
  { Icon: PiMapPin, label: 'Vị trí' },
  { Icon: PiEnvelope, label: 'Thư' },
  { Icon: PiEnvelopeOpen, label: 'Thư mở' },
  { Icon: PiPhone, label: 'Điện thoại' },
  { Icon: PiHouse, label: 'Nhà' },
  { Icon: PiCar, label: 'Xe hơi' },
  { Icon: PiAirplane, label: 'Máy bay' },
  { Icon: PiBicycle, label: 'Xe đạp' },
  { Icon: PiRocket, label: 'Tên lửa' },
  { Icon: PiAnchor, label: 'Mỏ neo' },
  { Icon: PiBalloon, label: 'Bóng bay' },
  { Icon: PiSailboat, label: 'Thuyền buồm' },
  { Icon: PiFlag, label: 'Cờ' },
  { Icon: PiTrophy, label: 'Cúp' },
  { Icon: PiMedal, label: 'Huy chương' },
  { Icon: PiCrown, label: 'Vương miện' },
  { Icon: PiDiamond, label: 'Kim cương' },
  { Icon: PiDiamondsFour, label: 'Bốn ô' },
  { Icon: PiSmiley, label: 'Mặt cười' },
  { Icon: PiSmileyWink, label: 'Mặt nháy mắt' },
  { Icon: PiThumbsUp, label: 'Thích' },
  { Icon: PiThumbsDown, label: 'Không thích' },
  { Icon: PiCircle, label: 'Hình tròn' },
  { Icon: PiSquare, label: 'Hình vuông' },
  { Icon: PiHexagon, label: 'Lục giác' },
  { Icon: PiTriangle, label: 'Tam giác' },
  { Icon: PiUser, label: 'Người' },
  { Icon: PiUsers, label: 'Nhóm người' },
  { Icon: PiVideoCamera, label: 'Máy quay' },
  { Icon: PiWatch, label: 'Đồng hồ' },
  { Icon: PiSunglasses, label: 'Kính râm' },
  { Icon: PiUmbrella, label: 'Ô' },
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
const TEXT_PRESETS = [
  {
    id: 'headline',
    eyebrow: 'Hero',
    title: 'TIÊU ĐIỂM',
    caption: 'Headline lớn cho mặt trước',
    text: 'TIÊU ĐIỂM',
    tone: 'bold',
    style: { fontFamily: 'Anton', fontSize: 44, fontWeight: '700', fill: '#ffffff', textAlign: 'center' },
  },
  {
    id: 'signature',
    eyebrow: 'Signature',
    title: 'Green Notes',
    caption: 'Kiểu chữ mềm và cá nhân',
    text: 'Green Notes',
    tone: 'script',
    style: { fontFamily: 'Pacifico', fontSize: 34, fontWeight: '400', fill: '#22c55e', textAlign: 'center' },
  },
  {
    id: 'badge',
    eyebrow: 'Badge',
    title: 'Eco Club',
    caption: 'Cụm chữ ngắn để ghép icon',
    text: 'Eco Club',
    tone: 'clean',
    style: { fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: '700', fill: '#e5eef7', textAlign: 'center', charSpacing: 40 },
  },
];
const isEditableCanvasObject = (obj) => {
  if (!obj) return false;
  if (obj.dataRole === 'system') return false;
  if (obj.name === '__bgRect__') return false;
  if (obj.excludeFromExport) return false;
  return true;
};

export default function DesignPage() {
  const LEFT_TAB_BAR_WIDTH = 76;
  const LEFT_MIN_WIDTH = 280;
  const LEFT_MAX_WIDTH = 420;
  const MIN_CENTER_WIDTH = 560;

  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('greenshield-theme') || document.documentElement.dataset.theme || 'light';
  });
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
  const [bgColor, setBgColorState] = useState('#ffffff');
  const [textProps, setTextProps] = useState(null); // { fontFamily, fontSize, fill, fontWeight, fontStyle, charSpacing } khi chọn chữ
  const selectedTextRef = useRef(null);
  const [activeObjectInfo, setActiveObjectInfo] = useState(null);
  const [distanceHint, setDistanceHint] = useState(null);
  const [autoAlignHint, setAutoAlignHint] = useState('');
  const [guides, setGuides] = useState([]);
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
  const zoomAnimRef = useRef(null);
  const zoomValueRef = useRef(100);
  const moveRafRef = useRef(null);
  const pendingMoveTargetRef = useRef(null);
  const lastSnapResultRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.setAttribute('data-theme', themeMode);
    localStorage.setItem('greenshield-theme', themeMode);
    const timer = window.setTimeout(() => root.classList.remove('theme-transition'), 420);
    return () => window.clearTimeout(timer);
  }, [themeMode]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => () => {
    isUnmountingRef.current = true;
    if (zoomAnimRef.current) {
      cancelAnimationFrame(zoomAnimRef.current);
      zoomAnimRef.current = null;
    }
    if (moveRafRef.current) {
      cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = null;
    }
  }, []);

  const getRectSnapPoints = useCallback((rect) => ({
    x1: rect.left,
    x2: rect.left + rect.width,
    cx: rect.left + (rect.width / 2),
    y1: rect.top,
    y2: rect.top + rect.height,
    cy: rect.top + (rect.height / 2),
  }), []);

  const getSnapPoints = useCallback(({
    movingObject,
    canvas,
    clipBounds,
    nearbyLimit = 64,
  }) => {
    if (!movingObject || !canvas || !clipBounds) return null;

    const movingRect = movingObject.getBoundingRect(true, true);
    const sourcePoints = getRectSnapPoints(movingRect);
    const { clipX, clipY, clipW, clipH } = clipBounds;

    const targetsX = [
      { value: clipX, from: clipY, to: clipY + clipH, kind: 'edge', owner: 'canvas' },
      { value: clipX + clipW / 2, from: clipY, to: clipY + clipH, kind: 'center', owner: 'canvas' },
      { value: clipX + clipW, from: clipY, to: clipY + clipH, kind: 'edge', owner: 'canvas' },
    ];
    const targetsY = [
      { value: clipY, from: clipX, to: clipX + clipW, kind: 'edge', owner: 'canvas' },
      { value: clipY + clipH / 2, from: clipX, to: clipX + clipW, kind: 'center', owner: 'canvas' },
      { value: clipY + clipH, from: clipX, to: clipX + clipW, kind: 'edge', owner: 'canvas' },
    ];

    let candidates = canvas.getObjects()
      .filter((obj) => obj !== movingObject && isEditableCanvasObject(obj) && obj.visible !== false);

    if (candidates.length > 50) {
      const srcCx = sourcePoints.cx;
      const srcCy = sourcePoints.cy;
      candidates = candidates
        .map((obj) => {
          const rect = obj.getBoundingRect(true, true);
          const points = getRectSnapPoints(rect);
          const distance = Math.abs(points.cx - srcCx) + Math.abs(points.cy - srcCy);
          return { obj, points, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, nearbyLimit)
        .map((item) => ({ obj: item.obj, points: item.points }));
    } else {
      candidates = candidates.map((obj) => ({
        obj,
        points: getRectSnapPoints(obj.getBoundingRect(true, true)),
      }));
    }

    candidates.forEach(({ points }) => {
      targetsX.push(
        { value: points.x1, from: points.y1, to: points.y2, kind: 'edge', owner: 'object' },
        { value: points.cx, from: points.y1, to: points.y2, kind: 'center', owner: 'object' },
        { value: points.x2, from: points.y1, to: points.y2, kind: 'edge', owner: 'object' },
      );
      targetsY.push(
        { value: points.y1, from: points.x1, to: points.x2, kind: 'edge', owner: 'object' },
        { value: points.cy, from: points.x1, to: points.x2, kind: 'center', owner: 'object' },
        { value: points.y2, from: points.x1, to: points.x2, kind: 'edge', owner: 'object' },
      );
    });

    return {
      sourcePoints,
      targetsX,
      targetsY,
      clipBounds,
    };
  }, [getRectSnapPoints]);

  const detectSnap = useCallback(({
    sourcePoints,
    targetsX,
    targetsY,
    threshold = 6,
  }) => {
    if (!sourcePoints) return { snapX: null, snapY: null, distance: null, guides: [] };

    const sourceX = [
      { key: 'x1', value: sourcePoints.x1 },
      { key: 'cx', value: sourcePoints.cx },
      { key: 'x2', value: sourcePoints.x2 },
    ];
    const sourceY = [
      { key: 'y1', value: sourcePoints.y1 },
      { key: 'cy', value: sourcePoints.cy },
      { key: 'y2', value: sourcePoints.y2 },
    ];

    const pickNearest = (sources, targets) => {
      let best = null;
      sources.forEach((source) => {
        targets.forEach((target) => {
          const diff = target.value - source.value;
          const abs = Math.abs(diff);
          if (abs > threshold) return;
          const score = abs + (target.kind === 'center' ? 0 : 0.02);
          if (!best || score < best.score) {
            best = { source, target, diff, abs, score };
          }
        });
      });
      return best;
    };

    const snapX = pickNearest(sourceX, targetsX);
    const snapY = pickNearest(sourceY, targetsY);
    const nearest = Math.min(snapX?.abs ?? Number.POSITIVE_INFINITY, snapY?.abs ?? Number.POSITIVE_INFINITY);

    const guides = [];
    if (snapX) {
      guides.push({
        axis: 'x',
        value: snapX.target.value,
        from: snapX.target.from,
        to: snapX.target.to,
      });
    }
    if (snapY) {
      guides.push({
        axis: 'y',
        value: snapY.target.value,
        from: snapY.target.from,
        to: snapY.target.to,
      });
    }

    return {
      snapX,
      snapY,
      distance: Number.isFinite(nearest) ? nearest : null,
      guides,
    };
  }, []);

  const applySnap = useCallback(({
    object,
    snapResult,
    magneticStrength = 0.8,
  }) => {
    if (!object || !snapResult) return;

    const applyDiff = (diff) => {
      if (!Number.isFinite(diff)) return 0;
      if (Math.abs(diff) < 1) return diff;
      return diff * magneticStrength;
    };

    const dx = applyDiff(snapResult.snapX?.diff);
    const dy = applyDiff(snapResult.snapY?.diff);

    if (dx) object.set('left', (object.left || 0) + dx);
    if (dy) object.set('top', (object.top || 0) + dy);
  }, []);

  useEffect(() => {
    zoomValueRef.current = zoom;
  }, [zoom]);

  const smoothZoomTo = useCallback((target) => {
    const clampedTarget = Math.max(50, Math.min(300, Number(target) || 100));
    if (zoomAnimRef.current) {
      cancelAnimationFrame(zoomAnimRef.current);
      zoomAnimRef.current = null;
    }

    const step = () => {
      const current = zoomValueRef.current;
      const next = current + (clampedTarget - current) * 0.18;
      const done = Math.abs(clampedTarget - next) < 0.4;
      const finalValue = done ? clampedTarget : next;
      zoomValueRef.current = finalValue;
      setZoom(Math.round(finalValue));
      if (!done) {
        zoomAnimRef.current = requestAnimationFrame(step);
      } else {
        zoomAnimRef.current = null;
      }
    };

    zoomAnimRef.current = requestAnimationFrame(step);
  }, [setZoom]);

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
    if (lastCanvasLoadKeyRef.current === loadKey && fabricRef.current) return;
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

    /* Thu gọn nút kéo/resize để bớt che nội dung */
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
      if (initializedSideRef.current !== currentSide) {
        c.clear();
      }

      initializedSideRef.current = currentSide;
      const imgW = img?.width || 1;
      const imgH = img?.height || 1;
      const scale = Math.min(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;
      const imgLeft = (CANVAS_SIZE - scaledW) / 2;
      const imgTop = (CANVAS_SIZE - scaledH) / 2;

      // x, y, width, height là phần trăm trên ảnh gốc.
      // Đổi sang toạ độ trên ảnh đã scale và căn giữa.
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
      let isPanning = false;
      let lastPosX = 0;
      let lastPosY = 0;
      let historyReady = false;

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

      const applyDraggingVisual = (obj) => {
        if (!obj || !isEditableObject(obj) || obj.__dragLifted) return;
        obj.__baseShadow = obj.shadow || null;
        obj.__dragLifted = true;
        obj.set({
          shadow: {
            color: 'rgba(22,163,74,0.25)',
            blur: 18,
            offsetX: 0,
            offsetY: 8,
          },
        });
      };

      const clearDraggingVisual = (obj) => {
        if (!obj || !obj.__dragLifted) return;
        obj.set({
          shadow: obj.__baseShadow || null,
        });
        obj.__baseShadow = null;
        obj.__dragLifted = false;
        obj.__smoothLeft = null;
        obj.__smoothTop = null;
      };

      const setGuideState = (nextGuides) => {
        setGuides((prev) => {
          if (prev.length !== nextGuides.length) return nextGuides;
          for (let i = 0; i < prev.length; i += 1) {
            const a = prev[i];
            const b = nextGuides[i];
            if (!b) return nextGuides;
            if (
              a.axis !== b.axis
              || Math.round(a.left) !== Math.round(b.left)
              || Math.round(a.top) !== Math.round(b.top)
              || Math.round(a.length) !== Math.round(b.length)
            ) {
              return nextGuides;
            }
          }
          return prev;
        });
      };

      const renderGuides = (guideList) => {
        if (!guideList?.length || !c.upperCanvasEl) {
          setGuideState([]);
          return;
        }
        const canvasRect = c.upperCanvasEl.getBoundingClientRect();
        const vpt = c.viewportTransform || [1, 0, 0, 1, 0, 0];
        const toScreen = (x, y) => fabric.util.transformPoint(new fabric.Point(x, y), vpt);

        const mapped = guideList.map((guide, idx) => {
          if (guide.axis === 'x') {
            const p1 = toScreen(guide.value, guide.from);
            const p2 = toScreen(guide.value, guide.to);
            const top = canvasRect.top + Math.min(p1.y, p2.y);
            return {
              id: `gx-${idx}`,
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
            id: `gy-${idx}`,
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

      const runSnap = (obj) => {
        if (!obj || !isEditableObject(obj)) {
          clearGuides();
          setDistanceHint(null);
          return;
        }

        const snapInput = getSnapPoints({
          movingObject: obj,
          canvas: c,
          clipBounds: { clipX, clipY, clipW, clipH },
        });
        const snapResult = detectSnap({
          sourcePoints: snapInput?.sourcePoints,
          targetsX: snapInput?.targetsX || [],
          targetsY: snapInput?.targetsY || [],
          threshold: 6,
        });
        applySnap({
          object: obj,
          snapResult,
          magneticStrength: 0.8,
        });
        lastSnapResultRef.current = snapResult;

        if (Number.isFinite(snapResult.distance)) {
          setDistanceHint(Math.max(1, Math.round(snapResult.distance)));
        } else {
          setDistanceHint(null);
        }

        const currentRect = obj.getBoundingRect(true, true);
        const currentCenterX = currentRect.left + currentRect.width / 2;
        const currentCenterY = currentRect.top + currentRect.height / 2;
        const centerX = clipX + clipW / 2;
        const centerY = clipY + clipH / 2;
        const nearCenterX = Math.abs(currentCenterX - centerX) <= 48;
        const nearCenterY = Math.abs(currentCenterY - centerY) <= 48;

        const spacingCandidates = c.getObjects()
          .filter((item) => item !== obj && isEditableObject(item) && item.visible !== false)
          .map((item) => item.getBoundingRect(true, true));
        const overlapY = (a, b) => Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
        const overlapX = (a, b) => Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
        const leftRects = spacingCandidates
          .filter((r) => (r.left + r.width) <= currentRect.left && overlapY(currentRect, r) > Math.min(currentRect.height, r.height) * 0.35)
          .sort((a, b) => (currentRect.left - (a.left + a.width)) - (currentRect.left - (b.left + b.width)));
        const rightRects = spacingCandidates
          .filter((r) => r.left >= (currentRect.left + currentRect.width) && overlapY(currentRect, r) > Math.min(currentRect.height, r.height) * 0.35)
          .sort((a, b) => (a.left - (currentRect.left + currentRect.width)) - (b.left - (currentRect.left + currentRect.width)));
        const topRects = spacingCandidates
          .filter((r) => (r.top + r.height) <= currentRect.top && overlapX(currentRect, r) > Math.min(currentRect.width, r.width) * 0.35)
          .sort((a, b) => (currentRect.top - (a.top + a.height)) - (currentRect.top - (b.top + b.height)));
        const bottomRects = spacingCandidates
          .filter((r) => r.top >= (currentRect.top + currentRect.height) && overlapX(currentRect, r) > Math.min(currentRect.width, r.width) * 0.35)
          .sort((a, b) => (a.top - (currentRect.top + currentRect.height)) - (b.top - (currentRect.top + currentRect.height)));

        const spacingThreshold = 4;
        let spacingGuide = null;
        if (leftRects[0] && rightRects[0]) {
          const leftGap = currentRect.left - (leftRects[0].left + leftRects[0].width);
          const rightGap = rightRects[0].left - (currentRect.left + currentRect.width);
          if (leftGap > 0 && rightGap > 0 && Math.abs(leftGap - rightGap) <= spacingThreshold) {
            const y = currentRect.top + currentRect.height / 2;
            const avgGap = Math.round((leftGap + rightGap) / 2);
            spacingGuide = {
              hint: `Khoảng cách đều • ${avgGap}px`,
              guides: [
                { axis: 'y', from: leftRects[0].left + leftRects[0].width, to: currentRect.left, value: y, kind: 'spacing', label: `${avgGap}px` },
                { axis: 'y', from: currentRect.left + currentRect.width, to: rightRects[0].left, value: y, kind: 'spacing', label: `${avgGap}px` },
              ],
            };
          }
        }
        if (!spacingGuide && topRects[0] && bottomRects[0]) {
          const topGap = currentRect.top - (topRects[0].top + topRects[0].height);
          const bottomGap = bottomRects[0].top - (currentRect.top + currentRect.height);
          if (topGap > 0 && bottomGap > 0 && Math.abs(topGap - bottomGap) <= spacingThreshold) {
            const x = currentRect.left + currentRect.width / 2;
            const avgGap = Math.round((topGap + bottomGap) / 2);
            spacingGuide = {
              hint: `Khoảng cách đều • ${avgGap}px`,
              guides: [
                { axis: 'x', from: topRects[0].top + topRects[0].height, to: currentRect.top, value: x, kind: 'spacing', label: `${avgGap}px` },
                { axis: 'x', from: currentRect.top + currentRect.height, to: bottomRects[0].top, value: x, kind: 'spacing', label: `${avgGap}px` },
              ],
            };
          }
        }

        if (spacingGuide) {
          setAutoAlignHint(`💡 ${spacingGuide.hint}`);
          renderGuides([...snapResult.guides, ...spacingGuide.guides]);
          return;
        }

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

        };

        const getSnapshotSafe = () => {
          try {
            // ưu tiên state
            if (state?.designSnapshot) {
              const parsed = JSON.parse(state.designSnapshot);

              // 🔥 BONUS FIX: check đúng template
              if (parsed.templateId === Number(templateId)) {
                return parsed;
              }
            }

            // fallback localStorage
            const key = `designSnapshot_${templateId}`;
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const parsed = JSON.parse(raw);

            if (parsed.templateId === Number(templateId)) {
              return parsed;
            }

            return null;
          } catch {
            return null;
          }
        };

        const snapshotSafe = getSnapshotSafe();

        const saved =
          designStore[currentSide] ||
          snapshotSafe?.[currentSide] ||
          null;

        if (saved && Object.keys(saved).length > 0) {
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
        const finalSnap = lastSnapResultRef.current;
        if (e?.target && finalSnap && (finalSnap.snapX || finalSnap.snapY)) {
          applySnap({
            object: e.target,
            snapResult: finalSnap,
            magneticStrength: 1,
          });
        }
        lastSnapResultRef.current = null;
        clearGuides();
        setDistanceHint(null);
        setAutoAlignHint('');
        clearDraggingVisual(e.target);
        clampToClip(e.target);
        syncLayers(c);
        if (historyReady) pushHistory(c);
      };
      const onMoving = (e) => {
        if (disposed) return;
        const obj = e.target;
        if (!obj) return;
        pendingMoveTargetRef.current = obj;
        if (moveRafRef.current) return;
        moveRafRef.current = requestAnimationFrame(() => {
          moveRafRef.current = null;
          const activeTarget = pendingMoveTargetRef.current;
          pendingMoveTargetRef.current = null;
          if (!activeTarget || disposed) return;
          applyDraggingVisual(activeTarget);
          runSnap(activeTarget);
          clampToClip(activeTarget);
          c.requestRenderAll();
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
        clearGuides();
        setDistanceHint(null);
        setAutoAlignHint('');
        lastSnapResultRef.current = null;
        clearDraggingVisual(c.getActiveObject());
        c.requestRenderAll();
      };
      const onMouseWheel = (opt) => {
        if (disposed) return;
        const delta = opt.e.deltaY;
        smoothZoomTo(zoomValueRef.current - delta * 0.05);
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
        setDistanceHint(null);
        setAutoAlignHint('');
        syncSelectionState(null);
        syncLayers(c);
      };
      c.on('selection:created', onSelectionCreated);
      c.on('selection:updated', onSelectionUpdated);
      c.on('selection:cleared', onSelectionCleared);
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
      if (c.getObjects().length > 0) {
        designStore[currentSide] = exportCanvasJson(c);
      }
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
    getSnapPoints,
    handleRedo,
    handleUndo,
    initHistoryForCurrentSide,
    isEditableObject,
    detectSnap,
    applySnap,
    pushHistory,
    setContextMenu,
    smoothZoomTo,
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

  const isTextObject = activeObjectInfo?.type === 'i-text';
  const isImageObject = activeObjectInfo?.type === 'image';
  const isShapeObject = Boolean(activeObjectInfo) && !isTextObject && !isImageObject;
  const activeFillColor = activeObjectInfo?.fill || textProps?.fill || '#111827';
  const activeBorderColor = activeObjectInfo?.stroke || 'transparent';
  const gridSpacing = 40;
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
        <main className="design-canvas-wrap">
          <div className="app-bg" />
          <div className="app-grid-wrap">
            <InteractiveGridPattern
              className="app-grid grid-fade"
              spacing={gridSpacing}
              dotColor={
                themeMode === 'dark'
                  ? 'rgba(34, 197, 94, 0.22)'
                  : 'rgba(15, 23, 42, 0.12)'
              }
              glowColor={
                themeMode === 'dark'
                  ? 'rgba(34, 197, 94, 0.26)'
                  : 'rgba(34, 197, 94, 0.16)'
              }
              glowRadius={themeMode === 'dark' ? 560 : 420}
              gridOpacity={themeMode === 'dark' ? 0.46 : 0.3}
              vignetteOpacity={0}
            />
          </div>
          {themeMode === 'dark' ? (
            <div className="webgl-bg-wrap">
              <WebGLBackground themeMode={themeMode} />
            </div>
          ) : null}
          <div className="grid-overlay" />
          <div className="app-ambient" />
          <Topbar
            templateName={template.name}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onPreview={goToPreview}
            onOrder={goToOrder}
            onBack={() => navigate('/custom-bag')}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />

          <div className="design-body">
            <FloatingToolbar
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
              toolbarPosition={floatingToolbarPos}
              onOpenDesignTab={setActiveTab}
            />
            <div className="snap-guides-overlay" aria-hidden="true">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className={`snap-guide ${guide.axis === 'x' ? 'snap-guide--v' : 'snap-guide--h'}${guide.kind === 'spacing' ? ' snap-guide--spacing' : ''}`}
                  style={guide.axis === 'x'
                    ? {
                      left: `${guide.left}px`,
                      top: `${guide.top}px`,
                      height: `${guide.length}px`,
                    }
                    : {
                      left: `${guide.left}px`,
                      top: `${guide.top}px`,
                      width: `${guide.length}px`,
                    }}
                >
                  {guide.label ? (
                    <span className="snap-guide-label">
                      {guide.label}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            {distanceHint !== null && (
              <div className="distance-hint">↔ {distanceHint}px</div>
            )}
            {aiHint ? <div className="ai-hint">{aiHint}</div> : null}

            <LeftPanel
              activeTab={activeTab}
              leftSidebarWidth={leftSidebarWidth}
              setActiveTab={setActiveTab}
              addText={addText}
              addTextPreset={addTextPreset}
              textPresets={TEXT_PRESETS}
              addImage={addImage}
              greenAiPanel={(
                <GreenAiPanelPremium
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
                <GreenQrPanelPremium
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
              startResizePanel={startResizePanel}
              activeObjectInfo={activeObjectInfo}
              activeFillColor={activeFillColor}
              activeBorderColor={activeBorderColor}
              updateActiveObjectStyle={updateActiveObjectStyle}
              textProps={textProps}
              updateTextProp={updateTextProp}
            />

            <aside className="design-product-panel">
              <div className="design-product-panel__head">
                <div>
                  <span className="design-product-panel__eyebrow">Template</span>
                  <strong>{template.name}</strong>
                </div>
                <span className="design-product-panel__badge">{side === 'front' ? 'Mặt trước' : 'Mặt sau'}</span>
              </div>

              <div className="design-product-panel__grid">
                <button
                  type="button"
                  className={`design-product-panel__card${side === 'front' ? ' is-active' : ''}`}
                  onClick={() => switchSide('front')}
                >
                  <div className="design-product-panel__thumb">
                    <img src={template.frontImageUrl} alt={`${template.name} mặt trước`} />
                  </div>
                  <span>Mặt trước</span>
                </button>

                <button
                  type="button"
                  className={`design-product-panel__card${side === 'back' ? ' is-active' : ''}`}
                  onClick={() => switchSide('back')}
                >
                  <div className="design-product-panel__thumb">
                    <img src={template.backImageUrl || template.frontImageUrl} alt={`${template.name} mặt sau`} />
                  </div>
                  <span>Mặt sau</span>
                </button>
              </div>
            </aside>

            <div className="design-canvas-container">
              <div className="design-canvas-inner">
                <canvas id="design-canvas" />
              </div>
            </div>
            <Dock className="design-zoom-bar" itemSize={30} magnification={1.2} distance={90}>
              <DockItem enableScale={false}>
                <button className="dock-item-btn" onClick={() => smoothZoomTo(zoomValueRef.current - 10)}>−</button>
              </DockItem>
              <DockItem className="dock-item--slider" enableScale={false}>
                <Slider
                  min={50}
                  max={300}
                  value={zoom}
                  onChange={smoothZoomTo}
                  className="design-zoom-slider"
                  tooltip={{ formatter: (v) => `${v}%` }}
                />
              </DockItem>
              <DockItem enableScale={false}>
                <button className="dock-item-btn" onClick={() => smoothZoomTo(zoomValueRef.current + 10)}>+</button>
              </DockItem>
              <DockItem className="dock-item--zoom-label" enableScale={false}>
                <span className="design-zoom-label">{zoom}%</span>
              </DockItem>
            </Dock>
          </div>
        </main>

        {activeObjectInfo && floatingObjectMenuPos && (
          <Dock
            className="object-mini-menu"
            style={{ left: floatingObjectMenuPos.x, top: floatingObjectMenuPos.y }}
            itemSize={32}
            magnification={1.3}
            distance={110}
          >
            <Tooltip title="AI"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={() => setActiveTab('greenai')}><span className="material-symbols-rounded">auto_awesome</span></button></DockItem></Tooltip>
            <Tooltip title="Khóa / Mở khóa"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={() => {
              const obj = fabricRef.current?.getActiveObject();
              if (!obj?.dataId) return;
              toggleLayerLock(obj.dataId);
            }}><span className="material-symbols-rounded">lock</span></button></DockItem></Tooltip>
            <Tooltip title="Nhân đôi"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={duplicateActiveObject}><span className="material-symbols-rounded">content_copy</span></button></DockItem></Tooltip>
            <Tooltip title="Xóa"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={deleteActiveObject}><span className="material-symbols-rounded">delete</span></button></DockItem></Tooltip>
            <Tooltip title="Thêm tùy chọn"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={() => setShowLayerOverlay((v) => !v)}>...</button></DockItem></Tooltip>
          </Dock>
        )}

        {showLayerOverlay && (
          <div className="layer-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="layer-overlay-head">
              <span>Lớp</span>
              <button type="button" onClick={() => setShowLayerOverlay(false)}>✕</button>
            </div>
            {layers.length === 0 ? (
              <p className="design-layer-empty">Chưa có đối tượng.</p>
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
                      <button type="button" title="Đưa lên trên cùng" onClick={() => moveLayer(layer.id, 'top')}><span className="material-symbols-rounded">vertical_align_top</span></button>
                      <button type="button" title="Đưa lên" onClick={() => moveLayer(layer.id, 'up')}><span className="material-symbols-rounded">keyboard_arrow_up</span></button>
                      <button type="button" title="Đưa xuống" onClick={() => moveLayer(layer.id, 'down')}><span className="material-symbols-rounded">keyboard_arrow_down</span></button>
                      <button type="button" title="Đưa xuống dưới cùng" onClick={() => moveLayer(layer.id, 'bottom')}><span className="material-symbols-rounded">vertical_align_bottom</span></button>
                      <button type="button" title="Hiện/ẩn" onClick={() => toggleLayerVisibility(layer.id)}>{layer.visible ? <span className="material-symbols-rounded">visibility</span> : <span className="material-symbols-rounded">visibility_off</span>}</button>
                      <button type="button" title="Khóa" onClick={() => toggleLayerLock(layer.id)}>{layer.locked ? <span className="material-symbols-rounded">lock</span> : <span className="material-symbols-rounded">lock_open</span>}</button>
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
            <button type="button" onClick={() => handleContextAction('select')}>Chọn lớp</button>
            <button type="button" onClick={() => handleContextAction('duplicate')}>Nhân đôi</button>
            <button type="button" onClick={() => handleContextAction('align-center')}>Căn giữa ngang</button>
            <button type="button" onClick={() => handleContextAction('align-middle')}>Căn giữa dọc</button>
            <button type="button" onClick={() => handleContextAction('align-selection-left')}>Canh trái nhóm</button>
            <button type="button" onClick={() => handleContextAction('align-selection-center')}>Canh giữa nhóm</button>
            <button type="button" onClick={() => handleContextAction('distribute-x')}>Giãn đều ngang</button>
            <button type="button" className="danger" onClick={() => handleContextAction('delete')}>Xóa</button>
          </div>
        )}
      </div>
    </ConfigProvider >
  );
}
