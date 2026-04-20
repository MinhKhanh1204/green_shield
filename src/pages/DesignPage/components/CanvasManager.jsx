import React, { Suspense, lazy } from 'react';
import { Slider, Tooltip } from 'antd';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { Dock, DockItem } from '@/components/ui/dock';

const GreenAiPanelPremium = lazy(() => import('../../../components/design/AiPanelsPremium').then((module) => ({ default: module.GreenAiPanelPremium })));
const GreenQrPanelPremium = lazy(() => import('../../../components/design/AiPanelsPremium').then((module) => ({ default: module.GreenQrPanelPremium })));
const FloatingToolbar = lazy(() => import('../../../components/design/FloatingToolbar'));
const WebGLBackground = lazy(() => import('@/components/ui/webgl-background'));
const Topbar = lazy(() => import('./Topbar'));
const LeftPanel = lazy(() => import('./LeftPanel'));

export default function CanvasManager({
  themeMode,
  template,
  canUndo,
  canRedo,
  handleUndo,
  handleRedo,
  goToPreview,
  goToOrder,
  navigate,
  toggleThemeMode,
  activeObjectInfo,
  isTextObject,
  isImageObject,
  isShapeObject,
  textProps,
  setShowLayerOverlay,
  updateTextProp,
  cycleTextCase,
  cycleTextAlign,
  updateActiveObjectStyle,
  updateActiveObjectProp,
  fitImageToClip,
  duplicateActiveObject,
  deleteActiveObject,
  fontOptions,
  fontSizePresets,
  activeFillColor,
  floatingToolbarPos,
  setActiveTab,
  guides,
  distanceHint,
  aiHint,
  activeTab,
  leftSidebarWidth,
  addText,
  addTextPreset,
  textPresets,
  addImage,
  greenAi,
  greenQr,
  textures,
  addTexture,
  iconList,
  addIconToCanvas,
  startResizePanel,
  activeBorderColor,
  side,
  switchSide,
  zoomValueRef,
  smoothZoomTo,
  zoom,
  floatingObjectMenuPos,
  fabricRef,
  toggleLayerLock,
}) {
  const gridSpacing = 40;

  return (
    <main className="design-canvas-wrap">
      <div className="app-bg" />
      <div className="app-grid-wrap">
        <InteractiveGridPattern
          className="app-grid grid-fade"
          spacing={gridSpacing}
          dotColor={
            themeMode === 'dark'
              ? 'rgba(34, 197, 94, 0.22)'
              : 'rgba(15, 23, 42, 0.12)'
          }
          glowColor={
            themeMode === 'dark'
              ? 'rgba(34, 197, 94, 0.26)'
              : 'rgba(34, 197, 94, 0.16)'
          }
          glowRadius={themeMode === 'dark' ? 560 : 420}
          gridOpacity={themeMode === 'dark' ? 0.46 : 0.3}
          vignetteOpacity={0}
        />
      </div>
      {themeMode === 'dark' ? (
        <div className="webgl-bg-wrap">
          <Suspense fallback={null}>
            <WebGLBackground themeMode={themeMode} />
          </Suspense>
        </div>
      ) : null}
      <div className="grid-overlay" />
      <div className="app-ambient" />
      <Suspense fallback={null}>
        <Topbar
          templateName={template.name}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onPreview={goToPreview}
          onOrder={goToOrder}
          onBack={() => navigate('/custom-bag')}
          themeMode={themeMode}
          onToggleTheme={toggleThemeMode}
        />
      </Suspense>

      <div className="design-body">
        <Suspense fallback={null}>
          <FloatingToolbar
            activeObjectInfo={activeObjectInfo}
            isTextObject={isTextObject}
            isImageObject={isImageObject}
            isShapeObject={isShapeObject}
            textProps={textProps}
            setShowLayerOverlay={setShowLayerOverlay}
            updateTextProp={updateTextProp}
            cycleTextCase={cycleTextCase}
            cycleTextAlign={cycleTextAlign}
            updateActiveObjectStyle={updateActiveObjectStyle}
            updateActiveObjectProp={updateActiveObjectProp}
            fitImageToClip={fitImageToClip}
            duplicateActiveObject={duplicateActiveObject}
            deleteActiveObject={deleteActiveObject}
            fontOptions={fontOptions}
            fontSizePresets={fontSizePresets}
            activeFillColor={activeFillColor}
            toolbarPosition={floatingToolbarPos}
            onOpenDesignTab={setActiveTab}
          />
        </Suspense>
        <div className="snap-guides-overlay" aria-hidden="true">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className={`snap-guide ${guide.axis === 'x' ? 'snap-guide--v' : 'snap-guide--h'}${guide.kind === 'spacing' ? ' snap-guide--spacing' : ''}`}
              style={guide.axis === 'x'
                ? {
                  left: `${guide.left}px`,
                  top: `${guide.top}px`,
                  height: `${guide.length}px`,
                }
                : {
                  left: `${guide.left}px`,
                  top: `${guide.top}px`,
                  width: `${guide.length}px`,
                }}
            >
              {guide.label ? (
                <span className="snap-guide-label">{guide.label}</span>
              ) : null}
            </div>
          ))}
        </div>
        {distanceHint !== null && <div className="distance-hint">↔ {distanceHint}px</div>}
        {aiHint ? <div className="ai-hint">{aiHint}</div> : null}

        <Suspense fallback={null}>
          <LeftPanel
            activeTab={activeTab}
            leftSidebarWidth={leftSidebarWidth}
            setActiveTab={setActiveTab}
            addText={addText}
            addTextPreset={addTextPreset}
            textPresets={textPresets}
            addImage={addImage}
            greenAiPanel={(
              <Suspense fallback={null}>
                <GreenAiPanelPremium
                  greenAiPrompt={greenAi.greenAiPrompt}
                  setGreenAiPrompt={greenAi.setGreenAiPrompt}
                  greenAiGenerating={greenAi.greenAiGenerating}
                  handleGreenAiGenerate={greenAi.handleGreenAiGenerate}
                  greenAiError={greenAi.greenAiError}
                  greenAiImageDataUrl={greenAi.greenAiImageDataUrl}
                  savedAiItems={greenAi.savedAiItems}
                  applySavedAiItem={greenAi.applySavedAiItem}
                  removeSavedAiItem={greenAi.removeSavedAiItem}
                />
              </Suspense>
            )}
            greenQrPanel={(
              <Suspense fallback={null}>
                <GreenQrPanelPremium
                  greenQrMode={greenQr.greenQrMode}
                  setGreenQrMode={greenQr.setGreenQrMode}
                  greenQrText={greenQr.greenQrText}
                  setGreenQrText={greenQr.setGreenQrText}
                  stopGreenQrRecording={greenQr.stopGreenQrRecording}
                  clearRecordedAudio={greenQr.clearRecordedAudio}
                  setGreenQrAudioFile={greenQr.setGreenQrAudioFile}
                  greenQrAudioFile={greenQr.greenQrAudioFile}
                  greenQrRecording={greenQr.greenQrRecording}
                  greenQrRecordSeconds={greenQr.greenQrRecordSeconds}
                  fmtMmSs={greenQr.fmtMmSs}
                  startGreenQrRecording={greenQr.startGreenQrRecording}
                  greenQrGenerating={greenQr.greenQrGenerating}
                  greenQrRecordedUrl={greenQr.greenQrRecordedUrl}
                  greenQrRecordedFile={greenQr.greenQrRecordedFile}
                  greenQrColor={greenQr.greenQrColor}
                  setGreenQrColor={greenQr.setGreenQrColor}
                  generateGreenQr={greenQr.generateGreenQr}
                />
              </Suspense>
            )}
            textures={textures}
            addTexture={addTexture}
            iconList={iconList}
            addIconToCanvas={addIconToCanvas}
            startResizePanel={startResizePanel}
            activeObjectInfo={activeObjectInfo}
            activeFillColor={activeFillColor}
            activeBorderColor={activeBorderColor}
            updateActiveObjectStyle={updateActiveObjectStyle}
            textProps={textProps}
            updateTextProp={updateTextProp}
          />
        </Suspense>

        <aside className="design-product-panel">
          <div className="design-product-panel__head">
            <div>
              <span className="design-product-panel__eyebrow">Mẫu túi</span>
              <strong>{template.name}</strong>
            </div>
            <span className="design-product-panel__badge">{side === 'front' ? 'Mặt trước' : 'Mặt sau'}</span>
          </div>

          <div className="design-product-panel__grid">
            <button
              type="button"
              className={`design-product-panel__card${side === 'front' ? ' is-active' : ''}`}
              onClick={() => switchSide('front')}
            >
              <div className="design-product-panel__thumb">
                <img src={template.frontImageUrl} alt={`${template.name} mặt trước`} />
              </div>
              <span>Mặt trước</span>
            </button>

            <button
              type="button"
              className={`design-product-panel__card${side === 'back' ? ' is-active' : ''}`}
              onClick={() => switchSide('back')}
            >
              <div className="design-product-panel__thumb">
                <img src={template.backImageUrl || template.frontImageUrl} alt={`${template.name} mặt sau`} />
              </div>
              <span>Mặt sau</span>
            </button>
          </div>
        </aside>

        <div className="design-canvas-container">
          <div className="design-canvas-inner">
            <canvas id="design-canvas" />
          </div>
        </div>
        <Dock className="design-zoom-bar" itemSize={30} magnification={1.2} distance={90}>
          <DockItem enableScale={false}>
            <button className="dock-item-btn" onClick={() => smoothZoomTo(zoomValueRef.current - 10)}>−</button>
          </DockItem>
          <DockItem className="dock-item--slider" enableScale={false}>
            <Slider
              min={50}
              max={300}
              value={zoom}
              onChange={smoothZoomTo}
              className="design-zoom-slider"
              tooltip={{ formatter: (value) => `${value}%` }}
            />
          </DockItem>
          <DockItem enableScale={false}>
            <button className="dock-item-btn" onClick={() => smoothZoomTo(zoomValueRef.current + 10)}>+</button>
          </DockItem>
          <DockItem className="dock-item--zoom-label" enableScale={false}>
            <span className="design-zoom-label">{zoom}%</span>
          </DockItem>
        </Dock>
      </div>

      {activeObjectInfo && floatingObjectMenuPos && (
        <Dock
          className="object-mini-menu"
          style={{ left: floatingObjectMenuPos.x, top: floatingObjectMenuPos.y }}
          itemSize={32}
          magnification={1.3}
          distance={110}
        >
          <Tooltip title="AI"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={() => setActiveTab('greenai')}><span className="material-symbols-rounded">auto_awesome</span></button></DockItem></Tooltip>
          <Tooltip title="Khoa / Mo khoa"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={() => {
            const object = fabricRef.current?.getActiveObject();
            if (!object?.dataId) return;
            toggleLayerLock(object.dataId);
          }}><span className="material-symbols-rounded">lock</span></button></DockItem></Tooltip>
          <Tooltip title="Nhan doi"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={duplicateActiveObject}><span className="material-symbols-rounded">content_copy</span></button></DockItem></Tooltip>
          <Tooltip title="Xoa"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={deleteActiveObject}><span className="material-symbols-rounded">delete</span></button></DockItem></Tooltip>
          <Tooltip title="Them tuy chon"><DockItem enableScale={false}><button className="dock-item-btn" type="button" onClick={() => setShowLayerOverlay((value) => !value)}>...</button></DockItem></Tooltip>
        </Dock>
      )}
    </main>
  );
}
