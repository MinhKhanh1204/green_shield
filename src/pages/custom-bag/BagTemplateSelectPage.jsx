import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { getBagTemplates } from '../../services/bagTemplate';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { AuroraText } from "@/components/ui/aurora-text";
import AppSkeleton from '@/components/ui/AppSkeleton';
import logo from '../../assets/logo.png';

import './BagTemplateSelectPage.css';

export default function BagTemplateSelectPage() {
  const { t, i18n } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getBagTemplates(true)
      .then(setTemplates)
      .catch(() => message.error(t('customBag.template.empty')))
      .finally(() => setLoading(false));
  }, [t]);

  const filtered = templates.filter((template) =>
    template.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="design-page template-select-page">
        <div className="app-bg" />
        <div className="app-grid-wrap">
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
        <AppSkeleton variant="template" />
      </div>
    );
  }

  return (
    <div className="design-page template-select-page">
      <div className="app-bg" />
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
            {t('customBag.template.badge')}
          </div>

          <h1 className="design-title">
            <AuroraText>
              {t('customBag.template.title')}
            </AuroraText>
          </h1>

          <p className="design-subtitle">
            {t('customBag.template.subtitle')}
          </p>

          <div className="design-actions">

            {/* SEARCH */}
            <div className="design-search">
              <span className="material-symbols-rounded">
                search
              </span>
              <input
                placeholder={t('customBag.template.searchPlaceholder')}
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
                  ? t('customBag.template.emptySearch', { search })
                  : t('customBag.template.empty')}
              </p>
            </div>
          ) : (
            <div className="design-grid">

              {filtered.map((template) => (
                <div
                  key={template.id}
                  className="market-card"
                  onClick={() => navigate(`/custom-bag/${template.id}/design`)}
                >
                  <div className="market-card-inner">
                    <div className="market-card-media">
                      <div className="market-card-techline">
                        <span className="market-card-techline__dot" />
                        {t('customBag.template.ready')}
                      </div>

                      {/* FRONT */}
                        <img
                        src={template.frontImageUrl}
                        className="front"
                        alt={template.name}
                      />

                      {/* BACK */}
                      {template.backImageUrl && (
                        <img
                          src={template.backImageUrl}
                          className="back"
                          alt={t('customBag.template.backAlt', { name: template.name })}
                        />
                      )}

                      <div className="market-card-overlay">
                        <span>{t('customBag.template.designNow')}</span>
                      </div>
                    </div>

                    <div className="market-card-body">
                      <div className="market-card-meta">
                        <span>{t('customBag.template.model', { id: template.id })}</span>
                        <span>{template.backImageUrl ? t('customBag.template.twoSides') : t('customBag.template.oneSide')}</span>
                      </div>
                      <h3>{template.name}</h3>

                      <div className="market-card-footer">
                        <span className="price">
                          {Number(template.basePrice).toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'vi-VN')} {i18n.language.startsWith('en') ? 'VND' : '₫'}
                        </span>
                        <span className="tag">{t('customBag.template.customizable')}</span>
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
