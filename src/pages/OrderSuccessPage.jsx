import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import logolg from '../assets/logo-lg.png';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const order = state?.order;
  const orderId = order?.id;

  const handleCopy = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(String(orderId)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!order) {
    return (
      <div className="osp-page">
        <div className="osp-not-found">
          <p>Không tìm thấy thông tin đơn hàng.</p>
          <button onClick={() => navigate('/custom-bag')} className="osp-btn-primary">
            Về trang chọn túi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="osp-page">
      {/* Topbar */}
      <header className="osp-topbar">
        <Link to="/" className="osp-logo">
          <img src={logo} alt="logo" width="22" />
          <img src={logolg} alt="GreenShield" className="osp-logo-text" />
        </Link>
        <Link to="/" className="osp-home-link">Về trang chủ</Link>
      </header>

      <div className="osp-body">
        {/* Success card */}
        <div className="osp-card">
          {/* Animated checkmark */}
          <div className="osp-check-circle">
            <svg viewBox="0 0 52 52" className="osp-check-svg">
              <circle cx="26" cy="26" r="25" fill="none" className="osp-check-ring" />
              <path d="M14 27l8 8 16-16" fill="none" className="osp-check-tick" />
            </svg>
          </div>

          <h1 className="osp-title">Đặt hàng thành công! 🎉</h1>
          <p className="osp-subtitle">
            Cảm ơn bạn đã tin tưởng GreenShield Mekong.<br />
            Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
          </p>

          {/* Order ID box */}
          <div className="osp-order-box">
            <p className="osp-order-label">Mã đơn hàng của bạn</p>
            <div className="osp-order-id-row">
              <span className="osp-order-id">#{orderId}</span>
              <button className="osp-copy-btn" onClick={handleCopy}>
                {copied ? '✓ Đã sao chép' : '📋 Sao chép'}
              </button>
            </div>
            <p className="osp-order-hint">
              📌 Lưu mã này lại để tra cứu trạng thái đơn hàng bất cứ lúc nào.
            </p>
          </div>

          {/* Info steps */}
          <div className="osp-steps">
            <div className="osp-step">
              <span className="osp-step-icon">📞</span>
              <div>
                <p className="osp-step-title">Chúng tôi sẽ liên hệ bạn sớm</p>
                <p className="osp-step-desc">Đội ngũ GreenShield sẽ gọi xác nhận đơn trong vòng 24 giờ làm việc.</p>
              </div>
            </div>
            <div className="osp-step">
              <span className="osp-step-icon">🎨</span>
              <div>
                <p className="osp-step-title">Thiết kế được bảo lưu</p>
                <p className="osp-step-desc">Thiết kế cá nhân của bạn đã được lưu lại trong đơn hàng và sẽ được in chính xác.</p>
              </div>
            </div>
            <div className="osp-step">
              <span className="osp-step-icon">🚚</span>
              <div>
                <p className="osp-step-title">Giao hàng tận nơi</p>
                <p className="osp-step-desc">Sau khi xác nhận, túi sẽ được sản xuất và giao đến địa chỉ của bạn.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="osp-actions">
            <button
              className="osp-btn-outline"
              onClick={() => navigate('/order-lookup', { state: { prefillId: orderId } })}
            >
              🔍 Tra cứu đơn hàng
            </button>
            <button
              className="osp-btn-primary"
              onClick={() => navigate('/custom-bag')}
            >
              Thiết kế thêm →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
