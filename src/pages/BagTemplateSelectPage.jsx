import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { getBagTemplates } from '../services/bagTemplate';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { AuroraText } from "@/components/ui/aurora-text";
import WebGLBackground from '@/components/ui/webgl-background';
import logo from '../assets/logo.png';

import './BagTemplateSelectPage.css';

export default function BagTemplateSelectPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('greenshield-theme') || document.documentElement.dataset.theme || 'light';
  });
  const navigate = useNavigate();

  useEffect(() => {
    getBagTemplates(true)
      .then(setTemplates)
      .catch(() => message.error('Không thể tải mẫu túi'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeMode);
    localStorage.setItem('greenshield-theme', themeMode);
  }, [themeMode]);

  const filtered = templates.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="design-page template-select-page">
        <div className="design-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="design-page template-select-page">
      <div className="app-bg" />
      {themeMode === 'dark' ? (
        <div className="webgl-bg-wrap">
          <WebGLBackground themeMode={themeMode} />
        </div>
      ) : null}
      <div className="app-grid-wrap">

        {/* 🌌 GRID BACKGROUND */}
        <InteractiveGridPattern
          className="app-grid grid-fade"
          spacing={36}
          dotColor="rgba(34, 197, 94, 0.22)"
          glowColor="rgba(34, 197, 94, 0.28)"
          glowRadius={520}
          gridOpacity={0.58}
          vignetteOpacity={0.02}
        />
        <div className="grid-overlay" />
      </div>
      <div className="app-ambient" />
      {/* HERO */}
      <section className="design-hero">
        <div className="design-hero-inner">
          <Link to="/" className="sidebar-logo template-hero-logo" aria-label="Về trang chủ">
            <img src={logo} alt="GreenShield logo" />
          </Link>

          <div className="design-badge">
            <span className="material-symbols-rounded">auto_awesome</span>
            Thiết kế theo ý bạn
          </div>

          <h1 className="design-title">
            <AuroraText>
              Chọn mẫu túi để bắt đầu
            </AuroraText>
          </h1>

          <p className="design-subtitle">
            Cá nhân hoá từng chiếc túi — thêm hình ảnh, text và màu sắc theo phong cách riêng của bạn.
          </p>

          <div className="design-actions">

            {/* SEARCH */}
            <div className="design-search">
              <span className="material-symbols-rounded">
                search
              </span>
              <input
                placeholder="Tra cứu đơn hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="design-content">
        <div className="design-container">

          {filtered.length === 0 ? (
            <div className="design-empty">
              <span className="material-symbols-rounded">shopping_bag</span>
              <p>
                {search
                  ? `Không tìm thấy "${search}"`
                  : 'Chưa có mẫu túi'}
              </p>
            </div>
          ) : (
            <div className="design-grid">

              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="market-card"
                  onClick={() => navigate(`/custom-bag/${t.id}/design`)}
                >
                  <div className="market-card-inner">
                    <div className="market-card-media">
                      <div className="market-card-techline">
                        <span className="market-card-techline__dot" />
                        Studio-ready
                      </div>

                      {/* FRONT */}
                      <img
                        src={t.frontImageUrl}
                        className="front"
                        alt={t.name}
                      />

                      {/* BACK */}
                      {t.backImageUrl && (
                        <img
                          src={t.backImageUrl}
                          className="back"
                          alt={`${t.name} mặt sau`}
                        />
                      )}

                      <div className="market-card-overlay">
                        <span>Thiết kế ngay →</span>
                      </div>
                    </div>

                    <div className="market-card-body">
                      <div className="market-card-meta">
                        <span>Mẫu #{t.id}</span>
                        <span>{t.backImageUrl ? '2 mặt' : '1 mặt'}</span>
                      </div>
                      <h3>{t.name}</h3>

                      <div className="market-card-footer">
                        <span className="price">
                          {Number(t.basePrice).toLocaleString('vi-VN')} ₫
                        </span>
                        <span className="tag">Tuỳ chỉnh</span>
                      </div>
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
