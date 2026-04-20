import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Modal } from 'antd';
import { getOrderById } from '../services/order';
import { getBagTemplate } from '../services/bagTemplate';
import DesignPreviewCanvas from '../components/DesignPreviewCanvas';
import logo from '../assets/logo.png';
import logolg from '../assets/logo-lg.png';
import './OrderLookupPage.css';

const STATUS_MAP = {
  PENDING:    { label: 'Chờ xử lý',   color: '#f59e0b', bg: '#fffbeb' },
  CONFIRMED:  { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  PROCESSING: { label: 'Đang xử lý',  color: '#8b5cf6', bg: '#f5f3ff' },
  SHIPPED:    { label: 'Đã giao vận', color: '#06b6d4', bg: '#ecfeff' },
  DELIVERED:  { label: 'Đã giao',     color: '#22c55e', bg: '#f0fdf4' },
  CANCELLED:  { label: 'Đã hủy',      color: '#ef4444', bg: '#fef2f2' },
};

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderLookupPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [inputId, setInputId] = useState(state?.prefillId ? String(state.prefillId) : '');
  const [order, setOrder] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewSide, setPreviewSide] = useState('front');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const handleLookup = useCallback(async (id) => {
    const lookupId = id ?? inputId;
    if (!lookupId) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setTemplate(null);
    try {
      const o = await getOrderById(lookupId);
      setOrder(o);
      setPreviewSide('front');
      const t = await getBagTemplate(o.bagTemplateId);
      setTemplate(t);
    } catch (e) {
      setError(e.message === 'NOT_FOUND'
        ? 'Không tìm thấy đơn hàng với mã này.'
        : 'Không thể tra cứu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [inputId]);

  // Auto-lookup if prefilled
  useEffect(() => {
    if (state?.prefillId) handleLookup(state.prefillId);
  }, [handleLookup, state?.prefillId]);

  const statusInfo = order ? (STATUS_MAP[order.status] || { label: order.status, color: '#6b7280', bg: '#f3f4f6' }) : null;
  const stepIdx = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="olp-page">
      {/* Topbar */}
      <header className="olp-topbar">
        <div className="olp-topbar-left">
          <button className="olp-back-btn" onClick={() => navigate('/custom-bag')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Chọn mẫu túi
          </button>
          <Link to="/" className="olp-logo">
            <img src={logo} alt="logo" width="22" />
            <img src={logolg} alt="GreenShield" className="olp-logo-text" />
          </Link>
        </div>
        <Link to="/" className="olp-home-link">Về trang chủ</Link>
      </header>

      <div className="olp-body">
        {/* Search panel */}
        <div className="olp-search-card">
          <div className="olp-search-icon-wrap">🔍</div>
          <h1 className="olp-search-title">Tra cứu đơn hàng</h1>
          <p className="olp-search-sub">Nhập mã đơn hàng để xem trạng thái và thiết kế của bạn.</p>
          <div className="olp-search-row">
            <input
              className="olp-input"
              type="number"
              placeholder="Nhập mã đơn hàng (VD: 42)"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
            <button
              className="olp-search-btn"
              onClick={() => handleLookup()}
              disabled={loading || !inputId}
            >
              {loading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </div>
          {error && <p className="olp-error">{error}</p>}
        </div>

        {/* Result */}
        {order && (
          <div className="olp-result">
            {/* Status banner */}
            <div className="olp-status-banner" style={{ background: statusInfo.bg, borderColor: statusInfo.color + '44' }}>
              <div className="olp-status-left">
                <span className="olp-order-num">Đơn #{order.id}</span>
                <span className="olp-status-badge" style={{ background: statusInfo.color + '22', color: statusInfo.color }}>
                  {statusInfo.label}
                </span>
              </div>
              <span className="olp-status-date">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>

            {/* Progress bar */}
            {order.status !== 'CANCELLED' && (
              <div className="olp-progress-wrap">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="olp-progress-step">
                      <div className={`olp-progress-dot${i <= stepIdx ? ' done' : ''}`}>
                        {i <= stepIdx ? '✓' : i + 1}
                      </div>
                      <span className={`olp-progress-label${i <= stepIdx ? ' done' : ''}`}>
                        {STATUS_MAP[s]?.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`olp-progress-line${i < stepIdx ? ' done' : ''}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Main layout */}
            <div className="olp-main">
              {/* Left: design preview */}
              <div className="olp-preview-col">
                <p className="olp-col-title">Thiết kế của bạn</p>
                <div className="olp-canvas-box">
                  {template ? (
                    <DesignPreviewCanvas
                      template={template}
                      designSnapshot={order.designSnapshot}
                      activeSide={previewSide}
                    />
                  ) : (
                    <div className="olp-canvas-loading">Đang tải...</div>
                  )}
                </div>
                {template && (
                  <button
                    type="button"
                    className="olp-preview-btn"
                    onClick={() => setPreviewModalOpen(true)}
                  >
                    🔍 Preview ảnh
                  </button>
                )}
                {/* Side toggle */}
                {template && (
                  <div className="olp-side-toggle">
                    {['front', 'back'].map((s) => (
                      <button
                        key={s}
                        className={`olp-side-btn${previewSide === s ? ' active' : ''}`}
                        onClick={() => setPreviewSide(s)}
                      >
                        <div className="olp-side-thumb-img">
                          <img
                            src={s === 'front' ? template.frontImageUrl : template.backImageUrl}
                            alt={s}
                          />
                        </div>
                        <span>{s === 'front' ? 'Mặt trước' : 'Mặt sau'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal xem ảnh phóng to */}
              <Modal
                open={previewModalOpen}
                onCancel={() => setPreviewModalOpen(false)}
                footer={null}
                width={720}
                centered
                title={previewSide === 'front' ? 'Preview — Mặt trước' : 'Preview — Mặt sau'}
              >
                {template && (
                  <div className="olp-zoom-wrap">
                    <div className="olp-zoom-canvas">
                      <DesignPreviewCanvas
                        template={template}
                        designSnapshot={order.designSnapshot}
                        activeSide={previewSide}
                      />
                    </div>
                    <div className="olp-side-toggle olp-zoom-sides">
                      {['front', 'back'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`olp-side-btn${previewSide === s ? ' active' : ''}`}
                          onClick={() => setPreviewSide(s)}
                        >
                          <div className="olp-side-thumb-img">
                            <img
                              src={s === 'front' ? template.frontImageUrl : template.backImageUrl}
                              alt={s}
                            />
                          </div>
                          <span>{s === 'front' ? 'Mặt trước' : 'Mặt sau'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Modal>

              {/* Right: info */}
              <div className="olp-info-col">
                <p className="olp-col-title">Thông tin đơn hàng</p>
                <div className="olp-info-table">
                  {[
                    ['Khách hàng', order.customerName],
                    ['Số điện thoại', order.customerPhone],
                    ['Địa chỉ', order.customerAddress],
                    ['Email', order.customerEmail || '—'],
                    ['Mẫu túi', template?.name || `#${order.bagTemplateId}`],
                    ['Số lượng', order.quantity],
                    ['Tổng tiền', `${Number(order.totalPrice).toLocaleString('vi-VN')} ₫`],
                  ].map(([label, value]) => (
                    <div key={label} className="olp-info-row">
                      <span className="olp-info-label">{label}</span>
                      <span className="olp-info-value">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="olp-note">
                  <span className="olp-note-icon">📞</span>
                  <p>Đội ngũ GreenShield sẽ liên hệ xác nhận qua số điện thoại bạn đã cung cấp. Nếu cần hỗ trợ, vui lòng liên hệ trực tiếp với chúng tôi.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
