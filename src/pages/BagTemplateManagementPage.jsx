import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Image,
  Popconfirm,
  Upload,
  Switch,
  Steps,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, PictureOutlined, SettingOutlined } from '@ant-design/icons';
import {
  adminGetBagTemplates,
  adminCreateBagTemplate,
  adminUpdateBagTemplate,
  adminDeleteBagTemplate,
} from '../services/bagTemplate';
import ImageAreaSelector from '../components/ImageAreaSelector';
import './BagTemplateManagementPage.css';

const DEFAULT_CUSTOM_AREA = { x: 10, y: 10, width: 80, height: 80 };
const STEPS = [
  { key: 'info', title: 'Thông tin cơ bản', icon: <UserOutlined /> },
  { key: 'front', title: 'Ảnh mặt trước', icon: <PictureOutlined /> },
  { key: 'back', title: 'Ảnh mặt sau', icon: <PictureOutlined /> },
  { key: 'config', title: 'Cấu hình', icon: <SettingOutlined /> },
];

export default function BagTemplateManagementPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const frontFileList = Form.useWatch('frontImage', form);
  const backFileList = Form.useWatch('backImage', form);

  const [frontBlobUrl, setFrontBlobUrl] = useState(null);
  const [backBlobUrl, setBackBlobUrl] = useState(null);

  useEffect(() => {
    if (frontFileList?.[0]?.originFileObj) {
      const url = URL.createObjectURL(frontFileList[0].originFileObj);
      setFrontBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFrontBlobUrl(null);
  }, [frontFileList?.[0]?.originFileObj]);

  useEffect(() => {
    if (backFileList?.[0]?.originFileObj) {
      const url = URL.createObjectURL(backFileList[0].originFileObj);
      setBackBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBackBlobUrl(null);
  }, [backFileList?.[0]?.originFileObj]);

  const frontImageUrl = frontBlobUrl || editingRecord?.frontImageUrl;
  const backImageUrl = backBlobUrl || editingRecord?.backImageUrl;

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetBagTemplates();
      setTemplates(data);
    } catch (e) {
      if (e.message === 'Unauthorized') navigate('/admin', { replace: true });
      else message.error('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const frontFile = values.frontImage?.[0]?.originFileObj;
      const backFile = values.backImage?.[0]?.originFileObj;
      if (!editingId && (!frontFile || !backFile)) {
        message.error('Cần ảnh mặt trước và mặt sau');
        return;
      }
      setUploading(true);
      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('basePrice', values.basePrice);
      fd.append('frontCustomArea', typeof values.frontCustomArea === 'object' ? JSON.stringify(values.frontCustomArea) : values.frontCustomArea || JSON.stringify(DEFAULT_CUSTOM_AREA));
      fd.append('backCustomArea', typeof values.backCustomArea === 'object' ? JSON.stringify(values.backCustomArea) : values.backCustomArea || JSON.stringify(DEFAULT_CUSTOM_AREA));
      fd.append('active', values.active ?? true);
      if (values.previewConfig) fd.append('previewConfig', values.previewConfig);
      if (frontFile) fd.append('frontImage', frontFile);
      if (backFile) fd.append('backImage', backFile);

      if (editingId) {
        await adminUpdateBagTemplate(editingId, fd);
        message.success('Cập nhật thành công');
      } else {
        await adminCreateBagTemplate(fd);
        message.success('Thêm mẫu thành công');
      }
      setModalOpen(false);
      setEditingId(null);
      setEditingRecord(null);
      setCurrentStep(0);
      form.resetFields();
      loadTemplates();
    } catch (e) {
      if (e.errorFields?.length) {
        const first = e.errorFields[0];
        const firstError = first?.errors?.[0];
        message.error(firstError || 'Vui lòng kiểm tra lại thông tin');
        const fieldName = first?.name?.[0];
        const stepMap = { name: 0, basePrice: 0, frontImage: 1, frontCustomArea: 1, backImage: 2, backCustomArea: 2 };
        const errStep = stepMap[fieldName];
        if (typeof errStep === 'number') setCurrentStep(errStep);
        return;
      }
      message.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const parseCustomArea = (val) => {
    if (!val) return { ...DEFAULT_CUSTOM_AREA };
    if (typeof val === 'object') return { ...DEFAULT_CUSTOM_AREA, ...val };
    try {
      return { ...DEFAULT_CUSTOM_AREA, ...JSON.parse(val) };
    } catch {
      return { ...DEFAULT_CUSTOM_AREA };
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditingRecord(record);
    setCurrentStep(0);
    form.setFieldsValue({
      name: record.name,
      basePrice: record.basePrice,
      frontCustomArea: parseCustomArea(record.frontCustomArea),
      backCustomArea: parseCustomArea(record.backCustomArea),
      previewConfig: record.previewConfig || '',
      active: record.active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteBagTemplate(id);
      message.success('Đã xóa');
      loadTemplates();
    } catch (e) {
      message.error('Không thể xóa');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setEditingRecord(null);
    setCurrentStep(0);
    form.resetFields();
    form.setFieldsValue({
      frontCustomArea: { ...DEFAULT_CUSTOM_AREA },
      backCustomArea: { ...DEFAULT_CUSTOM_AREA },
      active: true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setEditingRecord(null);
    setCurrentStep(0);
    form.resetFields();
  };

  const stepFields = [['name', 'basePrice'], ['frontImage', 'frontCustomArea'], ['backImage', 'backCustomArea'], []];

  const goNext = async () => {
    const fields = stepFields[currentStep];
    if (fields.length) {
      try {
        await form.validateFields(fields);
      } catch {
        return;
      }
    }
    setCurrentStep((s) => s + 1);
  };

  const columns = [
    { title: 'Ảnh', dataIndex: 'frontImageUrl', key: 'img', width: 80, render: (u) => <Image src={u} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} /> },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Giá', dataIndex: 'basePrice', key: 'price', render: (v) => `${Number(v).toLocaleString('vi-VN')} ₫` },
    { title: 'Hiển thị', dataIndex: 'active', key: 'active', render: (v) => (v ? 'Có' : 'Ẩn') },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa mẫu này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderStepContent = () => {
    const hidden = { display: 'none' };
    return (
      <>
        <div style={currentStep !== 0 ? hidden : undefined}>
          <Form.Item name="name" label="Tên mẫu" rules={[{ required: true, message: 'Nhập tên mẫu' }]}>
            <Input placeholder="VD: Jumbo Tote" />
          </Form.Item>
          <Form.Item name="basePrice" label="Giá (VNĐ)" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="100000" addonAfter="₫" />
          </Form.Item>
        </div>
        <div style={currentStep !== 1 ? hidden : undefined}>
          <Form.Item
            name="frontImage"
            label="Ảnh mặt trước"
            rules={editingId ? [] : [{ required: true, message: 'Chọn ảnh mặt trước' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => (e?.fileList ? [e.fileList[e.fileList.length - 1]] : [])}
          >
            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
              <div><PlusOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
            </Upload>
          </Form.Item>
          <Form.Item name="frontCustomArea" label="Vùng custom mặt trước — kéo khung trên ảnh để chỉnh vị trí và kích thước">
            <ImageAreaSelector key={`front-${currentStep}`} imageUrl={frontImageUrl} />
          </Form.Item>
        </div>
        <div style={currentStep !== 2 ? hidden : undefined}>
          <Form.Item
            name="backImage"
            label="Ảnh mặt sau"
            rules={editingId ? [] : [{ required: true, message: 'Chọn ảnh mặt sau' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => (e?.fileList ? [e.fileList[e.fileList.length - 1]] : [])}
          >
            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
              <div><PlusOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
            </Upload>
          </Form.Item>
          <Form.Item name="backCustomArea" label="Vùng custom mặt sau — kéo khung trên ảnh để chỉnh vị trí và kích thước">
            <ImageAreaSelector key={`back-${currentStep}`} imageUrl={backImageUrl} />
          </Form.Item>
        </div>
        <div style={currentStep !== 3 ? hidden : undefined}>
          <Form.Item name="previewConfig" label="Preview config (JSON, tùy chọn)">
            <Input.TextArea rows={3} placeholder='[{"imageUrl":"...","customArea":{"x":10,"y":10,"width":80,"height":80}}]' />
          </Form.Item>
          <Form.Item name="active" label="Hiển thị mẫu" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </>
    );
  };

  return (
    <div className="bag-template-management">
      <header className="bag-template-header">
        <h1>Quản lý mẫu túi</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm mẫu
        </Button>
      </header>
      <Table columns={columns} dataSource={templates} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={editingId ? 'Sửa mẫu túi' : 'Thêm mẫu túi'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={uploading}
        okText={editingId ? 'Cập nhật' : 'Thêm'}
        width={680}
        footer={[
          <Button key="cancel" onClick={closeModal}>Hủy</Button>,
          currentStep > 0 ? (
            <Button key="back" onClick={() => setCurrentStep((s) => s - 1)}>Quay lại</Button>
          ) : null,
          currentStep < STEPS.length - 1 ? (
            <Button key="next" type="primary" onClick={goNext}>Tiếp theo</Button>
          ) : (
            <Button key="submit" type="primary" loading={uploading} onClick={handleSubmit}>
              {editingId ? 'Cập nhật' : 'Thêm'}
            </Button>
          ),
        ].filter(Boolean)}
      >
        <Steps current={currentStep} className="bag-template-steps" size="small">
          {STEPS.map((s, i) => (
            <Steps.Step key={s.key} title={s.title} icon={s.icon} />
          ))}
        </Steps>
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          {renderStepContent()}
        </Form>
      </Modal>
    </div>
  );
}
