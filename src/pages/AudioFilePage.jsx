import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AudioPage.css';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

const BARS = 40;

export default function AudioFilePage() {
  const { id } = useParams();
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const title = useMemo(() => (id ? `Green QR Audio` : 'Green QR Audio'), [id]);

  useEffect(() => {
    setError(null);
    if (!id) {
      setAudioUrl(null);
      return;
    }
    setAudioUrl(`${API_BASE}/api/v1/audio/file/${id}`);
  }, [id]);

  const handleTogglePlay = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      return;
    }
    try {
      await audioRef.current.play();
    } catch {
      setError('Không thể phát audio. Vui lòng thử lại.');
    }
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
      <div className="ap-blob ap-blob--a" />
      <div className="ap-blob ap-blob--b" />
      <div className="ap-blob ap-blob--c" />

      <Link to="/" className="ap-logo">
        <span className="ap-logo-dot" />
        GreenShield
      </Link>

      <div className="ap-card">
        <div className="ap-artwork" aria-hidden="true">
          <div className="ap-artwork-ring ap-artwork-ring--outer" />
          <div className="ap-artwork-ring ap-artwork-ring--mid" />

          <button
            className={`ap-center-btn${playing ? ' playing' : ''}`}
            onClick={handleTogglePlay}
            aria-label={playing ? 'Tạm dừng' : 'Phát'}
            disabled={!audioUrl}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className={`ap-bars${playing ? ' playing' : ''}`}>
            {[...Array(BARS)].map((_, i) => (
              <span key={i} style={{ '--i': i, '--n': BARS }} />
            ))}
          </div>
        </div>

        <div className="ap-meta">
          <p className="ap-label">Green QR • Audio File</p>
          <h1 className="ap-title">{title}</h1>
          <p className="ap-sub">Một file audio được gắn vào chiếc túi này. Nhấn phát để nghe.</p>
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
          <button className={`ap-play-btn${playing ? ' playing' : ''}`} onClick={handleTogglePlay} disabled={!audioUrl}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            <span>{playing ? 'Tạm dừng' : 'Phát audio'}</span>
          </button>

          <span className={`ap-status${playing ? ' active' : ''}`}>
            {!audioUrl && 'Không có audio'}
            {audioUrl && !playing && 'Sẵn sàng'}
            {audioUrl && playing && '● Đang phát'}
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
        onError={() => setError('Audio không tồn tại hoặc không phải định dạng hỗ trợ.')}
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

