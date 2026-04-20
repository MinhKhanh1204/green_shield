import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Image,
  Popconfirm,
  Upload,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  getTextures,
  createTexture,
  updateTexture,
  deleteTexture,
} from '../services/texture';
import './TextureManagementPage.css';

export default function TextureManagementPage() {
  const [textures, setTextures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const loadTextures = useCallback(async (searchTerm = search) => {
    setLoading(true);
    try {
      const data = await getTextures(searchTerm);
      setTextures(data);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        navigate('/admin', { replace: true });
      } else {
        message.error('Không thể tải danh sách');
      }
    } finally {
      setLoading(false);
    }
  }, [search, navigate]);

  const searchTimer = useRef(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadTextures(search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search, loadTextures]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const file = values.imageFile?.[0]?.originFileObj;
      if (!file) {
        message.error('Vui lòng chọn ảnh');
        return;
      }
      setUploading(true);
      await createTexture(file, values.name || '');
      message.success('Thêm texture thành công');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadTextures();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    editForm.setFieldsValue({ name: record.name });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      setUploading(true);
      await updateTexture(editingId, { name: values.name });
      message.success('Cập nhật thành công');
      setEditModalOpen(false);
      setEditingId(null);
      editForm.resetFields();
      loadTextures();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTexture(id);
      message.success('Đã xóa');
      loadTextures();
    } catch {
      message.error('Không thể xóa');
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url) => (
        <Image src={url} alt={url} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (n) => n || '(Chưa đặt tên)',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa texture này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="texture-management">
      <header className="texture-header">
        <h1>Quản lý Texture</h1>
        <Space>
          <Input
            placeholder="Tìm theo tên..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Thêm texture
          </Button>
        </Space>
      </header>

      <Table
        columns={columns}
        dataSource={textures}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Thêm texture"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => setCreateModalOpen(false)}
        confirmLoading={uploading}
        okText="Thêm"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="imageFile"
            label="Ảnh"
            rules={[{ required: true, message: 'Chọn ảnh' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => (e?.fileList ? [e.fileList[e.fileList.length - 1]] : [])}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item name="name" label="Tên (tùy chọn)">
            <Input placeholder="Tên texture" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Sửa texture"
        open={editModalOpen}
        onOk={handleUpdate}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingId(null);
          editForm.resetFields();
        }}
        confirmLoading={uploading}
        okText="Cập nhật"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Tên">
            <Input placeholder="Tên texture" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
