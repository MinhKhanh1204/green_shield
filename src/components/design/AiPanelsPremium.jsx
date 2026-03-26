import React, { useCallback, useEffect } from 'react';
import { Button, Input, Select, Upload } from 'antd';

const AI_PANEL_STYLE_ID = 'ai-panels-premium-style';

const AI_PANEL_CSS = `
.ai-panel-wrap {
  position: relative;
}

.ai-panel-wrap::before {
  content: "";
  position: absolute;
  inset: -18px -14px;
  border-radius: 18px;
  background:
    radial-gradient(220px 140px at 20% 18%, rgba(34, 197, 94, 0.12), transparent 70%),
    radial-gradient(180px 120px at 88% 82%, rgba(16, 185, 129, 0.1), transparent 72%);
  filter: blur(16px);
  opacity: 0.75;
  pointer-events: none;
  z-index: 0;
}

.ai-panel {
  --x: 50%;
  --y: 50%;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 14px;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(9, 16, 30, 0.82));
  box-shadow:
    0 14px 32px rgba(2, 8, 20, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 0 0 1px rgba(34, 197, 94, 0.04);
  backdrop-filter: blur(16px);
  transform: translateY(0) scale(1);
  transition:
    transform 180ms cubic-bezier(0.2, 0.75, 0.2, 1),
    border-color 180ms cubic-bezier(0.2, 0.75, 0.2, 1),
    box-shadow 220ms cubic-bezier(0.2, 0.75, 0.2, 1),
    background 220ms cubic-bezier(0.2, 0.75, 0.2, 1);
  animation: ai-breathe 4.2s ease-in-out infinite;
}

.ai-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    120deg,
    rgba(34, 197, 94, 0.55),
    rgba(16, 185, 129, 0.2) 42%,
    rgba(34, 197, 94, 0.08) 72%,
    rgba(16, 185, 129, 0.46)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.72;
}

.ai-panel::after {
  content: "";
  position: absolute;
  inset: -24%;
  border-radius: inherit;
  background:
    radial-gradient(40% 45% at 75% 12%, rgba(34, 197, 94, 0.18), transparent 70%),
    radial-gradient(38% 40% at 16% 86%, rgba(16, 185, 129, 0.14), transparent 74%);
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.68;
}

.ai-panel:hover {
  transform: translateY(-2px) scale(1.003);
  border-color: rgba(74, 222, 128, 0.44);
  box-shadow:
    0 18px 42px rgba(2, 8, 20, 0.58),
    0 0 0 1px rgba(74, 222, 128, 0.2),
    0 0 34px rgba(34, 197, 94, 0.22),
    inset 0 0 0 1px rgba(74, 222, 128, 0.12);
}

.ai-panel:focus-within {
  transform: translateY(-1px) scale(1.014);
  border-color: rgba(74, 222, 128, 0.58);
  box-shadow:
    0 0 0 1px rgba(74, 222, 128, 0.34),
    0 0 0 3px rgba(34, 197, 94, 0.2),
    0 20px 44px rgba(2, 8, 20, 0.62),
    inset 0 0 26px rgba(34, 197, 94, 0.09);
}

.ai-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

.ai-glow::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(220px circle at var(--x) var(--y), rgba(34, 197, 94, 0.2), transparent 62%),
    radial-gradient(140px circle at var(--x) var(--y), rgba(110, 231, 183, 0.16), transparent 64%);
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity 180ms cubic-bezier(0.2, 0.75, 0.2, 1);
}

.ai-panel:hover .ai-glow::before,
.ai-panel:focus-within .ai-glow::before {
  opacity: 1;
}

.ai-panel-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ai-panel-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #d1fae5;
}

.ai-panel-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 14px rgba(34, 197, 94, 0.62);
}

.ai-panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  animation: ai-icon-float 3.6s ease-in-out infinite;
}

.ai-panel-subtitle {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
}

.ai-panel-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-panel .panel-hint,
.ai-panel .panel-section-title {
  color: #93adc7;
}

.ai-panel .panel-section-title {
  font-size: 11px;
  letter-spacing: 0.01em;
}

.ai-panel .ant-input,
.ai-panel .ant-input-affix-wrapper,
.ai-panel .ant-select-selector,
.ai-panel textarea.ant-input {
  background: rgba(9, 16, 28, 0.84) !important;
  border: 1px solid rgba(148, 163, 184, 0.22) !important;
  color: #dbeafe !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}

.ai-panel .ant-input::placeholder,
.ai-panel textarea.ant-input::placeholder {
  color: #6f89a3;
}

.ai-panel .ant-input:focus,
.ai-panel .ant-input-focused,
.ai-panel .ant-input-affix-wrapper-focused,
.ai-panel .ant-select-focused .ant-select-selector {
  border-color: rgba(74, 222, 128, 0.52) !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.16) !important;
}

.ai-btn.ant-btn {
  position: relative;
  overflow: hidden;
  border-radius: 10px !important;
  border: 1px solid rgba(74, 222, 128, 0.35) !important;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.32), rgba(15, 118, 110, 0.5)) !important;
  color: #ecfdf5 !important;
  box-shadow:
    0 10px 24px rgba(5, 46, 22, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transition:
    transform 180ms cubic-bezier(0.2, 0.75, 0.2, 1),
    box-shadow 220ms cubic-bezier(0.2, 0.75, 0.2, 1),
    border-color 180ms cubic-bezier(0.2, 0.75, 0.2, 1),
    filter 180ms cubic-bezier(0.2, 0.75, 0.2, 1) !important;
}

.ai-btn.ant-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    115deg,
    transparent 15%,
    rgba(255, 255, 255, 0.2) 38%,
    rgba(255, 255, 255, 0.42) 50%,
    rgba(255, 255, 255, 0.16) 62%,
    transparent 84%
  );
  transform: translateX(-120%);
  transition: transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
  pointer-events: none;
}

.ai-btn.ant-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(134, 239, 172, 0.52) !important;
  box-shadow:
    0 14px 28px rgba(5, 46, 22, 0.5),
    0 0 24px rgba(34, 197, 94, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.ai-btn.ant-btn:hover::after {
  transform: translateX(120%);
}

.ai-btn.ant-btn:active {
  transform: translateY(0);
  filter: brightness(0.98);
}

.ai-panel .green-ai-result,
.ai-panel .green-ai-saved-item,
.ai-panel .green-qr-record {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(2, 8, 20, 0.38);
  border-radius: 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.ai-panel .green-ai-saved-item {
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 160ms ease;
}

.ai-panel .green-ai-saved-item:hover {
  transform: translateY(-1px);
  border-color: rgba(74, 222, 128, 0.35);
  box-shadow: 0 8px 20px rgba(2, 8, 20, 0.44);
}

.ai-panel .green-ai-saved-delete {
  background: rgba(2, 8, 20, 0.66);
  border-color: rgba(148, 163, 184, 0.24);
}

.ai-panel .green-qr-record-clear {
  color: #fca5a5;
}

@keyframes ai-breathe {
  0%, 100% {
    box-shadow:
      0 14px 32px rgba(2, 8, 20, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 0 0 1px rgba(34, 197, 94, 0.04);
  }
  50% {
    box-shadow:
      0 16px 36px rgba(2, 8, 20, 0.54),
      0 0 24px rgba(34, 197, 94, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.07),
      inset 0 0 0 1px rgba(34, 197, 94, 0.08);
  }
}

@keyframes ai-icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
}

@media (prefers-reduced-motion: reduce) {
  .ai-panel,
  .ai-panel-icon,
  .ai-btn.ant-btn,
  .ai-btn.ant-btn::after,
  .ai-panel .green-ai-saved-item {
    animation: none !important;
    transition: none !important;
  }
}

[data-theme='light'] .ai-panel-wrap::before {
  opacity: 0.52;
  filter: blur(12px);
}

[data-theme='light'] .ai-panel {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

[data-theme='light'] .ai-panel::before {
  opacity: 0.48;
  background: linear-gradient(
    120deg,
    rgba(34, 197, 94, 0.24),
    rgba(16, 185, 129, 0.08) 45%,
    rgba(14, 165, 233, 0.05) 78%,
    rgba(34, 197, 94, 0.2)
  );
}

[data-theme='light'] .ai-panel::after {
  opacity: 0.25;
}

[data-theme='light'] .ai-panel-title {
  color: #0f172a;
}

[data-theme='light'] .ai-panel-subtitle {
  color: #64748b;
}

[data-theme='light'] .ai-panel .panel-hint,
[data-theme='light'] .ai-panel .panel-section-title {
  color: #475569;
}

[data-theme='light'] .ai-panel .ant-input,
[data-theme='light'] .ai-panel .ant-input-affix-wrapper,
[data-theme='light'] .ai-panel .ant-select-selector,
[data-theme='light'] .ai-panel textarea.ant-input {
  background: #ffffff !important;
  border: 1px solid #e5e7eb !important;
  color: #0f172a !important;
}
`;

const useInjectAiPanelStyles = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const existed = document.getElementById(AI_PANEL_STYLE_ID);
    if (existed) return;
    const style = document.createElement('style');
    style.id = AI_PANEL_STYLE_ID;
    style.textContent = AI_PANEL_CSS;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
};

const usePanelPointerEffect = () => {
  return useCallback((event) => {
    const panel = event.currentTarget;
    const rect = panel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    panel.style.setProperty('--x', `${x}px`);
    panel.style.setProperty('--y', `${y}px`);
  }, []);
};

function AiPanelShell({ title, subtitle, icon, children }) {
  useInjectAiPanelStyles();
  const onPointerMove = usePanelPointerEffect();

  return (
    <div className="ai-panel-wrap">
      <section className="ai-panel" onPointerMove={onPointerMove}>
        <div className="ai-glow" />
        <div className="ai-panel-header">
          <h3 className="ai-panel-title">
            <span className="ai-panel-dot" />
            <span className="ai-panel-icon material-symbols-rounded">{icon}</span>
            <span>{title}</span>
          </h3>
          <p className="ai-panel-subtitle">{subtitle}</p>
        </div>
        <div className="ai-panel-content">{children}</div>
      </section>
    </div>
  );
}

export function GreenAiPanelPremium({
  greenAiPrompt,
  setGreenAiPrompt,
  greenAiGenerating,
  handleGreenAiGenerate,
  greenAiError,
  greenAiImageDataUrl,
  savedAiItems,
  applySavedAiItem,
  removeSavedAiItem,
}) {
  return (
    <div className="design-tab-panel-body">
      <AiPanelShell title="AI tạo ảnh" subtitle="Mô hình tạo ảnh" icon="auto_awesome">
        <p className="panel-hint">Nhập mô tả ảnh, AI sẽ tạo ảnh cho bạn (tối đa 20 ảnh/ngày toàn hệ thống).</p>
        <Input.TextArea
          placeholder="VD: Một bông hoa sen màu hồng trên nền xanh lá"
          value={greenAiPrompt}
          onChange={(e) => setGreenAiPrompt(e.target.value)}
          rows={3}
          className="green-ai-prompt-input"
        />
        <Button
          type="primary"
          block
          loading={greenAiGenerating}
          onClick={handleGreenAiGenerate}
          className="panel-main-btn ai-btn"
        >
          {greenAiGenerating ? 'Đang tạo ảnh...' : 'Tạo ảnh bằng AI'}
        </Button>

        {greenAiError && <p className="green-ai-error">{greenAiError}</p>}

        {greenAiImageDataUrl && (
          <div className="green-ai-result">
            <img src={greenAiImageDataUrl} alt="Ảnh AI đã tạo" className="green-ai-preview-img" />
            <p className="panel-hint">
              Thiết kế AI đã được tự động gắn vào vùng in trên túi. Đã lưu vào lịch sử để chọn lại.
            </p>
          </div>
        )}

        {savedAiItems.length > 0 && (
          <div className="green-ai-saved">
            <p className="panel-section-title">Thiết kế đã lưu (chọn để thêm vào vùng in)</p>
            <div className="green-ai-saved-grid">
              {savedAiItems.map((item) => {
                const thumbUrl = item.frontDataUrl || item.backDataUrl;
                return (
                  <div
                    key={item.id}
                    className="green-ai-saved-item"
                    onClick={() => applySavedAiItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && applySavedAiItem(item)}
                  >
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" className="green-ai-saved-thumb" />
                    ) : (
                      <div className="green-ai-saved-thumb green-ai-saved-thumb--empty" />
                    )}
                    <span className="green-ai-saved-prompt" title={item.prompt}>
                      {item.prompt.length > 20 ? `${item.prompt.slice(0, 20)}...` : item.prompt}
                    </span>
                    <button
                      type="button"
                      className="green-ai-saved-delete"
                      onClick={(e) => removeSavedAiItem(item.id, e)}
                      aria-label="Xóa"
                    >
                      <span className="material-symbols-rounded">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AiPanelShell>
    </div>
  );
}

export function GreenQrPanelPremium({
  greenQrMode,
  setGreenQrMode,
  greenQrText,
  setGreenQrText,
  stopGreenQrRecording,
  clearRecordedAudio,
  setGreenQrAudioFile,
  greenQrAudioFile,
  greenQrRecording,
  greenQrRecordSeconds,
  fmtMmSs,
  startGreenQrRecording,
  greenQrGenerating,
  greenQrRecordedUrl,
  greenQrRecordedFile,
  greenQrColor,
  setGreenQrColor,
  generateGreenQr,
}) {
  return (
    <div className="design-tab-panel-body">
      <AiPanelShell title="AI mã QR" subtitle="Âm thanh thông minh" icon="qr_code_2_add">
        <p className="panel-hint">
          Tạo mã QR âm thanh theo 2 cách: (1) Văn bản → hệ thống đọc (TTS), (2) Tải tệp âm thanh lên (≤ 5MB).
        </p>

        <div className="green-qr-color-row">
          <span>Loại nội dung</span>
          <Select
            value={greenQrMode}
            onChange={(v) => setGreenQrMode(v)}
            style={{ width: '100%' }}
            options={[
              { value: 'tts', label: 'Văn bản (TTS)' },
              { value: 'audio', label: 'Tải âm thanh lên (≤ 5MB)' },
            ]}
          />
        </div>

        {greenQrMode === 'tts' ? (
          <Input.TextArea
            rows={3}
            placeholder="VD: Lời chúc sinh nhật, câu trích dẫn yêu thích..."
            value={greenQrText}
            onChange={(e) => setGreenQrText(e.target.value)}
            className="green-qr-input"
          />
        ) : (
          <div className="green-qr-upload-wrap">
            <Upload
              showUploadList={false}
              accept="audio/*"
              beforeUpload={(f) => {
                stopGreenQrRecording();
                clearRecordedAudio();
                setGreenQrAudioFile(f);
                return false;
              }}
            >
              <Button block className="panel-main-btn ai-btn">
                Chọn tệp âm thanh
              </Button>
            </Upload>

            {greenQrAudioFile && (
              <p className="panel-hint green-qr-file-name">
                Đã chọn: <code>{greenQrAudioFile.name}</code> ({Math.round(greenQrAudioFile.size / 1024)} KB)
              </p>
            )}

            <div className="green-qr-record">
              <div className="green-qr-record-head">
                <span>Hoặc ghi âm</span>
                <span className={`green-qr-record-timer${greenQrRecording ? ' active' : ''}`}>
                  {fmtMmSs(greenQrRecordSeconds)}
                </span>
              </div>

              <div className="green-qr-record-actions">
                {!greenQrRecording ? (
                  <Button
                    block
                    onClick={startGreenQrRecording}
                    className="panel-main-btn green-qr-record-btn ai-btn"
                    disabled={greenQrGenerating}
                  >
                    Bắt đầu ghi âm
                  </Button>
                ) : (
                  <Button
                    danger
                    block
                    onClick={stopGreenQrRecording}
                    className="panel-main-btn green-qr-record-btn"
                  >
                    Dừng ghi âm
                  </Button>
                )}
              </div>

              {greenQrRecordedUrl && (
                <div className="green-qr-record-preview">
                  <audio controls src={greenQrRecordedUrl} style={{ width: '100%' }} />
                  <div className="green-qr-record-meta">
                    <span className="panel-hint green-qr-record-file">
                      Bản ghi: <code>{greenQrRecordedFile?.name || 'ban-ghi'}</code>
                    </span>
                    <button
                      type="button"
                      className="green-qr-record-clear"
                      onClick={clearRecordedAudio}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="green-qr-color-row">
          <span>Màu QR</span>
          <div className="green-qr-color-controls">
            <input
              type="color"
              value={greenQrColor}
              onChange={(e) => setGreenQrColor(e.target.value)}
            />
            <Input
              value={greenQrColor}
              onChange={(e) => setGreenQrColor(e.target.value)}
              className="green-qr-color-input"
            />
          </div>
        </div>

        <p className="panel-hint">
          QR được thiết kế với nhịp sóng ở giữa để gợi cảm giác âm thanh.
        </p>

        <Button
          type="primary"
          block
          loading={greenQrGenerating}
          onClick={generateGreenQr}
          className="panel-main-btn ai-btn"
        >
          {greenQrGenerating ? 'Đang tạo QR...' : 'Tạo QR âm thanh'}
        </Button>
      </AiPanelShell>
    </div>
  );
}

export function AiPanelUsageExample() {
  return (
    <div className="design-tab-panel-body">
      <AiPanelShell title="AI Demo" subtitle="Ví dụ tích hợp" icon="neurology">
        <Button className="panel-main-btn ai-btn" block>Chạy AI</Button>
      </AiPanelShell>
    </div>
  );
}
