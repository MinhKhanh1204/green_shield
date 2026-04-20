import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getBagTemplate } from '../../services/bagTemplate';
import DesignPreviewCanvas from '../../components/DesignPreviewCanvas';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';

// ❌ KHÔNG import PreviewPage.css nữa
// import './PreviewPage.css';

export default function PreviewPage() {
  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const zoom = state?.zoom || 100;

  const [template, setTemplate] = useState(null);
  const [activeSide, setActiveSide] = useState('front');

  const designSnapshot = state?.designSnapshot;

  useEffect(() => {
    if (!designSnapshot) {
      message.error('Thiếu thông tin thiết kế');
      navigate(`/custom-bag/${templateId}/design`);
      return;
    }

    getBagTemplate(templateId)
      .then(setTemplate)
      .catch(() => message.error('Không thể tải mẫu'));
  }, [templateId, designSnapshot, navigate]);

  if (!template) {
    return <div className="design-loading">Đang tải...</div>;
  }

  return (
    <div className="design-page">

      {/* 🌌 BACKGROUND SYSTEM (reuse 100%) */}
      <div className="design-canvas-wrap">

        <div className="app-bg" />

        <div className="app-grid-wrap">
          <InteractiveGridPattern
            className="app-grid grid-fade"
          />
        </div>

        <div className="app-ambient" />
        <div className="grid-overlay" />

        {/* 🔥 TOPBAR (reuse luôn style) */}
        <header className="design-topbar">
          <div className="topbar-left">
            <button
              className="topbar-back-btn"
              onClick={() =>
                navigate(`/custom-bag/${templateId}/design`, {
                  state: { designSnapshot },
                })
              }
            >
              <CloseOutlined />
            </button>

            <div className="design-meta">
              <div className="design-name">{template.name}</div>
              <div className="design-status">
                <span className="dot" />
                Đã lưu
              </div>
            </div>
          </div>

          <div className="topbar-center">
            <div className="design-badge">
              <span className="material-symbols-rounded">visibility</span>
              <span>Preview</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="btn-ghost"
              onClick={() =>
                navigate(`/custom-bag/${templateId}/design`, {
                  state: { designSnapshot },
                })
              }
            >
              Quay lại
            </button>

            <button
              className="btn-primary glow"
              onClick={() =>
                navigate(`/custom-bag/${templateId}/checkout`, {
                  state: { designSnapshot },
                })
              }
            >
              Đặt hàng →
            </button>
          </div>
        </header>

        {/* 🧠 BODY */}
        <div className="design-body">

          {/* 🎯 CENTER */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5, // 🔥 FIX GRID ĐÈ
            }}
          >
            <div
              style={{
                background: 'var(--dl-bg)',
                borderRadius: 20,
                padding: 24,
                boxShadow:
                  '0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  perspective: 1200,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 700,
                    height: 700,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                    transform:
                      activeSide === 'front'
                        ? 'rotateY(0deg)'
                        : 'rotateY(180deg)',
                  }}
                >

                  {/* FRONT */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <DesignPreviewCanvas
                      template={template}
                      designSnapshot={designSnapshot}
                      activeSide="front"
                      zoom={zoom}
                    />
                  </div>

                  {/* BACK */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <DesignPreviewCanvas
                      template={template}
                      designSnapshot={designSnapshot}
                      activeSide="back"
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* label */}
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '6px 14px',
                borderRadius: 999,
                background: 'var(--dl-surface)',
                fontSize: 13,
              }}
            >
              {activeSide === 'front' ? 'Mặt trước' : 'Mặt sau'}
            </div>
          </div>

          {/* 👉 RIGHT PANEL */}
          <div
            style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 6,
            }}
          >
            <div
              style={{
                width: 140,
                padding: 12,
                borderRadius: 14,
                background: 'var(--dl-glass-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--dl-glass-stroke)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--dl-subtext)',
                  marginBottom: 8,
                }}
              >
                Chọn mặt
              </div>

              {/* FRONT */}
              <button
                onClick={() => setActiveSide('front')}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  padding: 6,
                  marginBottom: 8,
                  border:
                    activeSide === 'front'
                      ? '1px solid #22c55e'
                      : '1px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={template.frontImageUrl}
                  style={{ width: '100%', borderRadius: 6 }}
                />
                <div style={{ fontSize: 11 }}>Mặt trước</div>
              </button>

              {/* BACK */}
              <button
                onClick={() => setActiveSide('back')}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  padding: 6,
                  border:
                    activeSide === 'back'
                      ? '1px solid #22c55e'
                      : '1px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={template.backImageUrl}
                  style={{ width: '100%', borderRadius: 6 }}
                />
                <div style={{ fontSize: 11 }}>Mặt sau</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}