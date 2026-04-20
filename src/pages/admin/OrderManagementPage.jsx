import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Table, Select, Modal, Descriptions, Input } from 'antd';
import { adminGetOrders, adminUpdateOrderStatus } from '../../services/order';
import { getBagTemplate } from '../../services/bagTemplate';
import DesignPreviewCanvas from '../../components/DesignPreviewCanvas';
import './OrderManagementPage.css';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPED', label: 'Đã giao vận' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrderManagementPage() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [template, setTemplate] = useState(null);
  const [previewSide, setPreviewSide] = useState('front');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { orderId, newStatus, label }
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Scale DesignPreviewCanvas (rendered at 680px) down to fit thumbnail size
  function MiniPreview({ side, size = 60 }) {
    if (!template || !selectedOrder?.designSnapshot) return null;
    const scale = size / 680;
    return (
      <div style={{ width: size, height: size, overflow: 'hidden', borderRadius: 4, flexShrink: 0, position: 'relative' }}>
        <div style={{ width: 680, height: 680, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <DesignPreviewCanvas
            template={template}
            designSnapshot={selectedOrder.designSnapshot}
            activeSide={side}
          />
        </div>
      </div>
    );
  }

  const loadOrders = useCallback(async (status) => {
    setLoading(true);
    try {
      const data = await adminGetOrders(status || undefined);
      setOrders(data);
    } catch (e) {
      if (e.message === 'Unauthorized') navigate('/admin', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadOrders(statusFilter); }, [loadOrders, statusFilter]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const q = searchTerm.trim().toLowerCase();
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(q) ||
        (o.customerAddress || '').toLowerCase().includes(q) ||
        (o.customerEmail || '').toLowerCase().includes(q)
    );
  }, [orders, searchTerm]);

  const applyStatusChange = async (orderId, status) => {
    setConfirmLoading(true);
    try {
      await adminUpdateOrderStatus(orderId, status);
      message.success('Đã cập nhật trạng thái đơn hàng');
      setConfirmModal(null);
      loadOrders(statusFilter);
      if (selectedOrder?.id === orderId) setSelectedOrder((o) => (o ? { ...o, status } : null));
    } catch (e) {
      console.error(e);
      if (e.message === 'Unauthorized') {
        setConfirmModal(null);
        navigate('/admin', { replace: true });
      } else {
        message.error('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    const label = STATUS_OPTIONS.find((o) => o.value === newStatus)?.label || newStatus;
    setConfirmModal({ orderId, newStatus, label });
  };

  const showDetail = async (order) => {
    setSelectedOrder(order);
    setPreviewSide('front');
    setDetailOpen(true);
    try {
      const t = await getBagTemplate(order.bagTemplateId);
      setTemplate(t);
    } catch {
      setTemplate(null);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Ngày', dataIndex: 'createdAt', key: 'date', render: (v) => v ? new Date(v).toLocaleString('vi-VN') : '-' },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'name' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'phone' },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'total', render: (v) => `${Number(v).toLocaleString('vi-VN')} ₫` },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          options={STATUS_OPTIONS}
          onChange={(v) => handleStatusChange(record.id, v)}
          style={{ width: 140 }}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, r) => <a onClick={() => showDetail(r)}>Chi tiết</a>,
    },
  ];

  const filterOptions = [{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS];

  return (
    <div className="order-management">
      <h1>Quản lý đơn hàng</h1>
      <div className="order-toolbar">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={filterOptions}
          placeholder="Lọc theo trạng thái"
          style={{ width: 180 }}
          allowClear
        />
        <Input.Search
          placeholder="Tìm ID, tên, SĐT, địa chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
      </div>
      <Table columns={columns} dataSource={filteredOrders} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      {/* Modal xác nhận đổi trạng thái */}
      <Modal
        title="Xác nhận đổi trạng thái"
        open={!!confirmModal}
        onCancel={() => !confirmLoading && setConfirmModal(null)}
        onOk={() => confirmModal && applyStatusChange(confirmModal.orderId, confirmModal.newStatus)}
        okText="Xác nhận"
        cancelText="Huỷ"
        confirmLoading={confirmLoading}
      >
        {confirmModal && (
          <span>
            Bạn có chắc muốn đổi trạng thái đơn <strong>#{confirmModal.orderId}</strong> thành &quot;{confirmModal.label}&quot;?
          </span>
        )}
      </Modal>

      <Modal
        title={`Đơn #${selectedOrder?.id}`}
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedOrder(null); setTemplate(null); }}
        footer={null}
        width={860}
      >
        {selectedOrder && (
          <div className="order-detail-layout">
            {/* Left: design preview */}
            <div className="order-detail-preview">
              {/* Main canvas — click to zoom */}
              <div
                className="order-preview-canvas-box"
                title="Click để phóng to"
                onClick={() => template && setZoomOpen(true)}
              >
                {template ? (
                  <DesignPreviewCanvas
                    template={template}
                    designSnapshot={selectedOrder.designSnapshot}
                    activeSide={previewSide}
                  />
                ) : (
                  <div className="order-preview-placeholder">Đang tải...</div>
                )}
                {template && <div className="order-zoom-hint">🔍 Click để phóng to</div>}
              </div>

              {/* Side toggle — mini snapshots */}
              <div className="order-preview-sides">
                <button
                  className={`order-side-btn${previewSide === 'front' ? ' active' : ''}`}
                  onClick={() => setPreviewSide('front')}
                >
                  <MiniPreview side="front" size={52} />
                  <span>Mặt trước</span>
                </button>
                {template?.backImageUrl && (
                  <button
                    className={`order-side-btn${previewSide === 'back' ? ' active' : ''}`}
                    onClick={() => setPreviewSide('back')}
                  >
                    <MiniPreview side="back" size={52} />
                    <span>Mặt sau</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: order info */}
            <div className="order-detail-info">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{selectedOrder.customerPhone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{selectedOrder.customerAddress}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedOrder.customerEmail || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mẫu túi">{template?.name || `#${selectedOrder.bagTemplateId}`}</Descriptions.Item>
                <Descriptions.Item label="Số lượng">{selectedOrder.quantity}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{Number(selectedOrder.totalPrice).toLocaleString('vi-VN')} ₫</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Select
                    value={selectedOrder.status}
                    options={STATUS_OPTIONS}
                    onChange={(v) => handleStatusChange(selectedOrder.id, v)}
                    style={{ width: 160 }}
                  />
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Modal>

      {/* Zoom modal */}
      <Modal
        open={zoomOpen}
        onCancel={() => setZoomOpen(false)}
        footer={null}
        width={700}
        centered
        title={`Preview — ${previewSide === 'front' ? 'Mặt trước' : 'Mặt sau'}`}
      >
        {template && selectedOrder && (
          <div className="order-zoom-modal-body">
            <div className="order-zoom-canvas-box">
              <DesignPreviewCanvas
                template={template}
                designSnapshot={selectedOrder.designSnapshot}
                activeSide={previewSide}
              />
            </div>
            <div className="order-zoom-side-switch">
              <button
                className={`order-side-btn${previewSide === 'front' ? ' active' : ''}`}
                onClick={() => setPreviewSide('front')}
              >
                <MiniPreview side="front" size={52} />
                <span>Mặt trước</span>
              </button>
              {template.backImageUrl && (
                <button
                  className={`order-side-btn${previewSide === 'back' ? ' active' : ''}`}
                  onClick={() => setPreviewSide('back')}
                >
                  <MiniPreview side="back" size={52} />
                  <span>Mặt sau</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
