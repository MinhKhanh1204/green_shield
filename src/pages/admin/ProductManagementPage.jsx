import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag, Upload, message } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, QrcodeOutlined, StarFilled, StarOutlined, UploadOutlined } from '@ant-design/icons'
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getAdminProducts,
  replaceProductMaterialZones,
  reorderProductImages,
  resolveProductAssetUrl,
  setMainProductImage,
  updateProduct,
  updateProductFeatured,
  updateProductImage,
  updateProductStatus,
  uploadProductImages,
} from '../../services/product'
import { getAllZones } from '../../services/materialZoneApi'
import ProductTraceQr from '../../components/ProductTraceQr'
import { downloadProductTraceQr } from '../../utils/productTraceQr'
import './ProductManagementPage.css'

const { TextArea } = Input
const CATEGORY_OPTIONS = ['PACKAGING', 'TABLEWARE', 'LIFESTYLE'].map((value) => ({ value, label: value }))
const SALE_MODE_OPTIONS = ['COMBO', 'RETAIL', 'B2B', 'COMBO_AND_B2B', 'RETAIL_AND_B2B'].map((value) => ({ value, label: value }))
const IMAGE_TYPE_OPTIONS = ['HERO', 'GALLERY', 'APPLICATION', 'DETAIL'].map((value) => ({ value, label: value }))
const LIST_FIELDS = ['benefitsVi', 'benefitsEn', 'applicationsVi', 'applicationsEn', 'specificationsVi', 'specificationsEn']
const DEFAULT_VALUES = { category: 'PACKAGING', saleMode: 'RETAIL_AND_B2B', domesticUnitPrice: 1000, exportUnitPrice: 1000, featured: false, active: true, displayOrder: 0 }

const toLines = (value) => (Array.isArray(value) ? value.join('\n') : value || '')
const fromLines = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean)

function formValuesFromProduct(product) {
  if (!product) return DEFAULT_VALUES
  const values = { ...product }
  LIST_FIELDS.forEach((field) => { values[field] = toLines(product[field]) })
  return values
}

function payloadFromValues(values) {
  const payload = { ...values }
  LIST_FIELDS.forEach((field) => { payload[field] = fromLines(values[field]) })
  ;['comboQuantity', 'domesticComboPrice', 'minimumOrderQuantity'].forEach((field) => {
    if (payload[field] === '' || payload[field] === undefined) payload[field] = null
  })
  return payload
}

function ProductLanguageFields({ language }) {
  const suffix = language === 'vi' ? 'Vi' : 'En'
  const label = language === 'vi' ? 'Tiếng Việt' : 'English'
  return (
    <div className="product-admin-form-grid">
      <Form.Item name={`name${suffix}`} label={`Tên (${label})`} rules={[{ required: true }]}><Input maxLength={180} /></Form.Item>
      <Form.Item name={`material${suffix}`} label={`Chất liệu (${label})`} rules={[{ required: true }]}><Input maxLength={255} /></Form.Item>
      <Form.Item className="product-admin-form-grid__full" name={`shortDescription${suffix}`} label={`Mô tả ngắn (${label})`} rules={[{ required: true }]}><TextArea rows={2} maxLength={500} showCount /></Form.Item>
      <Form.Item className="product-admin-form-grid__full" name={`description${suffix}`} label={`Mô tả đầy đủ (${label})`} rules={[{ required: true }]}><TextArea rows={5} /></Form.Item>
      <Form.Item name={`benefits${suffix}`} label={`Lợi ích (${label}, mỗi dòng một ý)`}><TextArea rows={5} /></Form.Item>
      <Form.Item name={`applications${suffix}`} label={`Ứng dụng (${label}, mỗi dòng một ý)`}><TextArea rows={5} /></Form.Item>
      <Form.Item className="product-admin-form-grid__full" name={`specifications${suffix}`} label={`Thông số (${label}, mỗi dòng một ý)`}><TextArea rows={4} /></Form.Item>
    </div>
  )
}

function ProductImageManager({ product, onChanged }) {
  const [uploading, setUploading] = useState(false)
  const processedUploadIdsRef = useRef(new Set())
  const pendingUploadCountRef = useRef(0)
  const images = useMemo(() => [...(product?.images || [])].sort((a, b) => a.sortOrder - b.sortOrder), [product])

  const upload = async ({ file }) => {
    const sourceFile = file.originFileObj || file
    const uploadId = file.uid || `${sourceFile.name}-${sourceFile.size}-${sourceFile.lastModified}`
    if (!sourceFile || processedUploadIdsRef.current.has(uploadId)) return

    // Ant Upload emits one event per file while fileList contains prior files too.
    processedUploadIdsRef.current.add(uploadId)
    pendingUploadCountRef.current += 1
    setUploading(true)
    try {
      await uploadProductImages(product.id, [sourceFile], { imageType: 'GALLERY' })
      message.success('Đã tải ảnh sản phẩm')
      await onChanged()
    } catch (error) {
      message.error(error.message)
    } finally {
      pendingUploadCountRef.current = Math.max(0, pendingUploadCountRef.current - 1)
      setUploading(pendingUploadCountRef.current > 0)
    }
  }

  const move = async (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const ids = images.map((image) => image.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    try {
      await reorderProductImages(product.id, ids)
      await onChanged()
    } catch (error) {
      message.error(error.message)
    }
  }

  const saveMetadata = async (image, values) => {
    try {
      await updateProductImage(product.id, image.id, values)
      message.success('Đã cập nhật thông tin ảnh')
      await onChanged()
    } catch (error) {
      message.error(error.message)
    }
  }

  const removeImage = async (image) => {
    try {
      await deleteProductImage(product.id, image.id)
      message.success('Đã xóa ảnh sản phẩm')
      await onChanged()
    } catch (error) {
      message.error(error.message)
    }
  }

  const makeMainImage = async (image) => {
    try {
      await setMainProductImage(product.id, image.id)
      message.success('Đã đặt ảnh chính')
      await onChanged()
    } catch (error) {
      message.error(error.message)
    }
  }

  return (
    <div className="product-image-manager">
      <Upload.Dragger accept="image/jpeg,image/png,image/webp" multiple maxCount={Math.max(1, 8 - images.length)} fileList={[]} beforeUpload={() => false} onChange={upload} showUploadList={false} disabled={uploading || images.length >= 8}>
        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
        <p>{uploading ? 'Đang tải ảnh...' : 'Kéo ảnh vào đây hoặc nhấn để chọn (tối đa 8 ảnh)'}</p>
      </Upload.Dragger>
      <div className="product-image-manager__list">
        {images.map((image, index) => (
          <div key={image.id} className="product-image-editor">
            <div className="product-image-editor__preview">
              <Image src={resolveProductAssetUrl(image.thumbnailUrl || image.imageUrl)} alt={image.altTextVi || ''} />
              {image.mainImage ? <Tag color="gold" icon={<StarFilled />}>Ảnh chính</Tag> : null}
            </div>
            <Form layout="vertical" initialValues={{ altTextVi: image.altTextVi, altTextEn: image.altTextEn, imageType: image.imageType }} onFinish={(values) => saveMetadata(image, values)}>
              <Form.Item name="altTextVi" label="Alt tiếng Việt" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="altTextEn" label="Alt English" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="imageType" label="Loại ảnh" rules={[{ required: true }]}><Select options={IMAGE_TYPE_OPTIONS} /></Form.Item>
              <Space wrap>
                <Button htmlType="submit" size="small">Lưu mô tả</Button>
                <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => move(index, -1)} />
                <Button size="small" icon={<ArrowDownOutlined />} disabled={index === images.length - 1} onClick={() => move(index, 1)} />
                <Button size="small" icon={image.mainImage ? <StarFilled /> : <StarOutlined />} disabled={image.mainImage} onClick={() => makeMainImage(image)}>Ảnh chính</Button>
                <Popconfirm title="Xóa ảnh này?" okText="Xóa" cancelText="Hủy" onConfirm={() => removeImage(image)}><Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button></Popconfirm>
              </Space>
            </Form>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductTraceabilityManager({ product, onChanged }) {
  const [zones, setZones] = useState([])
  const [selectedZoneIds, setSelectedZoneIds] = useState([])
  const [primaryZoneId, setPrimaryZoneId] = useState(null)
  const [loadingZones, setLoadingZones] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const assignments = [...(product?.materialZones || [])].sort((a, b) => a.displayOrder - b.displayOrder)
    setSelectedZoneIds(assignments.map((assignment) => assignment.zoneId))
    setPrimaryZoneId(assignments.find((assignment) => assignment.primarySource)?.zoneId || null)
  }, [product])

  useEffect(() => {
    let cancelled = false
    setLoadingZones(true)
    getAllZones()
      .then((data) => {
        if (!cancelled) setZones(Array.isArray(data) ? data.filter((zone) => !zone.deleted && zone.status === 'active') : [])
      })
      .catch((error) => {
        if (!cancelled) message.error(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingZones(false)
      })
    return () => { cancelled = true }
  }, [])

  const zoneOptions = zones.map((zone) => ({
    value: zone.id,
    label: `${zone.name} - ${zone.province || zone.district || 'Mekong'}`,
  }))
  const primaryOptions = zoneOptions.filter((option) => selectedZoneIds.includes(option.value))

  const handleZoneChange = (values) => {
    setSelectedZoneIds(values)
    if (!values.includes(primaryZoneId)) setPrimaryZoneId(values[0] || null)
  }

  const saveAssignments = async () => {
    if (selectedZoneIds.length && !primaryZoneId) {
      message.warning('Vui lòng chọn vùng nguyên liệu chính')
      return
    }
    setSaving(true)
    try {
      await replaceProductMaterialZones(product.id, {
        primaryZoneId: selectedZoneIds.length ? primaryZoneId : null,
        zoneIds: selectedZoneIds,
      })
      message.success('Đã cập nhật vùng nguyên liệu cho sản phẩm')
      await onChanged()
    } catch (error) {
      message.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const downloadQr = async (format) => {
    try {
      await downloadProductTraceQr(product.traceCode, format)
    } catch (error) {
      message.error(error.message)
    }
  }

  return (
    <div className="product-traceability-admin">
      <div className="product-traceability-admin__form">
        <div>
          <label>Vùng nguyên liệu</label>
          <Select
            mode="multiple"
            value={selectedZoneIds}
            options={zoneOptions}
            loading={loadingZones}
            onChange={handleZoneChange}
            placeholder="Chọn một hoặc nhiều vùng"
            optionFilterProp="label"
          />
        </div>
        <div>
          <label>Vùng chính</label>
          <Select
            value={primaryZoneId}
            options={primaryOptions}
            disabled={!selectedZoneIds.length}
            onChange={setPrimaryZoneId}
            placeholder="Chọn vùng được focus khi quét QR"
          />
        </div>
        <Button type="primary" loading={saving} onClick={saveAssignments}>Lưu nguồn gốc</Button>
      </div>

      <aside className="product-traceability-admin__preview">
        <div>
          <span>Mã truy xuất</span>
          <strong>{product.traceCode || 'Đang tạo mã'}</strong>
        </div>
        {product.traceabilityEnabled ? (
          <>
            <ProductTraceQr
              traceCode={product.traceCode}
              label="QR truy xuất nguồn gốc"
              className="product-traceability-admin__qr"
            />
            <Space wrap>
              <Button icon={<DownloadOutlined />} onClick={() => downloadQr('png')}>PNG</Button>
              <Button icon={<DownloadOutlined />} onClick={() => downloadQr('svg')}>SVG</Button>
            </Space>
          </>
        ) : (
          <div className="product-traceability-admin__empty">
            <QrcodeOutlined />
            <span>Hãy lưu ít nhất một vùng active để bật QR.</span>
          </div>
        )}
      </aside>
    </div>
  )
}

export default function ProductManagementPage() {
  const [form] = Form.useForm()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionKey, setActionKey] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminProducts()
      setProducts(Array.isArray(data) ? data : [])
      return data
    } catch (error) {
      message.error(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const openEditor = (product = null) => {
    setEditing(product)
    form.resetFields()
    form.setFieldsValue(formValuesFromProduct(product))
    setModalOpen(true)
  }

  const refreshEditing = async () => {
    const data = await loadProducts()
    if (!editing) return
    const refreshed = data.find((product) => product.id === editing.id)
    if (refreshed) setEditing(refreshed)
  }

  const runProductAction = async (key, action, successMessage) => {
    setActionKey(key)
    try {
      await action()
      if (successMessage) message.success(successMessage)
      await loadProducts()
    } catch (error) {
      message.error(error.message)
    } finally {
      setActionKey(null)
    }
  }

  const handleDelete = (product) => runProductAction(
    `delete-${product.id}`,
    async () => {
      await deleteProduct(product.id)
      if (editing?.id === product.id) {
        setEditing(null)
        setModalOpen(false)
      }
    },
    'Đã xóa sản phẩm',
  )

  const save = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const saved = editing ? await updateProduct(editing.id, payloadFromValues(values)) : await createProduct(payloadFromValues(values))
      message.success(editing ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm')
      setEditing(saved)
      await loadProducts()
      if (!editing) form.setFieldsValue(formValuesFromProduct(saved))
    } catch (error) {
      if (!error.errorFields) message.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'Sản phẩm', key: 'product', fixed: 'left', width: 300, render: (_, product) => { const main = product.images?.find((image) => image.mainImage); return <div className="product-admin-name">{main ? <img src={resolveProductAssetUrl(main.thumbnailUrl)} alt="" /> : <span />}<div><strong>{product.nameVi}</strong><small>{product.slug}</small></div></div> } },
    { title: 'Danh mục', dataIndex: 'category', width: 130, render: (value) => <Tag>{value}</Tag> },
    { title: 'Giá nội địa', dataIndex: 'domesticUnitPrice', width: 140, render: (value) => `${Number(value).toLocaleString('vi-VN')} đ` },
    { title: 'Hình thức bán', dataIndex: 'saleMode', width: 160 },
    { title: 'Hiển thị', dataIndex: 'active', width: 100, render: (active, product) => <Switch checked={active} loading={actionKey === `status-${product.id}`} onChange={(checked) => runProductAction(`status-${product.id}`, () => updateProductStatus(product.id, checked), checked ? 'Đã bật sản phẩm' : 'Đã tắt sản phẩm')} /> },
    { title: 'Nổi bật', dataIndex: 'featured', width: 100, render: (featured, product) => <Switch checked={featured} loading={actionKey === `featured-${product.id}`} onChange={(checked) => runProductAction(`featured-${product.id}`, () => updateProductFeatured(product.id, checked), checked ? 'Đã đánh dấu nổi bật' : 'Đã bỏ nổi bật')} /> },
    { title: 'Thứ tự', dataIndex: 'displayOrder', width: 80 },
    { title: 'Thao tác', key: 'actions', fixed: 'right', width: 190, render: (_, product) => <Space><Button icon={<EyeOutlined />} href={`/products/${product.slug}`} target="_blank" /><Button icon={<EditOutlined />} onClick={() => openEditor(product)} /><Popconfirm title="Xóa sản phẩm và toàn bộ ảnh?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(product)}><Button danger loading={actionKey === `delete-${product.id}`} icon={<DeleteOutlined />} /></Popconfirm></Space> },
  ]

  return (
    <div className="product-admin-page">
      <header className="product-admin-header"><div><p>GreenShield catalog</p><h1>Quản lý sản phẩm</h1></div><Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>Thêm sản phẩm</Button></header>
      <Table rowKey="id" columns={columns} dataSource={products} loading={loading} scroll={{ x: 1250 }} pagination={{ pageSize: 8, showSizeChanger: false }} />
      <Modal open={modalOpen} title={editing ? `Chỉnh sửa: ${editing.nameVi}` : 'Tạo sản phẩm'} width={1100} onCancel={() => setModalOpen(false)} footer={[<Button key="cancel" onClick={() => setModalOpen(false)}>Đóng</Button>, <Button key="save" type="primary" loading={saving} onClick={save}>Lưu sản phẩm</Button>]} destroyOnHidden>
        <Tabs items={[
          { key: 'general', label: 'Thông tin chung', children: <Form form={form} layout="vertical" initialValues={DEFAULT_VALUES}><div className="product-admin-form-grid product-admin-form-grid--compact"><Form.Item name="slug" label="Slug" rules={[{ required: true }, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Chỉ dùng chữ thường, số và dấu gạch ngang' }]}><Input /></Form.Item><Form.Item name="category" label="Danh mục" rules={[{ required: true }]}><Select options={CATEGORY_OPTIONS} /></Form.Item><Form.Item name="saleMode" label="Hình thức bán" rules={[{ required: true }]}><Select options={SALE_MODE_OPTIONS} /></Form.Item><Form.Item name="displayOrder" label="Thứ tự hiển thị" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item><Form.Item name="domesticUnitPrice" label="Giá nội địa / đơn vị" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item><Form.Item name="exportUnitPrice" label="Giá xuất khẩu / đơn vị" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item><Form.Item name="comboQuantity" label="Số lượng combo"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item><Form.Item name="domesticComboPrice" label="Giá combo"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item><Form.Item name="minimumOrderQuantity" label="Số lượng đặt tối thiểu"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item><Form.Item name="active" label="Đang hiển thị" valuePropName="checked"><Switch /></Form.Item><Form.Item name="featured" label="Sản phẩm nổi bật" valuePropName="checked"><Switch /></Form.Item></div><Tabs items={[{ key: 'vi', label: 'Tiếng Việt', children: <ProductLanguageFields language="vi" /> }, { key: 'en', label: 'English', children: <ProductLanguageFields language="en" /> }]} /></Form> },
          { key: 'images', label: `Hình ảnh (${editing?.images?.length || 0})`, disabled: !editing, children: editing ? <ProductImageManager product={editing} onChanged={refreshEditing} /> : null },
          { key: 'traceability', label: 'Nguồn gốc', disabled: !editing, children: editing ? <ProductTraceabilityManager product={editing} onChanged={refreshEditing} /> : null },
        ]} />
      </Modal>
    </div>
  )
}
