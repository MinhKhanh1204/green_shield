import React from 'react';
import { Button, Tooltip, Upload } from 'antd';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

export default function LeftPanel({
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
  const { t } = useTranslation();
  const tabs = [
    { key: 'text', icon: 'text_fields', label: t('customBag.editor.tabs.text') },
    { key: 'image', icon: 'image', label: t('customBag.editor.tabs.image') },
    { key: 'texture', icon: 'texture', label: t('customBag.editor.tabs.texture') },
    { key: 'elements', icon: 'apps', label: t('customBag.editor.tabs.elements') },
    { key: 'greenai', icon: 'auto_awesome', label: t('customBag.editor.tabs.greenAi') },
    { key: 'greenqr', icon: 'qr_code_2', label: t('customBag.editor.tabs.greenQr') },
  ];
  const sidebarWidth = activeTab ? leftSidebarWidth : 72;
  const showTooltips = !activeTab;
  const hasEditableObject = Boolean(activeObjectInfo);
  const colorSwatches = ['#111827', '#475569', '#16a34a', '#22c55e', '#0ea5e9', '#7c3aed', '#ef4444', '#f59e0b', '#ffffff', 'transparent'];
  const textTips = t('customBag.editor.textTips', { returnObjects: true });
  const imageTips = t('customBag.editor.imageTips', { returnObjects: true });
  const iconTips = t('customBag.editor.iconTips', { returnObjects: true });

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
          {tabs.map(renderTabButton)}
        </div>

        {activeTab && (
          <div className={`design-tab-panel${activeTab === 'greenai' ? ' design-tab-panel--wide' : ''}`}>
            <div className="design-tab-panel-header">
              <span>
                {activeTab === 'text' && t('customBag.editor.panels.text')}
                {activeTab === 'image' && t('customBag.editor.panels.image')}
                {activeTab === 'texture' && t('customBag.editor.panels.texture')}
                {(activeTab === 'elements' || activeTab === 'element' || activeTab === 'icon') && t('customBag.editor.panels.elements')}
                {activeTab === 'greenai' && t('customBag.editor.panels.greenAi')}
                {activeTab === 'greenqr' && t('customBag.editor.panels.greenQr')}
                {activeTab === 'color-fill' && t(activeObjectInfo?.type === 'i-text' ? 'customBag.editor.panels.textColor' : 'customBag.editor.panels.objectColor')}
                {activeTab === 'color-border' && t('customBag.editor.panels.borderColor')}
              </span>
              <button className="design-tab-panel-close" onClick={() => setActiveTab(null)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {isColorTab && (
              <div className="design-tab-panel-body">
                {!hasEditableObject ? (
                  <p className="panel-hint">{t('customBag.editor.color.selectObject')}</p>
                ) : (
                  <>
                    <p className="panel-section-title">{t('customBag.editor.color.quickPalette')}</p>
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
                            aria-label={c === 'transparent' ? t('customBag.editor.color.transparent') : `${t('customBag.editor.color.color')} ${c}`}
                          />
                        );
                      })}
                    </div>

                    <p className="panel-section-title">{t('customBag.editor.color.custom')}</p>
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
                        <p className="panel-section-title">{t('customBag.editor.color.borderWidth')}</p>
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
                <p className="panel-hint">{t('customBag.editor.textHint')}</p>
                <Button block onClick={addText} className="panel-main-btn">
                  {t('customBag.editor.addText')}
                </Button>

                <p className="panel-section-title">{t('customBag.editor.quickPresets')}</p>
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

                <p className="panel-section-title">{t('customBag.editor.textTipsTitle')}</p>
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
                  <Button block className="panel-main-btn">{t('customBag.editor.addImage')}</Button>
                </Upload>

                <p className="panel-section-title">{t('customBag.editor.imageTipsTitle')}</p>
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
                  <p className="panel-hint">{t('customBag.editor.noTextures')}</p>
                ) : (
                  <div className="texture-grid">
                    {textures.map((texture) => (
                      <button
                        key={texture.id}
                        type="button"
                        className="texture-item"
                        onClick={() => addTexture?.(texture)}
                        title={texture.name || t('customBag.editor.tabs.texture')}
                      >
                        <img src={texture.imageUrl} alt={texture.name || t('customBag.editor.tabs.texture')} />
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
                <p className="panel-hint">{t('customBag.editor.elementsHint')}</p>

                <p className="panel-section-title">{t('customBag.editor.iconTipsTitle')}</p>
                <div className="panel-info-list">
                  {iconTips.map((item) => (
                    <div key={item} className="panel-info-item">
                      <span className="material-symbols-rounded">bolt</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p className="panel-section-title">{t('customBag.editor.iconLibrary')}</p>
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
