import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AudioPage.css';

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

function decodeBase64Url(code) {
  try {
    let s = code.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bytes = atob(s);
    // decodeURIComponent(escape(...)) to get UTF‑8 back
    return decodeURIComponent(escape(bytes));
  } catch {
    return '';
  }
}

export default function AudioPage() {
  const { code } = useParams();
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const decodedText = useMemo(() => decodeBase64Url(code || ''), [code]);

  useEffect(() => {
    if (!code) return;
    let revoked = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/v1/audio/${code}`);
        if (!res.ok) {
          throw new Error('Không thể tải âm thanh');
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!revoked) {
          setAudioUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        setError(e.message || 'Có lỗi xảy ra khi phát âm thanh');
      } finally {
        if (!revoked) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      revoked = true;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const title = decodedText || 'Green QR audio';

  const handleTogglePlay = () => {
    if (!audioRef.current || !audioUrl || loading || error) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="audio-page-root">
      <div className="audio-page-gradient" />
      <div className="audio-page-shell">
        <header className="audio-page-header">
          <Link to="/" className="audio-logo-link">
            <span className="audio-logo-dot" /> GreenShield
          </Link>
        </header>

        <main className="audio-main">
          <section className="audio-card">
            <div className="audio-card-left">
              <p className="audio-kicker">Green QR sound</p>
              <h1 className="audio-title">{title}</h1>
              <p className="audio-subtitle">
                Một chiếc túi, một mã QR nhỏ, và đây là nơi bạn nghe lại thông điệp dành riêng cho mình.
              </p>
              <p className="audio-subcopy">
                Nhấn nút bên phải để phát, đeo tai nghe hoặc tăng nhẹ âm lượng để thưởng thức trọn vẹn hơn.
              </p>
            </div>

            <div className="audio-card-right">
              <div className={`audio-visual${playing ? ' playing' : ''}`}>
                <div className="audio-circle outer" />
                <div className="audio-circle middle" />
                <div className="audio-circle inner">
                  <span className="audio-pulse-dot" />
                </div>
                <div className="audio-wave">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="audio-player-box">
                {error && <p className="audio-error">{error}</p>}
                {!error && (
                  <div className="audio-controls-row">
                    <button
                      type="button"
                      className={`audio-play-btn${playing ? ' playing' : ''}`}
                      onClick={handleTogglePlay}
                      disabled={loading || !audioUrl}
                    >
                      <span className="audio-play-icon">{playing ? '❚❚' : '▶'}</span>
                      <span>{playing ? 'Tạm dừng' : 'Phát thông điệp'}</span>
                    </button>
                    <div className="audio-status-text">
                      {loading && 'Đang chuẩn bị âm thanh…'}
                      {!loading && !audioUrl && 'Âm thanh sẽ sẵn sàng sau khi hệ thống tạo xong.'}
                      {!loading && audioUrl && !playing && 'Đã sẵn sàng, nhấn Phát để nghe.'}
                      {!loading && audioUrl && playing && 'Đang phát...'}
                    </div>
                  </div>
                )}
                <audio
                  ref={audioRef}
                  src={audioUrl || undefined}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  className="audio-element"
                >
                  Trình duyệt của bạn không hỗ trợ phát audio.
                </audio>
              </div>

              <p className="audio-footnote">
                Lưu ý: Âm thanh chỉ phản ánh nội dung do người dùng nhập. Vui lòng quét và sử dụng một cách văn minh.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

