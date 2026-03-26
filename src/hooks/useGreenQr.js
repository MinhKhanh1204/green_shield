import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import QRCode from 'qrcode';

const DEFAULT_MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export default function useGreenQr({
  apiBase,
  maxAudioBytes = DEFAULT_MAX_AUDIO_BYTES,
  addImageFromDataUrl,
}) {
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

  const fmtMmSs = useCallback((totalSeconds) => {
    const s = Math.max(0, Number(totalSeconds || 0));
    const mm = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${mm}:${String(ss).padStart(2, '0')}`;
  }, []);

  const pickSupportedRecordMime = useCallback(() => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    const MR = window?.MediaRecorder;
    if (!MR || typeof MR.isTypeSupported !== 'function') return '';
    return candidates.find((t) => MR.isTypeSupported(t)) || '';
  }, []);

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
        if (blob.size > maxAudioBytes) {
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
  }, [clearRecordedAudio, cleanupRecorder, greenQrRecording, maxAudioBytes, pickSupportedRecordMime]);

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

  const toBase64UrlUtf8 = useCallback((text) => {
    return btoa(unescape(encodeURIComponent(text)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }, []);

  const uploadGreenAudio = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${apiBase}/api/v1/audio/upload`, { method: 'POST', body: fd });
    let data = null;
    try {
      data = await res.json();
    } catch {
      // ignore non-json error body
    }
    if (!res.ok) {
      const msg = data?.message || 'Không thể upload audio. Vui lòng thử lại.';
      throw new Error(msg);
    }
    if (!data?.id) throw new Error('Upload thành công nhưng thiếu id.');
    return data.id;
  }, [apiBase]);

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
        if (f.size > maxAudioBytes) {
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
  }, [
    greenQrMode,
    greenQrRecordedFile,
    greenQrAudioFile,
    greenQrText,
    greenQrColor,
    maxAudioBytes,
    uploadGreenAudio,
    toBase64UrlUtf8,
    addImageFromDataUrl,
  ]);

  return {
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
  };
}
