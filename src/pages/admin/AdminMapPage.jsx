// src/pages/AdminMapPage.jsx
import React, { useState } from 'react'
import { 
  Card, Table, Button, Tag, Space, Typography, Row, Col, 
  Modal, Form, Input, InputNumber, Select, message, Popconfirm, 
  Tabs, Statistic, Flex, Progress, Cascader
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  EnvironmentOutlined, TeamOutlined, InboxOutlined
} from '@ant-design/icons'
import { useMaterialData } from '../context/MaterialDataContext'
import { mekongProvinces, getCoordinates } from '../data/vietnamLocations'

const { Title, Text } = Typography
const { Option } = Select

export default function AdminMapPage() {
  const { zones, farmers, points, addZone, updateZone, deleteZone, addFarmer, updateFarmer, deleteFarmer, addPoint, updatePoint, deletePoint } = useMaterialData()
  const [activeTab, setActiveTab] = useState('zones')
  
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [farmerModalOpen, setFarmerModalOpen] = useState(false)
  const [pointModalOpen, setPointModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [editingFarmer, setEditingFarmer] = useState(null)
  const [editingPoint, setEditingPoint] = useState(null)
  
  const [zoneForm] = Form.useForm()
  const [farmerForm] = Form.useForm()
  const [pointForm] = Form.useForm()

  // Chuyển đổi dữ liệu tỉnh/huyện cho Cascader
  const provinceOptions = mekongProvinces.map(province => ({
    value: province.name,
    label: province.name,
    children: province.districts.map(district => ({
      value: district,
      label: district
    }))
  }))

  // Xử lý khi chọn tỉnh/huyện
  const handleProvinceDistrictChange = (value) => {
    if (value && value.length >= 2) {
      const province = value[0];
      const district = value[1];
      const coords = getCoordinates(province, district);
      
      zoneForm.setFieldsValue({
        province: province,
        district: district,
        centerLat: coords.lat,
        centerLng: coords.lng
      });
    }
  }

  // Zone handlers
  const handleAddZone = () => {
    setEditingZone(null)
    zoneForm.resetFields()
    setZoneModalOpen(true)
  }

  const handleEditZone = (record) => {
    setEditingZone(record)
    zoneForm.setFieldsValue(record)
    setZoneModalOpen(true)
  }

  const handleDeleteZone = (id) => {
    deleteZone(id)
      .then(() => message.success('Đã xóa vùng nguyên liệu'))
      .catch((err) => {
        console.error(err)
        message.error(err?.message || 'Xóa vùng nguyên liệu thất bại')
      })
  }

  const handleSaveZone = async () => {
    try {
      const values = await zoneForm.validateFields()
      
      // Xử lý dữ liệu từ Cascader
      let zoneData = { ...values }
      
      // Nếu có location từ Cascader, tách ra province và district
      if (values.location && values.location.length >= 2) {
        const province = values.location[0];
        const district = values.location[1];
        const coords = getCoordinates(province, district);
        
        zoneData.province = province;
        zoneData.district = district;
        zoneData.centerLat = coords.lat;
        zoneData.centerLng = coords.lng;
      }
      
      // Xóa trường location và provinceDisplay vì không cần thiết
      delete zoneData.location;
      delete zoneData.provinceDisplay;
      
      if (editingZone) {
        await updateZone(editingZone.id, zoneData)
        message.success('Đã cập nhật vùng nguyên liệu')
      } else {
        await addZone(zoneData)
        message.success('Đã thêm vùng nguyên liệu mới')
      }
      setZoneModalOpen(false)
    } catch (err) {
      console.error(err)
      message.error(err?.message || 'Lưu vùng nguyên liệu thất bại')
    }
  }

  // Farmer handlers
  const handleAddFarmer = () => {
    setEditingFarmer(null)
    farmerForm.resetFields()
    setFarmerModalOpen(true)
  }

  const handleEditFarmer = (record) => {
    setEditingFarmer(record)
    farmerForm.setFieldsValue(record)
    setFarmerModalOpen(true)
  }

  const handleDeleteFarmer = (id) => {
    deleteFarmer(id)
    message.success('Đã xóa hộ dân')
  }

  const handleSaveFarmer = async () => {
    try {
      const values = await farmerForm.validateFields()
      if (editingFarmer) {
        updateFarmer(editingFarmer.id, values)
        message.success('Đã cập nhật hộ dân')
      } else {
        addFarmer(values)
        message.success('Đã thêm hộ dân mới')
      }
      setFarmerModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  // Point handlers
  const handleAddPoint = () => {
    setEditingPoint(null)
    pointForm.resetFields()
    setPointModalOpen(true)
  }

  // Tự động điền tọa độ khi chọn vùng
  const handlePointZoneChange = (zoneId) => {
    if (zoneId) {
      const zone = zones.find(z => z.id === zoneId)
      if (zone && zone.center && zone.center.length === 2) {
        pointForm.setFieldsValue({
          coordinatesLat: zone.center[0],
          coordinatesLng: zone.center[1]
        })
      }
    }
  }

  const handleEditPoint = (record) => {
    setEditingPoint(record)
    pointForm.setFieldsValue(record)
    setPointModalOpen(true)
  }

  const handleDeletePoint = (id) => {
    deletePoint(id)
    message.success('Đã xóa điểm thu gom')
  }

  const handleSavePoint = async () => {
    try {
      const values = await pointForm.validateFields()
      if (editingPoint) {
        updatePoint(editingPoint.id, values)
        message.success('Đã cập nhật điểm thu gom')
      } else {
        addPoint(values)
        message.success('Đã thêm điểm thu gom mới')
      }
      setPointModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  // State cho geocoding
  const [geocodeLoading, setGeocodeLoading] = useState(false)

  // Hàm lấy tọa độ từ địa chỉ sử dụng Nominatim (OpenStreetMap)
  const handleGetCoordinatesFromAddress = async () => {
    const address = pointForm.getFieldValue('address')
    if (!address) {
      message.warning('Vui lòng nhập địa chỉ trước')
      return
    }

    setGeocodeLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Vietnam')}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        pointForm.setFieldsValue({
          coordinatesLat: parseFloat(lat),
          coordinatesLng: parseFloat(lon)
        })
        message.success('Đã lấy tọa độ từ địa chỉ')
      } else {
        message.warning('Không tìm thấy tọa độ cho địa chỉ này. Vui lòng nhập thủ công.')
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      message.error('Lỗi khi lấy tọa độ. Vui lòng nhập thủ công.')
    } finally {
      setGeocodeLoading(false)
    }
  }

  const zoneColumns = [
    { title: 'Tên vùng', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Quận/Huyện', dataIndex: 'district', key: 'district' },
    { title: 'Công suất (tấn/năm)', dataIndex: 'capacity', key: 'capacity', render: (v) => `${v}` },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (s) => <Tag color={s === 'active' ? 'green' : 'orange'}>{s === 'active' ? 'Hoạt động' : 'Quy hoạch'}</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditZone(record)} />
          <Popconfirm title="Xóa vùng này?" onConfirm={() => handleDeleteZone(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const farmerColumns = [
    { title: 'Tên hộ dân', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { 
      title: 'Vùng', 
      dataIndex: 'zoneId', 
      key: 'zoneId',
      render: (zoneId) => {
        const zone = zones.find(z => z.id === zoneId)
        return zone ? <Tag color="green">{zone.name}</Tag> : '-'
      }
    },
    { title: 'Công suất', dataIndex: 'capacity', key: 'capacity', render: (v) => `${v} tấn/năm` },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (s) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? 'Hoạt động' : 'Ngừng'}</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditFarmer(record)} />
          <Popconfirm title="Xóa hộ dân này?" onConfirm={() => handleDeleteFarmer(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const pointColumns = [
    { title: 'Tên điểm thu gom', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { 
      title: 'Vùng', 
      dataIndex: 'zoneId', 
      key: 'zoneId',
      render: (zoneId) => {
        const zone = zones.find(z => z.id === zoneId)
        return zone ? <Tag color="green">{zone.name}</Tag> : '-'
      }
    },
    { 
      title: 'Tồn kho', 
      key: 'stock',
      render: (_, record) => (
        <Flex align="center" gap={8}>
          <Progress 
            percent={Math.round(record.currentStock / record.capacity * 100)} 
            size="small" 
            style={{ width: 60 }}
            strokeColor={record.currentStock / record.capacity >= 0.8 ? '#f5222d' : record.currentStock / record.capacity >= 0.5 ? '#faad14' : '#52c41a'}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.currentStock}/{record.capacity}t</Text>
        </Flex>
      )
    },
    { title: 'Quản lý', dataIndex: 'manager', key: 'manager' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditPoint(record)} />
          <Popconfirm title="Xóa điểm thu gom này?" onConfirm={() => handleDeletePoint(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <EnvironmentOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <span>Quản lý Vùng Nguyên liệu</span>
        </Title>
        <Text type="secondary">Quản lý vùng nguyên liệu, hộ dân và điểm thu gom trên toàn hệ thống</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Flex align="center" gap={16}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <EnvironmentOutlined style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Tổng vùng</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{zones.length}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{zones.filter(z => z.status === 'active').length} đang hoạt động</Text>
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Flex align="center" gap={16}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <TeamOutlined style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Tổng hộ dân</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>{farmers.length}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{farmers.filter(f => f.status === 'active').length} đang hoạt động</Text>
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Flex align="center" gap={16}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <InboxOutlined style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Điểm thu gom</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#faad14' }}>{points.length}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{points.filter(p => p.currentStock > 0).length} có hàng</Text>
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Flex align="center" gap={16}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <InboxOutlined style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Tổng công suất</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#722ed1' }}>{zones.reduce((sum, z) => sum + z.capacity, 0)}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>tấn/năm</Text>
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'zones',
              label: <span><EnvironmentOutlined /> Vùng nguyên liệu ({zones.length})</span>,
              children: (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 15 }}>Danh sách vùng nguyên liệu</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddZone} style={{ borderRadius: 8 }}>
                      Thêm vùng
                    </Button>
                  </Flex>
                  <Table 
                    dataSource={zones} 
                    columns={zoneColumns} 
                    rowKey="id" 
                    pagination={false}
                    style={{ borderRadius: 8 }}
                  />
                </div>
              )
            },
            {
              key: 'farmers',
              label: <span><TeamOutlined /> Hộ dân ({farmers.length})</span>,
              children: (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 15 }}>Danh sách hộ dân</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFarmer} style={{ borderRadius: 8 }}>
                      Thêm hộ dân
                    </Button>
                  </Flex>
                  <Table 
                    dataSource={farmers} 
                    columns={farmerColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              )
            },
            {
              key: 'points',
              label: <span><InboxOutlined /> Điểm thu gom ({points.length})</span>,
              children: (
                <div>
                  <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 15 }}>Danh sách điểm thu gom</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPoint} style={{ borderRadius: 8 }}>
                      Thêm điểm
                    </Button>
                  </Flex>
                  <Table 
                    dataSource={points} 
                    columns={pointColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Zone Modal */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <EnvironmentOutlined style={{ color: '#52c41a' }} />
            <span>{editingZone ? 'Sửa vùng nguyên liệu' : 'Thêm vùng nguyên liệu'}</span>
          </Flex>
        }
        open={zoneModalOpen}
        onCancel={() => setZoneModalOpen(false)}
        onOk={handleSaveZone}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        width={600}
      >
        <Form form={zoneForm} layout="vertical">
          <Form.Item name="name" label="Tên vùng" rules={[{ required: true, message: 'Nhập tên vùng' }]}>
            <Input placeholder="Ví dụ: Vùng Đồng Tháp Mười" />
          </Form.Item>
          
          <Form.Item 
            name="location" 
            label="Tỉnh / Huyện" 
            rules={[{ required: true, message: 'Chọn tỉnh và huyện' }]}
            tooltip="Chọn tỉnh/thành phố và quận/huyện từ danh sách"
          >
            <Cascader
              options={provinceOptions}
              placeholder="Chọn tỉnh và huyện"
              onChange={handleProvinceDistrictChange}
              style={{ width: '100%' }}
              size="large"
              showSearch={{
                filter: (input, path) =>
                  path.some(option => option.label.toLowerCase().includes(input.toLowerCase())),
              }}
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="province" label="Tỉnh" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="provinceDisplay" label="Tỉnh">
                <Input placeholder="Tự động từ dropdown trên" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Nhập quận/huyện' }]}>
                <Input placeholder="Tự động từ dropdown trên" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="area" label="Diện tích (ha)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="Công suất (tấn/năm)" rules={[{ required: true, message: 'Nhập công suất' }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="500" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="centerLat" label="Vĩ độ (Latitude)" tooltip="Tự động điền khi chọn tỉnh/huyện">
                <InputNumber step={0.0001} style={{ width: '100%' }} placeholder="10.0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="centerLng" label="Kinh độ (Longitude)" tooltip="Tự động điền khi chọn tỉnh/huyện">
                <InputNumber step={0.0001} style={{ width: '100%' }} placeholder="105.5" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="planning">Quy hoạch</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Farmer Modal */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>{editingFarmer ? 'Sửa hộ dân' : 'Thêm hộ dân'}</span>
          </Flex>
        }
        open={farmerModalOpen}
        onCancel={() => setFarmerModalOpen(false)}
        onOk={handleSaveFarmer}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={farmerForm} layout="vertical">
          <Form.Item name="name" label="Tên hộ dân" rules={[{ required: true, message: 'Nhập tên hộ dân' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
            <Input placeholder="Xã Tân Phước, Tam Nông" />
          </Form.Item>
          <Form.Item name="zoneId" label="Vùng" rules={[{ required: true, message: 'Chọn vùng' }]}>
            <Select placeholder="Chọn vùng">
              {zones.map(zone => (
                <Option key={zone.id} value={zone.id}>{zone.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="capacity" label="Công suất (tấn/năm)" rules={[{ required: true, message: 'Nhập công suất' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="10" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Point Modal */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <InboxOutlined style={{ color: '#faad14' }} />
            <span>{editingPoint ? 'Sửa điểm thu gom' : 'Thêm điểm thu gom'}</span>
          </Flex>
        }
        open={pointModalOpen}
        onCancel={() => setPointModalOpen(false)}
        onOk={handleSavePoint}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={pointForm} layout="vertical">
          <Form.Item name="name" label="Tên điểm thu gom" rules={[{ required: true, message: 'Nhập tên điểm' }]}>
            <Input placeholder="Kho Tam Nông" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
            <Input placeholder="Tam Nông, Đồng Tháp" />
          </Form.Item>
          <Button 
            type="dashed" 
            onClick={handleGetCoordinatesFromAddress}
            loading={geocodeLoading}
            style={{ marginBottom: 16 }}
            icon={<EnvironmentOutlined />}
          >
            Lấy tọa độ từ địa chỉ
          </Button>
          <Form.Item name="zoneId" label="Vùng" rules={[{ required: true, message: 'Chọn vùng' }]}>
            <Select 
              placeholder="Chọn vùng"
              onChange={handlePointZoneChange}
            >
              {zones.map(zone => (
                <Option key={zone.id} value={zone.id}>{zone.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="coordinatesLat" label="Vĩ độ (Latitude)" rules={[{ required: true, message: 'Nhập vĩ độ' }]}>
                <InputNumber 
                  step={0.0001} 
                  style={{ width: '100%' }} 
                  placeholder="10.2456"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="coordinatesLng" label="Kinh độ (Longitude)" rules={[{ required: true, message: 'Nhập kinh độ' }]}>
                <InputNumber 
                  step={0.0001} 
                  style={{ width: '100%' }} 
                  placeholder="105.8231"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="capacity" label="Dung tích (tấn)" rules={[{ required: true, message: 'Nhập dung tích' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="50" />
          </Form.Item>
          <Form.Item name="currentStock" label="Tồn kho hiện tại (tấn)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="manager" label="Người quản lý" rules={[{ required: true, message: 'Nhập tên người quản lý' }]}>
            <Input placeholder="Mr. Tùng" />
          </Form.Item>
          <Form.Item name="phone" label="Điện thoại">
            <Input placeholder="0123456789" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="planning">Quy hoạch</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
