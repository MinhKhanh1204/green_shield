import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, InputNumber, message } from 'antd';
import { createOrder } from '../../services/order';
import { getBagTemplate } from '../../services/bagTemplate';
import logo from '../../assets/logo.png';
import logolg from '../../assets/logo-lg.png';
import DesignPreviewCanvas from '../../components/DesignPreviewCanvas';
import LanguageToggle from '../../components/LanguageToggle';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [template, setTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeSide, setActiveSide] = useState('front');

  const designSnapshot = state?.designSnapshot;

  useEffect(() => {
    if (!designSnapshot) {
      message.error(t('customBag.checkout.missingDesign'));
      navigate(`/custom-bag/${templateId}/design`);
      return;
    }
    getBagTemplate(templateId).then(setTemplate).catch(() => message.error(t('customBag.checkout.loadFailed')));
  }, [templateId, designSnapshot, navigate, t]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const order = await createOrder({
        bagTemplateId: Number(templateId),
        designSnapshot,
        customerName: values.name,
        customerPhone: values.phone,
        customerAddress: values.address,
        customerEmail: values.email || undefined,
        quantity: values.quantity || 1,
      });
      navigate('/order-success', { state: { order } });
    } catch {
      message.error(t('customBag.checkout.orderFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const goBackToDesign = () => {
    navigate(`/custom-bag/${templateId}/design`, { state: { designSnapshot } });
  };

  if (!template) {
    return (
      <div className="co-page">
        <div className="co-loading">{t('customBag.checkout.loading')}</div>
      </div>
    );
  }

  const unitPrice = Number(template.basePrice);
  const subtotal = unitPrice * quantity;

  return (
    <div className="co-page">
      {/* ── Top bar ── */}
      <header className="co-topbar">
        <div className="co-topbar-left">
          <button className="co-back-btn" onClick={goBackToDesign}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('customBag.checkout.back')}
          </button>
          <Link to="/" className="co-logo">
            <img src={logo} alt="logo" width="22" />
            <img src={logolg} alt="GreenShield" className="co-logo-text" />
          </Link>
          <span className="co-topbar-saved">
            <span className="co-saved-dot" />
            {t('customBag.checkout.saved')}
          </span>
        </div>

        <div className="co-topbar-center">
          <button className="co-tabnav" onClick={goBackToDesign}>{t('customBag.checkout.design')}</button>
          <button className="co-tabnav active">{t('customBag.checkout.order')}</button>
        </div>

        <div className="co-topbar-right">
          <LanguageToggle />
          <Link to="/" className="co-home-link">{t('customBag.checkout.home')}</Link>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="co-body">
        {/* Left – design preview */}
        <div className="co-left">
          <div className="co-img-wrap">
            <DesignPreviewCanvas
              template={template}
              designSnapshot={designSnapshot}
              activeSide={activeSide}
            />
          </div>
          <div className="co-img-thumbs">
            <div
              className={`co-thumb-card${activeSide === 'front' ? ' active' : ''}`}
              onClick={() => setActiveSide('front')}
            >
              <img src={template.frontImageUrl} alt={t('customBag.checkout.front')} />
              <span>{t('customBag.checkout.front')}</span>
            </div>
            {template.backImageUrl && (
              <div
                className={`co-thumb-card${activeSide === 'back' ? ' active' : ''}`}
                onClick={() => setActiveSide('back')}
              >
                <img src={template.backImageUrl} alt={t('customBag.checkout.backSide')} />
                <span>{t('customBag.checkout.backSide')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right – order form */}
        <div className="co-right">
          <div className="co-panel">
            <h2 className="co-heading">{t('customBag.checkout.reviewTitle')}</h2>
            <p className="co-subheading">{t('customBag.checkout.reviewSubtitle')}</p>

            {/* Checklist */}
            <div className="co-checklist">
              <p className="co-checklist-title">
                <span className="co-check-icon">✓</span> {t('customBag.checkout.checklistTitle')}
              </p>
              <ul>
                <li>{t('customBag.checkout.checkName')}</li>
                <li>{t('customBag.checkout.checkVisibility')}</li>
                <li>{t('customBag.checkout.checkPersonalized')}</li>
                <li>{t('customBag.checkout.checkSides')}</li>
              </ul>
            </div>

            {/* Selected options */}
            <div className="co-options-box">
              <p className="co-options-title">
                <span className="co-bag-icon">🛍</span> {t('customBag.checkout.selectedProduct')}
              </p>
              <ul>
                <li>{t('customBag.checkout.name')}: <strong>{template.name}</strong></li>
                <li>{t('customBag.checkout.price')}: <strong>{unitPrice.toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'vi-VN')} {i18n.language.startsWith('en') ? 'VND' : '₫'} {t('customBag.checkout.perBag')}</strong></li>
              </ul>
            </div>

            <div className="co-divider" />

            {/* Form */}
            <Form form={form} layout="vertical" onFinish={onFinish} className="co-form">
              <div className="co-form-row">
                <Form.Item name="name" label={t('customBag.checkout.fullName')} rules={[{ required: true, message: t('customBag.checkout.requiredName') }]}>
                  <Input placeholder={t('customBag.checkout.namePlaceholder')} />
                </Form.Item>
                <Form.Item name="phone" label={t('customBag.checkout.phone')} rules={[{ required: true, message: t('customBag.checkout.requiredPhone') }]}>
                  <Input placeholder={t('customBag.checkout.phonePlaceholder')} />
                </Form.Item>
              </div>

              <Form.Item name="address" label={t('customBag.checkout.address')} rules={[{ required: true, message: t('customBag.checkout.requiredAddress') }]}>
                <Input.TextArea rows={2} placeholder={t('customBag.checkout.addressPlaceholder')} />
              </Form.Item>

              <Form.Item name="email" label={t('customBag.checkout.email')}>
                <Input type="email" placeholder={t('customBag.checkout.emailPlaceholder')} />
              </Form.Item>

              <div className="co-divider" />

              {/* Subtotal row */}
              <div className="co-subtotal-row">
                <span className="co-subtotal-label">{t('customBag.checkout.subtotal')}</span>
                <span className="co-subtotal-price">{subtotal.toLocaleString(i18n.language.startsWith('en') ? 'en-US' : 'vi-VN')} {i18n.language.startsWith('en') ? 'VND' : '₫'}</span>
              </div>

              <div className="co-qty-row">
                <span className="co-qty-label">{t('customBag.checkout.quantity')}</span>
                <Form.Item name="quantity" initialValue={1} noStyle>
                  <InputNumber
                    min={1}
                    max={999}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    className="co-qty-input"
                  />
                </Form.Item>
              </div>

              <button
                type="submit"
                className="co-submit-btn"
                disabled={submitting}
                onClick={() => form.submit()}
              >
                {submitting ? t('customBag.checkout.processing') : t('customBag.checkout.confirm')}
              </button>

              <p className="co-guarantee">{t('customBag.checkout.guarantee')}</p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
