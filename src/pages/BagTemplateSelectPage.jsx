import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { getBagTemplates } from '../services/bagTemplate';
import './BagTemplateSelectPage.css';

export default function BagTemplateSelectPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getBagTemplates(true)
      .then(setTemplates)
      .catch(() => message.error('Không thể tải mẫu túi'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bsp-page">
        <div className="bsp-loading"><Spin size="large" /></div>
      </div>
    );
  }

  return (
    <div className="bsp-page">
        {/* Hero */}
        <section className="bsp-hero">
          <div className="bsp-hero-badge">✦ Thiết kế theo ý bạn</div>
          <h1 className="bsp-hero-title">Chọn mẫu túi để bắt đầu</h1>
          <p className="bsp-hero-sub">
            Cá nhân hoá từng chiếc túi — thêm hình ảnh, text và màu sắc theo phong cách riêng của bạn.
          </p>
          <div className="bsp-hero-actions">
            <div className="bsp-search-wrap">
          <svg className="bsp-search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#9ca3af" strokeWidth="1.8"/>
            <path d="M13.5 13.5L17 17" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            className="bsp-search"
            placeholder="Tìm mẫu túi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
            </div>
            <button className="bsp-lookup-btn" onClick={() => navigate('/order-lookup')}>
              🔍 Tra cứu đơn hàng
            </button>
          </div>
        </section>

      {/* Grid */}
      <section className="bsp-grid-section">
        <div className="bsp-container">
          {filtered.length === 0 ? (
            <div className="bsp-empty">
              <span className="bsp-empty-icon">🛍</span>
              <p>{search ? `Không tìm thấy mẫu nào cho "${search}"` : 'Chưa có mẫu túi nào.'}</p>
            </div>
          ) : (
            <div className="bsp-grid">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="bsp-card"
                  onClick={() => navigate(`/custom-bag/${t.id}/design`)}
                >
                  <div className="bsp-card-img-wrap">
                    <img src={t.frontImageUrl} alt={t.name} className="bsp-card-img" />
                    {t.backImageUrl && (
                      <img src={t.backImageUrl} alt={t.name + ' back'} className="bsp-card-img bsp-card-img-back" />
                    )}
                    <div className="bsp-card-overlay">
                      <span className="bsp-card-cta">Bắt đầu thiết kế →</span>
                    </div>
                  </div>
                  <div className="bsp-card-body">
                    <h3 className="bsp-card-name">{t.name}</h3>
                    <div className="bsp-card-footer">
                      <span className="bsp-card-price">
                        {Number(t.basePrice).toLocaleString('vi-VN')} ₫
                      </span>
                      <span className="bsp-card-tag">Tuỳ chỉnh</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
