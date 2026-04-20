import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AudioPage.css';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

function decodeBase64Url(code) {
  try {
    let s = code.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return '';
  }
}

const BARS = 40;

export default function AudioPage() {
  const { code } = useParams();
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('greenshield-theme') || 'dark';
  });
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const decodedText = useMemo(() => decodeBase64Url(code || ''), [code]);
  const title = decodedText || 'Green QR Sound';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.setAttribute('data-theme', themeMode);
    localStorage.setItem('greenshield-theme', themeMode);
    const timer = window.setTimeout(() => root.classList.remove('theme-transition'), 420);
    return () => window.clearTimeout(timer);
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const prepareAudio = async () => {
    if (!code) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/audio/${code}`);
      if (res.status === 429) throw new Error('Hệ thống đã đạt giới hạn phát âm thanh trong ngày. Vui lòng thử lại vào ngày mai.');
      if (!res.ok) throw new Error('Không thể chuẩn bị âm thanh. Vui lòng thử lại.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      return url;
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra khi phát âm thanh.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = async () => {
    if (!audioRef.current || loading) return;
    if (playing) {
      audioRef.current.pause();
      return;
    }
    const url = audioUrl || await prepareAudio();
    if (!url) return;
    audioRef.current.play();
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress(audioRef.current.currentTime / audioRef.current.duration);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * audioRef.current.duration;
    setProgress(ratio);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const fmt = (s) => {
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return '0:00';
    return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
  };

  return (
    <div className="ap-root">
      <div className="ap-blob ap-blob--a bg-ambient" />
      <div className="ap-blob ap-blob--b bg-ambient" />
      <div className="ap-blob ap-blob--c bg-ambient" />

      <Link to="/" className="ap-logo">
        <span className="ap-logo-dot" />
        GreenShield
      </Link>
      <button
        type="button"
        className="ap-theme-toggle"
        onClick={handleToggleTheme}
        aria-label={themeMode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      >
        {themeMode === 'dark' ? '☀️ Sáng' : '🌙 Tối'}
      </button>

      <div className="ap-card glass-card">
        <div className="ap-artwork" aria-hidden="true">
          <div className="ap-artwork-ring ap-artwork-ring--outer" />
          <div className="ap-artwork-ring ap-artwork-ring--mid" />

          <button
            className={`ap-center-btn${playing ? ' playing' : ''}${loading ? ' loading' : ''}`}
            onClick={handleTogglePlay}
            disabled={loading}
            aria-label={loading ? 'Đang tải' : playing ? 'Tạm dừng' : 'Phát'}
          >
            {loading ? <span className="ap-spinner" /> : playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className={`ap-bars${playing ? ' playing' : ''}`}>
            {[...Array(BARS)].map((_, i) => (
              <span key={i} style={{ '--i': i, '--n': BARS }} />
            ))}
          </div>
        </div>

        <div className="ap-meta">
          <p className="ap-label">Green QR • Sound Note</p>
          <h1 className="ap-title">{title}</h1>
          <p className="ap-sub">Một lời nhắn được gắn vào chiếc túi này. Nhấn phát để nghe.</p>
        </div>

        {audioUrl && !error && (
          <div className="ap-progress-wrap" onClick={handleSeek} role="slider" aria-label="Thanh tiến trình">
            <div className="ap-progress-track">
              <div className="ap-progress-fill" style={{ width: `${progress * 100}%` }} />
              <div className="ap-progress-thumb" style={{ left: `${progress * 100}%` }} />
            </div>
            <div className="ap-time-row">
              <span>{fmt(progress * duration)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>
        )}

        <div className="ap-controls">
          <button
            className={`ap-play-btn btn-glow${playing ? ' playing' : ''}${loading ? ' loading' : ''}`}
            onClick={handleTogglePlay}
            disabled={loading}
          >
            {loading && <span className="ap-spinner ap-spinner--sm" />}
            {!loading && (playing ? <PauseIcon /> : <PlayIcon />)}
            <span>{loading ? 'Đang chuẩn bị...' : playing ? 'Tạm dừng' : audioUrl ? 'Phát lại' : 'Phát thông điệp'}</span>
          </button>

          <span className={`ap-status${playing ? ' active' : ''}`}>
            {loading && 'Đang xử lý giọng đọc...'}
            {!loading && !audioUrl && !error && 'Sẵn sàng'}
            {!loading && audioUrl && !playing && 'Đã sẵn sàng'}
            {!loading && audioUrl && playing && '● Đang phát'}
          </span>
        </div>

        {error && <p className="ap-error">{error}</p>}

        <p className="ap-note">
          Chỉ người cầm chiếc túi này mới quét được mã QR · GreenShield Mekong
        </p>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6zm8-14v14h4V5z" />
    </svg>
  );
}
