import React, { useEffect, useRef, useState, useCallback, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button, Upload, message, Slider, Select, Input } from 'antd';
import { FontSizeOutlined, PictureOutlined, AppstoreOutlined, BgColorsOutlined, UndoOutlined, RedoOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
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
import { generateBagDesign } from '../services/ai';
import { loadAiGenerated, addAiGenerated, removeAiGenerated } from '../utils/aiGeneratedStorage';
import QRCode from 'qrcode';
import './DesignPage.css';

const CANVAS_SIZE = 680;
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

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
  { Icon: PiCheck, label: 'Check' },
  { Icon: PiPlus, label: 'Cộng' },
  { Icon: PiGift, label: 'Quà' },
  { Icon: PiCake, label: 'Bánh' },
  { Icon: PiCoffee, label: 'Cà phê' },
  { Icon: PiPizza, label: 'Pizza' },
  { Icon: PiHamburger, label: 'Hamburger' },
  { Icon: PiCookie, label: 'Cookie' },
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
  { Icon: PiSailboat, label: 'Thuyền' },
  { Icon: PiFlag, label: 'Cờ' },
  { Icon: PiTrophy, label: 'Cúp' },
  { Icon: PiMedal, label: 'Huy chương' },
  { Icon: PiCrown, label: 'Vương miện' },
  { Icon: PiDiamond, label: 'Kim cương' },
  { Icon: PiDiamondsFour, label: 'Bốn ô' },
  { Icon: PiSmiley, label: 'Mặt cười' },
  { Icon: PiSmileyWink, label: 'Mặt nháy mắt' },
  { Icon: PiThumbsUp, label: 'Like' },
  { Icon: PiThumbsDown, label: 'Dislike' },
  { Icon: PiCircle, label: 'Hình tròn' },
  { Icon: PiSquare, label: 'Hình vuông' },
  { Icon: PiHexagon, label: 'Lục giác' },
  { Icon: PiTriangle, label: 'Tam giác' },
  { Icon: PiUser, label: 'Người' },
  { Icon: PiUsers, label: 'Nhóm người' },
  { Icon: PiVideoCamera, label: 'Video' },
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

export default function DesignPage() {
  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const fabricRef = useRef(null);
  const clipBoundsRef = useRef(null); // { clipX, clipY, clipW, clipH }
  const clipSideRef = useRef('front'); // side tương ứng với clipBoundsRef
  const bgRectRef = useRef(null);     // fabric.Rect for edit-area background fill
  const [template, setTemplate] = useState(null);
  const [textures, setTextures] = useState([]);
  const [side, setSide] = useState('front');
  const designRef = useRef({ front: null, back: null });
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState(null);
  const [bgColor, setBgColorState] = useState('#ffffff');
  const [textProps, setTextProps] = useState(null); // { fontFamily, fontSize, fill, fontWeight, fontStyle, charSpacing } khi chọn text
  const selectedTextRef = useRef(null);
  const [greenAiPrompt, setGreenAiPrompt] = useState('');
  const [greenAiGenerating, setGreenAiGenerating] = useState(false);
  const [greenAiImageDataUrl, setGreenAiImageDataUrl] = useState(null);
  const [greenAiError, setGreenAiError] = useState(null);
  const [savedAiItems, setSavedAiItems] = useState([]);
  const [canvasSideReady, setCanvasSideReady] = useState(null);
  const [pendingFrontAiImageDataUrl, setPendingFrontAiImageDataUrl] = useState(null);
  const [pendingBackAiImageDataUrl, setPendingBackAiImageDataUrl] = useState(null);
  const [greenQrMode, setGreenQrMode] = useState('tts'); // 'tts' | 'audio'
  const [greenQrText, setGreenQrText] = useState('');
  const [greenQrAudioFile, setGreenQrAudioFile] = useState(null);
  const [greenQrColor, setGreenQrColor] = useState('#16a34a');
  const [greenQrGenerating, setGreenQrGenerating] = useState(false);
  const [greenQrRecordedFile, setGreenQrRecordedFile] = useState(null);
  const [greenQrRecordedUrl, setGreenQrRecordedUrl] = useState(null);
  const [greenQrRecording, setGreenQrRecording] = useState(false);
  const [greenQrRecordSeconds, setGreenQrRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const recordMimeRef = useRef('');

  const cleanupRecorder = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    recordChunksRef.current = [];
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;
    }
    recordMimeRef.current = '';
    setGreenQrRecording(false);
    setGreenQrRecordSeconds(0);
  }, []);

  const clearRecordedAudio = useCallback(() => {
    setGreenQrRecordedFile(null);
    setGreenQrRecordedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const fmtMmSs = (totalSeconds) => {
    const s = Math.max(0, Number(totalSeconds || 0));
    const mm = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${mm}:${String(ss).padStart(2, '0')}`;
  };

  const pickSupportedRecordMime = () => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    const MR = window?.MediaRecorder;
    if (!MR || typeof MR.isTypeSupported !== 'function') return '';
    return candidates.find((t) => MR.isTypeSupported(t)) || '';
  };

  const startGreenQrRecording = useCallback(async () => {
    if (greenQrRecording) return;
    if (!navigator?.mediaDevices?.getUserMedia) {
      message.error('Trình duyệt không hỗ trợ ghi âm (getUserMedia).');
      return;
    }
    if (!window?.MediaRecorder) {
      message.error('Trình duyệt không hỗ trợ ghi âm (MediaRecorder).');
      return;
    }

    // Nếu đang chọn upload file thì reset để ưu tiên bản ghi mới
    setGreenQrAudioFile(null);
    clearRecordedAudio();
    setGreenQrRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = pickSupportedRecordMime();
      recordMimeRef.current = mimeType || '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      recordChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e?.data && e.data.size > 0) recordChunksRef.current.push(e.data);
      };

      mr.onerror = () => {
        message.error('Ghi âm bị lỗi. Vui lòng thử lại.');
        cleanupRecorder();
      };

      mr.onstop = () => {
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }

        const chunks = recordChunksRef.current || [];
        recordChunksRef.current = [];
        const type = recordMimeRef.current || (chunks[0]?.type || '');
        const blob = new Blob(chunks, type ? { type } : undefined);
        if (!blob || blob.size === 0) {
          message.warning('Không có dữ liệu ghi âm.');
          cleanupRecorder();
          return;
        }
        if (blob.size > MAX_AUDIO_BYTES) {
          message.error('Bản ghi vượt quá 5MB. Vui lòng ghi ngắn hơn.');
          cleanupRecorder();
          return;
        }

        const ext = (type || '').includes('ogg') ? 'ogg' : 'webm';
        const file = new File([blob], `recording.${ext}`, { type: type || 'audio/webm' });
        const url = URL.createObjectURL(blob);

        setGreenQrRecordedFile(file);
        setGreenQrRecordedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        cleanupRecorder();
      };

      setGreenQrRecording(true);
      recordTimerRef.current = setInterval(() => setGreenQrRecordSeconds((s) => s + 1), 1000);
      mr.start(250);
    } catch {
      message.error('Không thể truy cập micro. Vui lòng cấp quyền và thử lại.');
      cleanupRecorder();
    }
  }, [clearRecordedAudio, cleanupRecorder, greenQrRecording]);

  const stopGreenQrRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr) {
      cleanupRecorder();
      return;
    }
    try {
      if (mr.state !== 'inactive') mr.stop();
    } catch {
      cleanupRecorder();
    }
  }, [cleanupRecorder]);

  useEffect(() => {
    return () => {
      cleanupRecorder();
      setGreenQrRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [cleanupRecorder]);

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

  useEffect(() => {
    loadAiGenerated().then(setSavedAiItems);
  }, []);

  useEffect(() => {
    if (!template || loading) return;
    let disposed = false;
    const c = new fabric.Canvas('design-canvas', { width: CANVAS_SIZE, height: CANVAS_SIZE });
    fabricRef.current = c;

    // Khai báo ở scope ngoài để cleanup có thể truy cập
    const onKeyDown = (e) => {
      if (disposed) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const active = c.getActiveObject();
      if (!active) return;
      if (active.type === 'i-text' && active.isEditing) return;
      if (active.name === '__bgRect__' || active.excludeFromExport) return;
      c.remove(active);
      c.discardActiveObject();
      c.requestRenderAll();
    };
    document.addEventListener('keydown', onKeyDown);

    /* Nhỏ gọn nút kéo/resize */
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

      // x, y, width, height là % theo ẢNH (như ImageAreaSelector),
      // nên quy về toạ độ theo ảnh đã scale & căn giữa
      const clipX = imgLeft + (scaledW * x) / 100;
      const clipY = imgTop + (scaledH * y) / 100;
      const clipW = (scaledW * width) / 100;
      const clipH = (scaledH * height) / 100;

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
          });
          c.add(guideRect);
          guideRect.bringToFront();
        };

        const saved = designRef.current[side];
        if (saved) {
          c.loadFromJSON(saved, () => {
            if (disposed) return;
            // Remove any old bgRect loaded from JSON (we recreate it)
            c.getObjects().forEach((o) => { if (o.name === '__bgRect__') c.remove(o); });
            createGuide();
            c.forEachObject((o) => { o.set({ cornerSize: 8, padding: 0 }); clampToClip(o); });
            c.renderAll();
          });
        } else {
          createGuide();
          c.renderAll();
        }
      });

      const onAdded = (e) => {
        if (disposed) return;
        const obj = e.target;
        obj.set({ cornerSize: 8, padding: 0 });
        clampToClip(obj);
      };
      const onModified = (e) => {
        if (disposed) return;
        clampToClip(e.target);
      };
      const onMoving = (e) => {
        if (disposed) return;
        clampToClip(e.target);
      };
      const onScaling = (e) => {
        if (disposed) return;
        clampToClip(e.target);
      };

      c.on('object:added', onAdded);
      c.on('object:modified', onModified);
      c.on('object:moving', onMoving);
      c.on('object:scaling', onScaling);

      // kéo canvas như scroll (pan view)
      const onMouseDown = (opt) => {
        if (disposed) return;
        if (opt.target) return; // đang kéo object thì không pan
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
      };

      c.on('mouse:down', onMouseDown);
      c.on('mouse:move', onMouseMove);
      c.on('mouse:up', onMouseUp);

      // Khi chọn object → nếu là text, hiện panel edit
      const syncTextProps = (obj) => {
        if (disposed) return;
        if (!obj || obj.type !== 'i-text') {
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
          charSpacing: obj.charSpacing || 0,
          curveType: obj.curveType || (obj.path ? 'arcUp' : 'none'),
        });
        setActiveTab('text');
      };
      const onSelectionCreated = (e) => { syncTextProps(e.selected?.[0]); };
      const onSelectionUpdated = (e) => { syncTextProps(e.selected?.[0]); };
      const onSelectionCleared = () => {
        if (disposed) return;
        selectedTextRef.current = null;
        setTextProps(null);
      };
      c.on('selection:created', onSelectionCreated);
      c.on('selection:updated', onSelectionUpdated);
      c.on('selection:cleared', onSelectionCleared);
    });

    return () => {
      disposed = true;
      selectedTextRef.current = null;
      setTextProps(null);
      designRef.current[side] = c.toJSON();
      c.off();
      document.removeEventListener('keydown', onKeyDown);
      fabric.Object.prototype.cornerSize = origCornerSize;
      fabric.Object.prototype.padding = origPadding;
      c.dispose();
    };
  }, [template, side, loading]);

  useEffect(() => {
    if (fabricRef.current) {
      const c = fabricRef.current;
      c.zoomToPoint(new fabric.Point(CANVAS_SIZE / 2, CANVAS_SIZE / 2), zoom / 100);
      c.requestRenderAll();
    }
  }, [zoom]);


  const saveAndSwitch = () => {
    if (fabricRef.current) {
      designRef.current[side] = fabricRef.current.toJSON();
    }
  };

  const applyBgColor = (color) => {
    setBgColorState(color);
    if (!fabricRef.current || !bgRectRef.current) return;
    bgRectRef.current.set({ fill: color });
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

    if (key === 'fontFamily') {
      const fontSize = obj.fontSize || 24;
      document.fonts.load(`${fontSize}px "${value}"`).then(() => {
        obj.set('fontFamily', value);
        if (typeof obj.initDimensions === 'function') obj.initDimensions();
        fabricRef.current?.requestRenderAll();
        setTextProps((p) => (p ? { ...p, [key]: value } : null));
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
    fabricRef.current.requestRenderAll();
    setTextProps((p) => (p ? { ...p, [key]: value } : null));
  }, []);

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

  const toBase64UrlUtf8 = (text) =>
    btoa(unescape(encodeURIComponent(text)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const uploadGreenAudio = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/api/v1/audio/upload`, { method: 'POST', body: fd });
    let data = null;
    try { data = await res.json(); } catch {
      // ignore non-json error body
    }
    if (!res.ok) {
      const msg = data?.message || 'Không thể upload audio. Vui lòng thử lại.';
      throw new Error(msg);
    }
    if (!data?.id) throw new Error('Upload thành công nhưng thiếu id.');
    return data.id;
  };

  const generateGreenQr = useCallback(async () => {
    setGreenQrGenerating(true);
    try {
      let url = '';
      if (greenQrMode === 'audio') {
        const f = greenQrRecordedFile || greenQrAudioFile;
        if (!f) {
          message.warning('Vui lòng chọn file audio hoặc ghi âm (tối đa 5MB).');
          return;
        }
        if (f.size > MAX_AUDIO_BYTES) {
          message.error('File audio vượt quá 5MB.');
          return;
        }
        if (!String(f.type || '').toLowerCase().startsWith('audio/')) {
          message.error('Chỉ hỗ trợ file audio (audio/*).');
          return;
        }
        const id = await uploadGreenAudio(f);
        url = `${window.location.origin}/audio-file/${id}`;
      } else {
        const text = (greenQrText || '').trim();
        if (!text) {
          message.warning('Vui lòng nhập nội dung để tạo QR.');
          return;
        }
        const base64url = toBase64UrlUtf8(text);
        url = `${window.location.origin}/tts/${base64url}`;
      }

      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, url, {
        width: size,
        margin: 2,
        color: {
          dark: greenQrColor || '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const cx = size / 2;
        const cy = size / 2;
        const boxSize = size * 0.32;
        const half = boxSize / 2;

        ctx.fillStyle = '#ffffff';
        const radius = boxSize * 0.2;
        ctx.beginPath();
        ctx.moveTo(cx - half + radius, cy - half);
        ctx.lineTo(cx + half - radius, cy - half);
        ctx.quadraticCurveTo(cx + half, cy - half, cx + half, cy - half + radius);
        ctx.lineTo(cx + half, cy + half - radius);
        ctx.quadraticCurveTo(cx + half, cy + half, cx + half - radius, cy + half);
        ctx.lineTo(cx - half + radius, cy + half);
        ctx.quadraticCurveTo(cx - half, cy + half, cx - half, cy + half - radius);
        ctx.lineTo(cx - half, cy - half + radius);
        ctx.quadraticCurveTo(cx - half, cy - half, cx - half + radius, cy - half);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = greenQrColor || '#16a34a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        const waveLeft = cx - half * 0.8;
        const waveRight = cx + half * 0.8;
        const midY = cy;
        ctx.moveTo(waveLeft, midY);
        ctx.lineTo(cx - half * 0.3, midY);
        ctx.lineTo(cx - half * 0.15, midY - half * 0.4);
        ctx.lineTo(cx, midY + half * 0.3);
        ctx.lineTo(cx + half * 0.2, midY - half * 0.5);
        ctx.lineTo(cx + half * 0.4, midY);
        ctx.lineTo(waveRight, midY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(22,163,74,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, boxSize * 0.7, -Math.PI / 3, Math.PI * 4 / 3);
        ctx.stroke();
      }

      const dataUrl = canvas.toDataURL('image/png');
      addImageFromDataUrl(dataUrl);
      message.success('Đã thêm QR Green vào thiết kế');
    } catch (e) {
      message.error(e?.message || 'Không thể tạo QR. Vui lòng thử lại.');
    } finally {
      setGreenQrGenerating(false);
    }
  }, [greenQrMode, greenQrRecordedFile, greenQrAudioFile, greenQrText, greenQrColor, addImageFromDataUrl]);

  const handleGreenAiGenerate = useCallback(async () => {
    const prompt = (greenAiPrompt || '').trim();
    if (!prompt) {
      message.warning('Vui lòng nhập mô tả ảnh.');
      return;
    }
    setGreenAiError(null);
    setGreenAiImageDataUrl(null);
    setPendingFrontAiImageDataUrl(null);
    setPendingBackAiImageDataUrl(null);
    setGreenAiGenerating(true);
    try {
      const tplId = Number(templateId);
      if (!tplId || Number.isNaN(tplId)) {
        throw new Error('Thiếu thông tin mẫu túi để tạo thiết kế AI.');
      }
      const data = await generateBagDesign({
        prompt,
        templateId: tplId,
        generateFront: true,
        generateBack: true,
      });
      const frontDataUrl = data?.frontImageBase64
        ? `data:image/png;base64,${data.frontImageBase64}`
        : null;
      const backDataUrl = data?.backImageBase64
        ? `data:image/png;base64,${data.backImageBase64}`
        : null;

      // Lưu để hiển thị preview nhỏ (nếu muốn tái dùng logic cũ)
      setGreenAiImageDataUrl(frontDataUrl || backDataUrl || null);

      // Lưu vào IndexedDB để người dùng chọn lại sau
      await addAiGenerated({
        prompt,
        frontDataUrl: frontDataUrl || undefined,
        backDataUrl: backDataUrl || undefined,
      });
      setSavedAiItems(await loadAiGenerated());

      // Áp dụng cho mặt hiện tại và lưu patch cho mặt còn lại
      if (side === 'front') {
        if (frontDataUrl) {
          addImageToClipAreaFromDataUrl(frontDataUrl);
        } else if (backDataUrl) {
          addImageToClipAreaFromDataUrl(backDataUrl);
        }
        if (backDataUrl) {
          setPendingBackAiImageDataUrl(backDataUrl);
        }
      } else {
        if (backDataUrl) {
          addImageToClipAreaFromDataUrl(backDataUrl);
        } else if (frontDataUrl) {
          addImageToClipAreaFromDataUrl(frontDataUrl);
        }
        if (frontDataUrl) {
          setPendingFrontAiImageDataUrl(frontDataUrl);
        }
      }
    } catch (e) {
      setGreenAiError(e.message || 'Không thể tạo thiết kế túi bằng AI');
    } finally {
      setGreenAiGenerating(false);
    }
  }, [greenAiPrompt, templateId, side, addImageToClipAreaFromDataUrl]);

  // Khi canvas cho mặt hiện tại đã sẵn sàng và có patch pending, tự chèn vào vùng custom
  useEffect(() => {
    if (!fabricRef.current || !clipBoundsRef.current) return;
    if (clipSideRef.current !== side) return;

    if (side === 'front' && pendingFrontAiImageDataUrl) {
      addImageToClipAreaFromDataUrl(pendingFrontAiImageDataUrl);
      setPendingFrontAiImageDataUrl(null);
    }
    if (side === 'back' && pendingBackAiImageDataUrl) {
      addImageToClipAreaFromDataUrl(pendingBackAiImageDataUrl);
      setPendingBackAiImageDataUrl(null);
    }
  }, [side, canvasSideReady, pendingFrontAiImageDataUrl, pendingBackAiImageDataUrl, addImageToClipAreaFromDataUrl]);

  const applySavedAiItem = useCallback(
    (item) => {
      const dataUrl = item.frontDataUrl || item.backDataUrl;
      if (!dataUrl) {
        message.warning('Thiết kế này không có ảnh.');
        return;
      }
      addImageToClipAreaFromDataUrl(dataUrl);
      message.success('Đã thêm thiết kế vào vùng in');
    },
    [addImageToClipAreaFromDataUrl]
  );

  const removeSavedAiItem = useCallback(async (id, e) => {
    e?.stopPropagation?.();
    await removeAiGenerated(id);
    setSavedAiItems(await loadAiGenerated());
    message.success('Đã xóa khỏi lịch sử');
  }, []);

  const buildSnapshot = () => {
    if (fabricRef.current) {
      designRef.current[side] = fabricRef.current.toJSON();
    }
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

  if (loading || !template) {
    return <div className="design-page"><div className="design-loading">Đang tải...</div></div>;
  }

  return (
    <div className="design-page">
      {/* ── Top bar ── */}
      <header className="design-topbar">
        <div className="design-topbar-left">
          <button className="design-back-btn" onClick={() => navigate('/custom-bag')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          <div className="design-topbar-meta">
            <span className="design-topbar-name">{template.name}</span>
            <span className="design-topbar-saved">
              <span className="saved-dot" />
              Đã lưu
            </span>
          </div>
        </div>

        <div className="design-topbar-center">
          <button className="design-tabnav active">Design</button>
          <button className="design-tabnav" onClick={goToOrder}>Order</button>
        </div>

        <div className="design-topbar-right">
          <button className="design-icon-btn" title="Undo" disabled><UndoOutlined /></button>
          <button className="design-icon-btn" title="Redo" disabled><RedoOutlined /></button>
          <div className="design-topbar-divider" />
          <button className="design-preview-ghost-btn" onClick={goToPreview}>
            <EyeOutlined /> Preview
          </button>
          <button className="design-next-btn" onClick={goToOrder}>
            Order →
          </button>
        </div>
      </header>

      <div className="design-body">
        <aside className="design-sidebar">
          {/* Icon tab bar */}
          <div className="design-tab-bar">
            {[
              { key: 'text',       icon: <FontSizeOutlined />,  label: 'Add Text'   },
              { key: 'image',      icon: <PictureOutlined />,   label: 'Add Image'  },
              { key: 'icon',       icon: <PiStar />,            label: 'Icon'       },
              { key: 'greenai',    icon: <PiSparkle />,         label: 'Green AI'   },
              { key: 'greenqr',    icon: <PiLeaf />,            label: 'Green QR'   },
              { key: 'background', icon: <BgColorsOutlined />,  label: 'Background' },
              { key: 'elements',   icon: <AppstoreOutlined />,  label: 'Elements'   },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                className={`design-tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(activeTab === key ? null : key)}
              >
                <span className="design-tab-icon">{icon}</span>
                <span className="design-tab-label">{label}</span>
              </button>
            ))}
          </div>

          {/* Sliding panel */}
          {activeTab && (
            <div className={`design-tab-panel${activeTab === 'greenai' ? ' design-tab-panel--wide' : ''}`}>
              <div className="design-tab-panel-header">
                <span>
                  {activeTab === 'text'       && 'Add text to your design'}
                  {activeTab === 'image'      && 'Add Image'}
                  {activeTab === 'icon'       && 'Icons'}
                  {activeTab === 'greenai'    && 'Green AI'}
                  {activeTab === 'greenqr'    && 'Green QR – Mã âm thanh xanh'}
                  {activeTab === 'background' && 'Background'}
                  {activeTab === 'elements'   && 'Elements'}
                </span>
                <button className="design-tab-panel-close" onClick={() => setActiveTab(null)}>✕</button>
              </div>

              {activeTab === 'text' && (
                <div className="design-tab-panel-body">
                  <p className="panel-hint">Click the button below to add text to your design</p>
                  <Button icon={<FontSizeOutlined />} block onClick={addText} className="panel-main-btn">
                    Add a text box
                  </Button>

                  {textProps && (
                    <div className="text-props-panel">
                      <p className="panel-section-title">Chỉnh sửa text đã chọn</p>

                      <label className="text-prop-row">
                        <span>Font</span>
                        <Select
                          value={textProps.fontFamily}
                          onChange={(v) => updateTextProp('fontFamily', v)}
                          options={FONT_OPTIONS}
                          style={{ width: '100%' }}
                          listHeight={320}
                          showSearch
                          optionFilterProp="label"
                          placeholder="Chọn font"
                        />
                      </label>

                      <label className="text-prop-row">
                        <span>Cỡ chữ</span>
                        <Input
                          type="number"
                          min={8}
                          max={200}
                          value={textProps.fontSize}
                          onChange={(e) => updateTextProp('fontSize', parseInt(e.target.value, 10) || 16)}
                        />
                      </label>

                      <label className="text-prop-row">
                        <span>Màu</span>
                        <div className="text-color-row">
                          <input
                            type="color"
                            value={textProps.fill}
                            onChange={(e) => updateTextProp('fill', e.target.value)}
                            className="text-color-picker"
                          />
                          <Input
                            value={textProps.fill}
                            onChange={(e) => updateTextProp('fill', e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </label>

                      <label className="text-prop-row">
                        <span>Đậm / Nghiêng</span>
                        <div className="text-style-btns">
                          <button
                            className={`text-style-btn${textProps.fontWeight === 'bold' ? ' active' : ''}`}
                            onClick={() => updateTextProp('fontWeight', textProps.fontWeight === 'bold' ? 'normal' : 'bold')}
                          >
                            B
                          </button>
                          <button
                            className={`text-style-btn${textProps.fontStyle === 'italic' ? ' active' : ''}`}
                            onClick={() => updateTextProp('fontStyle', textProps.fontStyle === 'italic' ? 'normal' : 'italic')}
                          >
                            I
                          </button>
                        </div>
                      </label>

                      <label className="text-prop-row">
                        <span>Letter spacing</span>
                        <Slider
                          min={-100}
                          max={200}
                          value={textProps.charSpacing}
                          onChange={(v) => updateTextProp('charSpacing', v)}
                        />
                      </label>

                      <label className="text-prop-row">
                        <span>Curve (cong chữ)</span>
                        <Select
                          value={textProps.curveType || 'none'}
                          onChange={(v) => updateTextProp('curveType', v)}
                          options={[
                            { value: 'none', label: 'Thẳng' },
                            { value: 'arcUp', label: 'Cong lên' },
                            { value: 'arcDown', label: 'Cong xuống' },
                            { value: 'wave', label: 'Sóng' },
                            { value: 'arcLeft', label: 'Cong trái' },
                            { value: 'arcRight', label: 'Cong phải' },
                          ]}
                          style={{ width: '100%' }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'image' && (
                <div className="design-tab-panel-body">
                  <Upload showUploadList={false} beforeUpload={(f) => { addImage(f); return false; }} accept="image/*">
                    <Button icon={<PictureOutlined />} block className="panel-main-btn">Thêm ảnh từ máy</Button>
                  </Upload>
                </div>
              )}

              {activeTab === 'greenai' && (
                <div className="design-tab-panel-body">
                  <p className="panel-hint">Nhập mô tả ảnh, AI sẽ tạo ảnh cho bạn (tối đa 20 ảnh/ngày toàn hệ thống).</p>
                  <Input.TextArea
                    placeholder="VD: Một bông hoa sen màu hồng trên nền xanh lá"
                    value={greenAiPrompt}
                    onChange={(e) => setGreenAiPrompt(e.target.value)}
                    rows={3}
                    className="green-ai-prompt-input"
                  />
                  <Button
                    type="primary"
                    block
                    loading={greenAiGenerating}
                    onClick={handleGreenAiGenerate}
                    className="panel-main-btn"
                  >
                    {greenAiGenerating ? 'Đang tạo ảnh...' : 'Tạo ảnh bằng AI'}
                  </Button>
                  {greenAiError && <p className="green-ai-error">{greenAiError}</p>}
                  {greenAiImageDataUrl && (
                    <div className="green-ai-result">
                      <img src={greenAiImageDataUrl} alt="AI generated" className="green-ai-preview-img" />
                      <p className="panel-hint">
                        Thiết kế AI đã được tự động gắn vào vùng in trên túi. Đã lưu vào lịch sử để chọn lại.
                      </p>
                    </div>
                  )}

                  {savedAiItems.length > 0 && (
                    <div className="green-ai-saved">
                      <p className="panel-section-title">Thiết kế đã lưu (chọn để thêm vào vùng in)</p>
                      <div className="green-ai-saved-grid">
                        {savedAiItems.map((item) => {
                          const thumbUrl = item.frontDataUrl || item.backDataUrl;
                          return (
                            <div
                              key={item.id}
                              className="green-ai-saved-item"
                              onClick={() => applySavedAiItem(item)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && applySavedAiItem(item)}
                            >
                              {thumbUrl ? (
                                <img src={thumbUrl} alt="" className="green-ai-saved-thumb" />
                              ) : (
                                <div className="green-ai-saved-thumb green-ai-saved-thumb--empty" />
                              )}
                              <span className="green-ai-saved-prompt" title={item.prompt}>
                                {item.prompt.length > 20 ? `${item.prompt.slice(0, 20)}…` : item.prompt}
                              </span>
                              <button
                                type="button"
                                className="green-ai-saved-delete"
                                onClick={(e) => removeSavedAiItem(item.id, e)}
                                aria-label="Xóa"
                              >
                                <DeleteOutlined />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'greenqr' && (
                <div className="design-tab-panel-body">
                  <p className="panel-hint">
                    Tạo mã QR âm thanh theo 2 cách: (1) Text → hệ thống đọc (TTS), (2) Upload file audio (≤ 5MB).
                  </p>

                  <div className="green-qr-color-row">
                    <span>Loại nội dung</span>
                    <Select
                      value={greenQrMode}
                      onChange={(v) => setGreenQrMode(v)}
                      style={{ width: '100%' }}
                      options={[
                        { value: 'tts', label: 'Text (TTS)' },
                        { value: 'audio', label: 'Upload audio (≤ 5MB)' },
                      ]}
                    />
                  </div>

                  {greenQrMode === 'tts' ? (
                    <Input.TextArea
                      rows={3}
                      placeholder="VD: Lời chúc sinh nhật, câu quote yêu thích..."
                      value={greenQrText}
                      onChange={(e) => setGreenQrText(e.target.value)}
                      className="green-qr-input"
                    />
                  ) : (
                    <div style={{ marginTop: 10 }}>
                      <Upload
                        showUploadList={false}
                        accept="audio/*"
                        beforeUpload={(f) => {
                          stopGreenQrRecording();
                          clearRecordedAudio();
                          setGreenQrAudioFile(f);
                          return false;
                        }}
                      >
                        <Button block className="panel-main-btn">
                          Chọn file audio
                        </Button>
                      </Upload>
                      {greenQrAudioFile && (
                        <p className="panel-hint" style={{ marginTop: 8 }}>
                          Đã chọn: <code>{greenQrAudioFile.name}</code> ({Math.round(greenQrAudioFile.size / 1024)} KB)
                        </p>
                      )}

                      <div className="green-qr-record">
                        <div className="green-qr-record-head">
                          <span>Hoặc ghi âm</span>
                          <span className={`green-qr-record-timer${greenQrRecording ? ' active' : ''}`}>
                            {fmtMmSs(greenQrRecordSeconds)}
                          </span>
                        </div>

                        <div className="green-qr-record-actions">
                          {!greenQrRecording ? (
                            <Button
                              block
                              onClick={startGreenQrRecording}
                              className="panel-main-btn green-qr-record-btn"
                              disabled={greenQrGenerating}
                            >
                              Bắt đầu ghi âm
                            </Button>
                          ) : (
                            <Button
                              danger
                              block
                              onClick={stopGreenQrRecording}
                              className="panel-main-btn green-qr-record-btn"
                            >
                              Dừng ghi âm
                            </Button>
                          )}
                        </div>

                        {greenQrRecordedUrl && (
                          <div className="green-qr-record-preview">
                            <audio controls src={greenQrRecordedUrl} style={{ width: '100%' }} />
                            <div className="green-qr-record-meta">
                              <span className="panel-hint" style={{ margin: 0 }}>
                                Bản ghi: <code>{greenQrRecordedFile?.name || 'recording'}</code>
                              </span>
                              <button
                                type="button"
                                className="green-qr-record-clear"
                                onClick={clearRecordedAudio}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="green-qr-color-row">
                    <span>Màu QR</span>
                    <div className="green-qr-color-controls">
                      <input
                        type="color"
                        value={greenQrColor}
                        onChange={(e) => setGreenQrColor(e.target.value)}
                      />
                      <Input
                        value={greenQrColor}
                        onChange={(e) => setGreenQrColor(e.target.value)}
                        style={{ maxWidth: 120 }}
                      />
                    </div>
                  </div>

                  <p className="panel-hint">
                    QR được thiết kế với nhịp sóng (heartbeat / waveform) ở giữa để gợi cảm giác âm thanh.
                  </p>

                  <Button
                    type="primary"
                    block
                    loading={greenQrGenerating}
                    onClick={generateGreenQr}
                    className="panel-main-btn"
                  >
                    {greenQrGenerating ? 'Đang tạo QR...' : 'Tạo QR Green Sound'}
                  </Button>
                </div>
              )}

              {activeTab === 'icon' && (
                <div className="design-tab-panel-body">
                  <p className="panel-hint">Chọn icon để thêm vào thiết kế</p>
                  <div className="icon-grid">
                    {ICON_LIST.map(({ Icon, label }, i) => (
                      <button
                        key={i}
                        type="button"
                        className="icon-grid-item"
                        onClick={() => addIconToCanvas(Icon)}
                        title={label}
                      >
                        <Icon size={28} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'background' && (
                <div className="design-tab-panel-body">
                  {/* Swatches */}
                  <p className="panel-section-title">Swatches</p>
                  <div className="swatch-grid">
                    {['#ffffff','#888888','#222222','#a8d8ea','#3b82f6','#7c3aed',
                      '#f9a8d4','#ec4899','#ef4444','#f97316','#92400e','#eab308'].map((c) => (
                      <button
                        key={c}
                        className={`swatch-dot${bgColor === c ? ' selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => applyBgColor(c)}
                      />
                    ))}
                  </div>

                  {/* Custom color */}
                  <p className="panel-section-title">Custom color</p>
                  <div className="custom-color-row">
                    <label className="custom-color-picker-wrap">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => applyBgColor(e.target.value)}
                        className="custom-color-input"
                      />
                    </label>
                    <span className="custom-color-hex">{bgColor.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {activeTab === 'elements' && (
                <div className="design-tab-panel-body">
                  {textures.length === 0
                    ? <p className="panel-hint">Chưa có elements nào.</p>
                    : (
                      <div className="texture-grid">
                        {textures.map((t) => (
                          <div key={t.id} className="texture-item" onClick={() => addTexture(t)}>
                            <img src={t.imageUrl} alt={t.name || ''} />
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              )}
            </div>
          )}
        </aside>
        <main className="design-canvas-wrap" key={side}>
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
        </main>

        {/* ── Right sidebar — mặt trước / mặt sau ── */}
        <aside className="design-right-bar">
          <div
            className={`design-side-thumb${side === 'front' ? ' active' : ''}`}
            onClick={() => { saveAndSwitch(); setSide('front'); }}
          >
            <div className="design-side-thumb-img">
              <img src={template.frontImageUrl} alt="Mặt trước" />
            </div>
            <span>Front</span>
          </div>
          <div
            className={`design-side-thumb${side === 'back' ? ' active' : ''}`}
            onClick={() => { saveAndSwitch(); setSide('back'); }}
          >
            <div className="design-side-thumb-img">
              <img src={template.backImageUrl} alt="Mặt sau" />
            </div>
            <span>Back</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
