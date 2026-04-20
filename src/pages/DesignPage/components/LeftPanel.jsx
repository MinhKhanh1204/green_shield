import React from 'react';
import { Button, Tooltip, Upload } from 'antd';
import logo from '../../../assets/logo.png';

const TABS = [
  { key: 'text', icon: 'text_fields', label: 'Thêm chữ' },
  { key: 'image', icon: 'image', label: 'Thêm ảnh' },
  { key: 'texture', icon: 'texture', label: 'Texture' },
  { key: 'elements', icon: 'apps', label: 'Elements' },
  { key: 'greenai', icon: 'auto_awesome', label: 'AI Xanh' },
  { key: 'greenqr', icon: 'qr_code_2', label: 'QR Xanh' },
];

function LeftPanel({
  activeTab,
  leftSidebarWidth,
  setActiveTab,
  addText,
  addTextPreset,
  textPresets = [],
  addImage,
  greenAiPanel,
  greenQrPanel,
  textures = [],
  addTexture,
  iconList,
  addIconToCanvas,
  startResizePanel,
  activeObjectInfo,
  activeFillColor,
  activeBorderColor,
  updateActiveObjectStyle,
}) {
  const sidebarWidth = activeTab ? leftSidebarWidth : 72;
  const showTooltips = !activeTab;
  const hasEditableObject = Boolean(activeObjectInfo);
  const colorSwatches = ['#111827', '#475569', '#16a34a', '#22c55e', '#0ea5e9', '#7c3aed', '#ef4444', '#f59e0b', '#ffffff', 'transparent'];
  const textTips = [
    'Preset giúp lên bố cục nhanh như Canva rồi chỉnh tiếp trên canvas.',
    'Dùng tối đa 2 font để tổng thể gọn và rõ hierarchy.',
    'Shift + phím mũi tên để dịch nhanh đối tượng 10px.',
  ];
  const imageTips = [
    'Hỗ trợ PNG, JPG và WebP.',
    'PNG nền trong phù hợp nhất cho logo hoặc sticker.',
    'Ảnh sắc nét sẽ cho bản in tốt hơn ảnh chụp màn hình.',
  ];
  const iconTips = [
    'Biểu tượng thêm vào ngay vùng in và có thể đổi màu.',
    'Nên dùng 1 icon chính kèm một cụm chữ ngắn.',
    'Giữ số lượng icon vừa phải để mặt túi không bị rối.',
  ];

  const renderTabButton = ({ key, icon, label }) => {
    const isElementTab = key === 'elements';
    const isActive = isElementTab
      ? activeTab === 'elements' || activeTab === 'element' || activeTab === 'icon'
      : activeTab === key;
    const button = (
      <button
        className={`design-tab-btn${isActive ? ' active' : ''}`}
        onClick={() => setActiveTab(isActive ? null : key)}
      >
        <span className="design-tab-icon material-symbols-rounded">{icon}</span>
        <span className="design-tab-label">{label}</span>
      </button>
    );

    if (!showTooltips) return <React.Fragment key={key}>{button}</React.Fragment>;

    return (
      <Tooltip key={key} title={label} placement="right">
        {button}
      </Tooltip>
    );
  };

  const isColorTab = activeTab === 'color-fill' || activeTab === 'color-border';

  return (
    <>
      <aside className={`design-sidebar${activeTab ? ' is-resizable' : ''}`} style={{ width: sidebarWidth }}>
        <div className="design-tab-bar">
          <div className="sidebar-logo" onClick={() => { window.location.href = '/'; }}>
            <img src={logo} alt="GreenShield" />
          </div>
          {TABS.map(renderTabButton)}
        </div>

        {activeTab && (
          <div className={`design-tab-panel${activeTab === 'greenai' ? ' design-tab-panel--wide' : ''}`}>
            <div className="design-tab-panel-header">
              <span>
                {activeTab === 'text' && 'Thêm chữ vào thiết kế'}
                {activeTab === 'image' && 'Thêm ảnh'}
                {activeTab === 'texture' && 'Texture'}
                {(activeTab === 'elements' || activeTab === 'element' || activeTab === 'icon') && 'Elements'}
                {activeTab === 'greenai' && 'AI Xanh'}
                {activeTab === 'greenqr' && 'QR Xanh'}
                {activeTab === 'color-fill' && (activeObjectInfo?.type === 'i-text' ? 'Màu chữ' : 'Màu đối tượng')}
                {activeTab === 'color-border' && 'Màu viền'}
              </span>
              <button className="design-tab-panel-close" onClick={() => setActiveTab(null)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {isColorTab && (
              <div className="design-tab-panel-body">
                {!hasEditableObject ? (
                  <p className="panel-hint">Hãy chọn một đối tượng để chỉnh màu.</p>
                ) : (
                  <>
                    <p className="panel-section-title">Bảng màu nhanh</p>
                    <div className="swatch-grid">
                      {colorSwatches.map((c) => {
                        const isFillTab = activeTab === 'color-fill';
                        const currentColor = isFillTab ? activeFillColor : activeBorderColor;
                        const nextColor = c === 'transparent' ? 'transparent' : c;
                        const patch = isFillTab ? { fill: nextColor } : { stroke: nextColor };

                        return (
                          <button
                            key={c}
                            className={`swatch-dot${c === 'transparent' ? ' swatch-dot--none' : ''}${currentColor === nextColor ? ' selected' : ''}`}
                            style={c === 'transparent' ? undefined : { '--swatch-color': c }}
                            onClick={() => updateActiveObjectStyle?.(patch)}
                            aria-label={c === 'transparent' ? 'Trong suốt' : `Màu ${c}`}
                          />
                        );
                      })}
                    </div>

                    <p className="panel-section-title">Chọn màu chi tiết</p>
                    <input
                      type="color"
                      value={
                        activeTab === 'color-fill'
                          ? (activeFillColor && activeFillColor !== 'transparent' ? activeFillColor : '#22c55e')
                          : (activeBorderColor && activeBorderColor !== 'transparent' ? activeBorderColor : '#111827')
                      }
                      onChange={(e) => updateActiveObjectStyle?.(
                        activeTab === 'color-fill'
                          ? { fill: e.target.value }
                          : { stroke: e.target.value },
                      )}
                    />

                    {activeTab === 'color-border' && (
                      <>
                        <p className="panel-section-title">Độ dày viền</p>
                        <input
                          type="range"
                          min={0}
                          max={10}
                          step={1}
                          value={Number(activeObjectInfo?.strokeWidth ?? 0)}
                          onChange={(e) => updateActiveObjectStyle?.({ strokeWidth: Number(e.target.value) })}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div className="design-tab-panel-body">
                <p className="panel-hint">Tạo headline, slogan hoặc tên thương hiệu và chỉnh bằng thanh công cụ nổi trên canvas.</p>
                <Button block onClick={addText} className="panel-main-btn">
                  Thêm ô văn bản
                </Button>

                <p className="panel-section-title">Preset nhanh</p>
                <div className="text-preset-grid">
                  {textPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`text-preset-card text-preset-card--${preset.tone || 'clean'}`}
                      onClick={() => addTextPreset?.(preset)}
                    >
                      <span className="text-preset-card__eyebrow">{preset.eyebrow}</span>
                      <strong>{preset.title}</strong>
                      <span className="text-preset-card__caption">{preset.caption}</span>
                    </button>
                  ))}
                </div>

                <p className="panel-section-title">Mẹo bố cục chữ</p>
                <div className="panel-info-list">
                  {textTips.map((item) => (
                    <div key={item} className="panel-info-item">
                      <span className="material-symbols-rounded">draw</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'image' && (
              <div className="design-tab-panel-body">
                <Upload showUploadList={false} beforeUpload={(file) => { addImage(file); return false; }} accept="image/*">
                  <Button block className="panel-main-btn">Thêm ảnh từ thiết bị</Button>
                </Upload>

                <p className="panel-section-title">Khuyến nghị file ảnh</p>
                <div className="panel-info-list">
                  {imageTips.map((item) => (
                    <div key={item} className="panel-info-item">
                      <span className="material-symbols-rounded">image</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'texture' && (
              <div className="design-tab-panel-body">
                {textures.length === 0 ? (
                  <p className="panel-hint">Chưa có texture nào.</p>
                ) : (
                  <div className="texture-grid">
                    {textures.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="texture-item"
                        onClick={() => addTexture?.(t)}
                        title={t.name || 'Texture'}
                      >
                        <img src={t.imageUrl} alt={t.name || 'Texture'} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'greenai' && greenAiPanel}
            {activeTab === 'greenqr' && greenQrPanel}

            {(activeTab === 'elements' || activeTab === 'element' || activeTab === 'icon') && (
              <div className="design-tab-panel-body">
                <p className="panel-hint">Thêm icon nhanh để tạo nhấn nhá hoặc build một badge nhỏ cho thiết kế.</p>

                <p className="panel-section-title">Mẹo dùng icon</p>
                <div className="panel-info-list">
                  {iconTips.map((item) => (
                    <div key={item} className="panel-info-item">
                      <span className="material-symbols-rounded">bolt</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p className="panel-section-title">Thư viện biểu tượng</p>
                <div className="icon-grid">
                  {iconList.map(({ Icon, label }, index) => (
                    <button key={`${label}-${index}`} type="button" className="icon-grid-item" onClick={() => addIconToCanvas(Icon)} title={label}>
                      <Icon size={24} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      <div
        className={`design-resizer design-resizer-left${activeTab ? '' : ' disabled'}`}
        style={{ left: sidebarWidth - 5 }}
        onMouseDown={(event) => activeTab && startResizePanel('left', event)}
      />
    </>
  );
}

export default React.memo(LeftPanel);
