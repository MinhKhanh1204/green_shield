import React from 'react';
import { Button, Tooltip, Upload } from 'antd';
import { AppstoreOutlined, BgColorsOutlined, FontSizeOutlined, PictureOutlined } from '@ant-design/icons';
import { PiLeaf, PiSparkle, PiStar } from 'react-icons/pi';

const TABS = [
  { key: 'product', icon: <AppstoreOutlined />, label: 'Product' },
  { key: 'text', icon: <FontSizeOutlined />, label: 'Add Text' },
  { key: 'image', icon: <PictureOutlined />, label: 'Add Image' },
  { key: 'icon', icon: <PiStar />, label: 'Icon' },
  { key: 'greenai', icon: <PiSparkle />, label: 'Green AI' },
  { key: 'greenqr', icon: <PiLeaf />, label: 'Green QR' },
  { key: 'background', icon: <BgColorsOutlined />, label: 'Background' },
  { key: 'elements', icon: <AppstoreOutlined />, label: 'Elements' },
];

export default function LeftPanel({
  activeTab,
  leftSidebarWidth,
  setActiveTab,
  side,
  switchSide,
  addText,
  addImage,
  greenAiPanel,
  greenQrPanel,
  iconList,
  addIconToCanvas,
  bgColor,
  applyBgColor,
  textures,
  addTexture,
  startResizePanel,
}) {
  const sidebarWidth = activeTab ? leftSidebarWidth : 72;

  return (
    <>
      <aside className={`design-sidebar${activeTab ? ' is-resizable' : ''}`} style={{ width: sidebarWidth }}>
        <div className="design-tab-bar">
          {TABS.map(({ key, icon, label }) => (
            <Tooltip key={key} title={label} placement="right">
              <button className={`design-tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(activeTab === key ? null : key)}>
                <span className="design-tab-icon">{icon}</span>
                <span className="design-tab-label">{label}</span>
              </button>
            </Tooltip>
          ))}
        </div>

        {activeTab && (
          <div className={`design-tab-panel${activeTab === 'greenai' ? ' design-tab-panel--wide' : ''}`}>
            <div className="design-tab-panel-header">
              <span>
                {activeTab === 'product' && 'Product'}
                {activeTab === 'text' && 'Add text to your design'}
                {activeTab === 'image' && 'Add image'}
                {activeTab === 'icon' && 'Icons'}
                {activeTab === 'greenai' && 'Green AI'}
                {activeTab === 'greenqr' && 'Green QR'}
                {activeTab === 'background' && 'Background'}
                {activeTab === 'elements' && 'Elements'}
              </span>
              <button className="design-tab-panel-close" onClick={() => setActiveTab(null)}>x</button>
            </div>

            {activeTab === 'product' && (
              <div className="design-tab-panel-body">
                <p className="panel-hint">Switch bag side from this panel.</p>
                <div className="design-side-switch">
                  <button type="button" className={`design-side-thumb${side === 'front' ? ' active' : ''}`} onClick={() => switchSide('front')}>
                    <span>Front</span>
                  </button>
                  <button type="button" className={`design-side-thumb${side === 'back' ? ' active' : ''}`} onClick={() => switchSide('back')}>
                    <span>Back</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="design-tab-panel-body">
                <p className="panel-hint">Add text then edit from floating toolbar.</p>
                <Button icon={<FontSizeOutlined />} block onClick={addText} className="panel-main-btn">
                  Add a text box
                </Button>
              </div>
            )}

            {activeTab === 'image' && (
              <div className="design-tab-panel-body">
                <Upload showUploadList={false} beforeUpload={(f) => { addImage(f); return false; }} accept="image/*">
                  <Button icon={<PictureOutlined />} block className="panel-main-btn">Add image from device</Button>
                </Upload>
              </div>
            )}

            {activeTab === 'greenai' && greenAiPanel}
            {activeTab === 'greenqr' && greenQrPanel}

            {activeTab === 'icon' && (
              <div className="design-tab-panel-body">
                <p className="panel-hint">Choose an icon to add.</p>
                <div className="icon-grid">
                  {iconList.map(({ Icon, label }, i) => (
                    <button key={i} type="button" className="icon-grid-item" onClick={() => addIconToCanvas(Icon)} title={label}>
                      <Icon size={24} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="design-tab-panel-body">
                <p className="panel-section-title">Swatches</p>
                <div className="swatch-grid">
                  {['none', '#ffffff', '#111827', '#6b7280', '#dcfce7', '#22c55e', '#16a34a'].map((c) => (
                    <button
                      key={c}
                      className={`swatch-dot${c === 'none' ? ' swatch-dot--none' : ''}${bgColor === c ? ' selected' : ''}`}
                      style={c === 'none' ? undefined : { '--swatch-color': c }}
                      onClick={() => applyBgColor(c)}
                      aria-label={c === 'none' ? 'No background color' : `Background ${c}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'elements' && (
              <div className="design-tab-panel-body">
                {textures.length === 0 ? (
                  <p className="panel-hint">No elements yet.</p>
                ) : (
                  <div className="texture-grid">
                    {textures.map((t) => (
                      <div key={t.id} className="texture-item" onClick={() => addTexture(t)}>
                        <img src={t.imageUrl} alt={t.name || ''} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      <div
        className={`design-resizer design-resizer-left${activeTab ? '' : ' disabled'}`}
        onMouseDown={(event) => activeTab && startResizePanel('left', event)}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize left panel"
      />
    </>
  );
}
