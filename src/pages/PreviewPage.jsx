import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { getBagTemplate } from '../services/bagTemplate';
import DesignPreviewCanvas from '../components/DesignPreviewCanvas';
import './PreviewPage.css';

export default function PreviewPage() {
  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [activeSide, setActiveSide] = useState('front');

  const designSnapshot = state?.designSnapshot;

  React.useEffect(() => {
    if (!designSnapshot) {
      message.error('Thiếu thông tin thiết kế');
      navigate(`/custom-bag/${templateId}/design`);
      return;
    }
    getBagTemplate(templateId)
      .then(setTemplate)
      .catch(() => message.error('Không thể tải mẫu'));
  }, [templateId, designSnapshot, navigate]);

  React.useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') navigate(`/custom-bag/${templateId}/design`, { state: { designSnapshot } });
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [templateId, navigate, designSnapshot]);

  if (!template) {
    return (
      <div className="preview-layout">
        <div className="preview-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="preview-layout">
      {/* Top bar */}
      <header className="preview-topbar">
        <button
          type="button"
          className="preview-topbar-close"
          onClick={() => navigate(`/custom-bag/${templateId}/design`, { state: { designSnapshot } })}
          aria-label="Đóng"
        >
          <CloseOutlined />
        </button>
        <span className="preview-topbar-back" onClick={() => navigate(`/custom-bag/${templateId}/design`, { state: { designSnapshot } })}>Quay lại</span>
        <span className="preview-topbar-title">{template.name}</span>
        <span className="preview-topbar-saved">
          <span className="preview-saved-dot" /> Đã lưu
        </span>
        <span className="preview-topbar-preview">
          <EyeOutlined /> Preview
        </span>
        <Button
          type="primary"
          className="preview-topbar-next"
          onClick={() => navigate(`/custom-bag/${templateId}/checkout`, { state: { designSnapshot } })}
        >
          Tiếp: Đặt mua
        </Button>
      </header>

      <div className="preview-body">
        {/* Left sidebar - dark grey */}
        <aside className="preview-sidebar-left">
          <div className="preview-sidebar-placeholder" />
        </aside>

        {/* Center - product display */}
        <main className="preview-center">
          <div className="preview-product-area">
            <DesignPreviewCanvas template={template} designSnapshot={designSnapshot} activeSide={activeSide} />
          </div>
          <div className="preview-view-label-box">
            {activeSide === 'front' ? 'Mặt trước' : 'Mặt sau'}
          </div>
        </main>

        {/* Right sidebar - thumbnails */}
        <aside className="preview-sidebar-right">
          <div className="preview-thumbnails">
            <button
              type="button"
              className={`preview-thumb ${activeSide === 'front' ? 'active' : ''}`}
              onClick={() => setActiveSide('front')}
            >
              <img src={template.frontImageUrl} alt="Mặt trước" />
              <span>Mặt trước</span>
            </button>
            <button
              type="button"
              className={`preview-thumb ${activeSide === 'back' ? 'active' : ''}`}
              onClick={() => setActiveSide('back')}
            >
              <img src={template.backImageUrl} alt="Mặt sau" />
              <span>Mặt sau</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
