import React from 'react';
import { Button, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default function GreenAiPanel({
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
        className="panel-main-btn"
      >
        {greenAiGenerating ? 'Đang tạo ảnh...' : 'Tạo ảnh bằng AI'}
      </Button>

      {greenAiError && <p className="green-ai-error">{greenAiError}</p>}

      {greenAiImageDataUrl && (
        <div className="green-ai-result">
          <img src={greenAiImageDataUrl} alt="AI generated" className="green-ai-preview-img" />
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
                    {item.prompt.length > 20 ? `${item.prompt.slice(0, 20)}…` : item.prompt}
                  </span>
                  <button
                    type="button"
                    className="green-ai-saved-delete"
                    onClick={(e) => removeSavedAiItem(item.id, e)}
                    aria-label="Xóa"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
