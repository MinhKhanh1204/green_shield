import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Form, Input, InputNumber, message } from 'antd';
import { createOrder } from '../services/order';
import { getBagTemplate } from '../services/bagTemplate';
import logo from '../assets/logo.png';
import logolg from '../assets/logo-lg.png';
import DesignPreviewCanvas from '../components/DesignPreviewCanvas';
import './CheckoutPage.css';

export default function CheckoutPage() {
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
      message.error('Thiếu thông tin thiết kế');
      navigate(`/custom-bag/${templateId}/design`);
      return;
    }
    getBagTemplate(templateId).then(setTemplate).catch(() => message.error('Không thể tải mẫu'));
  }, [templateId, designSnapshot, navigate]);

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
      message.error('Đặt hàng thất bại. Vui lòng thử lại.');
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
        <div className="co-loading">Đang tải...</div>
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
            Back
          </button>
          <Link to="/" className="co-logo">
            <img src={logo} alt="logo" width="22" />
            <img src={logolg} alt="GreenShield" className="co-logo-text" />
          </Link>
          <span className="co-topbar-saved">
            <span className="co-saved-dot" />
            Đã lưu
          </span>
        </div>

        <div className="co-topbar-center">
          <button className="co-tabnav" onClick={goBackToDesign}>Design</button>
          <button className="co-tabnav active">Order</button>
        </div>

        <div className="co-topbar-right">
          <Link to="/" className="co-home-link">Về trang chủ</Link>
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
              <img src={template.frontImageUrl} alt="Mặt trước" />
              <span>Front</span>
            </div>
            {template.backImageUrl && (
              <div
                className={`co-thumb-card${activeSide === 'back' ? ' active' : ''}`}
                onClick={() => setActiveSide('back')}
              >
                <img src={template.backImageUrl} alt="Mặt sau" />
                <span>Back</span>
              </div>
            )}
          </div>
        </div>

        {/* Right – order form */}
        <div className="co-right">
          <div className="co-panel">
            <h2 className="co-heading">Kiểm tra trước khi đặt hàng</h2>
            <p className="co-subheading">Xem lại thiết kế của bạn trước khi tiếp tục.</p>

            {/* Checklist */}
            <div className="co-checklist">
              <p className="co-checklist-title">
                <span className="co-check-icon">✓</span> Lưu ý kiểm tra:
              </p>
              <ul>
                <li>Kiểm tra tên, ngày, địa chỉ chính xác</li>
                <li>Đảm bảo các thành phần hiển thị rõ ràng</li>
                <li>Tất cả nội dung cá nhân hoá đã được điền</li>
                <li>Kiểm tra cả mặt trước và mặt sau</li>
              </ul>
            </div>

            {/* Selected options */}
            <div className="co-options-box">
              <p className="co-options-title">
                <span className="co-bag-icon">🛍</span> Sản phẩm đã chọn:
              </p>
              <ul>
                <li>Tên: <strong>{template.name}</strong></li>
                <li>Giá: <strong>{unitPrice.toLocaleString('vi-VN')} ₫ / túi</strong></li>
              </ul>
            </div>

            <div className="co-divider" />

            {/* Form */}
            <Form form={form} layout="vertical" onFinish={onFinish} className="co-form">
              <div className="co-form-row">
                <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                  <Input placeholder="0901234567" />
                </Form.Item>
              </div>

              <Form.Item name="address" label="Địa chỉ giao hàng" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input.TextArea rows={2} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
              </Form.Item>

              <Form.Item name="email" label="Email (tùy chọn)">
                <Input type="email" placeholder="email@example.com" />
              </Form.Item>

              <div className="co-divider" />

              {/* Subtotal row */}
              <div className="co-subtotal-row">
                <span className="co-subtotal-label">Subtotal:</span>
                <span className="co-subtotal-price">{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="co-qty-row">
                <span className="co-qty-label">Qty:</span>
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
                {submitting ? 'Đang xử lý…' : 'Xác nhận đặt hàng'}
              </button>

              <p className="co-guarantee">100% Đảm bảo hài lòng</p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
