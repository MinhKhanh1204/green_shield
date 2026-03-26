import React from 'react';
import { Button, Input, Select, Upload } from 'antd';

export default function GreenQrPanel({
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
      <p className="panel-hint">
        Tạo mã QR âm thanh theo 2 cách: (1) Text → hệ thống đọc (TTS), (2) Upload file audio (≤ 5MB).
      </p>

      <div className="green-qr-color-row">
        <span>Loại nội dung</span>
        <Select
          value={greenQrMode}
          onChange={(v) => setGreenQrMode(v)}
          style={{ width: '100%' }}
          options={[
            { value: 'tts', label: 'Text (TTS)' },
            { value: 'audio', label: 'Upload audio (≤ 5MB)' },
          ]}
        />
      </div>

      {greenQrMode === 'tts' ? (
        <Input.TextArea
          rows={3}
          placeholder="VD: Lời chúc sinh nhật, câu quote yêu thích..."
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
            <Button block className="panel-main-btn">
              Chọn file audio
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
                  className="panel-main-btn green-qr-record-btn"
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
                    Bản ghi: <code>{greenQrRecordedFile?.name || 'recording'}</code>
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
        QR được thiết kế với nhịp sóng (heartbeat / waveform) ở giữa để gợi cảm giác âm thanh.
      </p>

      <Button
        type="primary"
        block
        loading={greenQrGenerating}
        onClick={generateGreenQr}
        className="panel-main-btn"
      >
        {greenQrGenerating ? 'Đang tạo QR...' : 'Tạo QR Green Sound'}
      </Button>
    </div>
  );
}
