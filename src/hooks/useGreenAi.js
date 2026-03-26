import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { generateBagDesign } from '../services/ai';
import { addAiGenerated, loadAiGenerated, removeAiGenerated } from '../utils/aiGeneratedStorage';

export default function useGreenAi({
  templateId,
  side,
  canvasSideReady,
  canApplyToCurrentSide,
  addImageToClipAreaFromDataUrl,
}) {
  const [greenAiPrompt, setGreenAiPrompt] = useState('');
  const [greenAiGenerating, setGreenAiGenerating] = useState(false);
  const [greenAiImageDataUrl, setGreenAiImageDataUrl] = useState(null);
  const [greenAiError, setGreenAiError] = useState(null);
  const [savedAiItems, setSavedAiItems] = useState([]);
  const [pendingFrontAiImageDataUrl, setPendingFrontAiImageDataUrl] = useState(null);
  const [pendingBackAiImageDataUrl, setPendingBackAiImageDataUrl] = useState(null);

  useEffect(() => {
    loadAiGenerated().then(setSavedAiItems);
  }, []);

  const handleGreenAiGenerate = useCallback(async () => {
    const prompt = (greenAiPrompt || '').trim();
    if (!prompt) {
      message.warning('Vui lòng nhập mô tả ảnh.');
      return;
    }

    setGreenAiError(null);
    setGreenAiImageDataUrl(null);
    setPendingFrontAiImageDataUrl(null);
    setPendingBackAiImageDataUrl(null);
    setGreenAiGenerating(true);

    try {
      const tplId = Number(templateId);
      if (!tplId || Number.isNaN(tplId)) {
        throw new Error('Thiếu thông tin mẫu túi để tạo thiết kế AI.');
      }

      const data = await generateBagDesign({
        prompt,
        templateId: tplId,
        generateFront: true,
        generateBack: true,
      });

      const frontDataUrl = data?.frontImageBase64
        ? `data:image/png;base64,${data.frontImageBase64}`
        : null;
      const backDataUrl = data?.backImageBase64
        ? `data:image/png;base64,${data.backImageBase64}`
        : null;

      setGreenAiImageDataUrl(frontDataUrl || backDataUrl || null);

      await addAiGenerated({
        prompt,
        frontDataUrl: frontDataUrl || undefined,
        backDataUrl: backDataUrl || undefined,
      });
      setSavedAiItems(await loadAiGenerated());

      if (side === 'front') {
        if (frontDataUrl) {
          addImageToClipAreaFromDataUrl(frontDataUrl);
        } else if (backDataUrl) {
          addImageToClipAreaFromDataUrl(backDataUrl);
        }
        if (backDataUrl) {
          setPendingBackAiImageDataUrl(backDataUrl);
        }
      } else {
        if (backDataUrl) {
          addImageToClipAreaFromDataUrl(backDataUrl);
        } else if (frontDataUrl) {
          addImageToClipAreaFromDataUrl(frontDataUrl);
        }
        if (frontDataUrl) {
          setPendingFrontAiImageDataUrl(frontDataUrl);
        }
      }
    } catch (e) {
      setGreenAiError(e.message || 'Không thể tạo thiết kế túi bằng AI');
    } finally {
      setGreenAiGenerating(false);
    }
  }, [greenAiPrompt, templateId, side, addImageToClipAreaFromDataUrl]);

  useEffect(() => {
    if (!canApplyToCurrentSide?.()) return;

    if (side === 'front' && pendingFrontAiImageDataUrl) {
      addImageToClipAreaFromDataUrl(pendingFrontAiImageDataUrl);
      setPendingFrontAiImageDataUrl(null);
    }

    if (side === 'back' && pendingBackAiImageDataUrl) {
      addImageToClipAreaFromDataUrl(pendingBackAiImageDataUrl);
      setPendingBackAiImageDataUrl(null);
    }
  }, [
    side,
    canvasSideReady,
    pendingFrontAiImageDataUrl,
    pendingBackAiImageDataUrl,
    canApplyToCurrentSide,
    addImageToClipAreaFromDataUrl,
  ]);

  const applySavedAiItem = useCallback(
    (item) => {
      const dataUrl = item.frontDataUrl || item.backDataUrl;
      if (!dataUrl) {
        message.warning('Thiết kế này không có ảnh.');
        return;
      }
      addImageToClipAreaFromDataUrl(dataUrl);
      message.success('Đã thêm thiết kế vào vùng in');
    },
    [addImageToClipAreaFromDataUrl]
  );

  const removeSavedAiItem = useCallback(async (id, e) => {
    e?.stopPropagation?.();
    await removeAiGenerated(id);
    setSavedAiItems(await loadAiGenerated());
    message.success('Đã xóa khỏi lịch sử');
  }, []);

  return {
    greenAiPrompt,
    setGreenAiPrompt,
    greenAiGenerating,
    greenAiImageDataUrl,
    greenAiError,
    savedAiItems,
    handleGreenAiGenerate,
    applySavedAiItem,
    removeSavedAiItem,
  };
}
