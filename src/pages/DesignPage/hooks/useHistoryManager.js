import { useCallback, useEffect, useRef, useState } from 'react';

export default function useHistoryManager({
  side,
  fabricRef,
  serializeCanvas,
  syncSelectionState,
  syncLayers,
}) {
  const historyRef = useRef({ front: [], back: [] });
  const historyIndexRef = useRef({ front: -1, back: -1 });
  const isRestoringHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryButtons = useCallback((targetSide = side) => {
    const entries = historyRef.current[targetSide] || [];
    const currentIndex = historyIndexRef.current[targetSide] ?? -1;
    setCanUndo(currentIndex > 0);
    setCanRedo(currentIndex >= 0 && currentIndex < entries.length - 1);
  }, [side]);

  const initHistoryForCurrentSide = useCallback((canvas) => {
    const json = serializeCanvas(canvas);
    historyRef.current[side] = [json];
    historyIndexRef.current[side] = 0;
    updateHistoryButtons(side);
  }, [serializeCanvas, side, updateHistoryButtons]);

  const pushHistory = useCallback((canvas) => {
    if (isRestoringHistoryRef.current) return;
    const json = serializeCanvas(canvas);
    const entries = historyRef.current[side] || [];
    const currentIndex = historyIndexRef.current[side] ?? -1;
    if (currentIndex >= 0 && entries[currentIndex] === json) return;

    const next = entries.slice(0, currentIndex + 1);
    next.push(json);
    const limit = 60;
    if (next.length > limit) next.shift();

    historyRef.current[side] = next;
    historyIndexRef.current[side] = next.length - 1;
    updateHistoryButtons(side);
  }, [serializeCanvas, side, updateHistoryButtons]);

  const applyHistoryIndex = useCallback((nextIndex) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const entries = historyRef.current[side] || [];
    if (nextIndex < 0 || nextIndex >= entries.length) return;

    isRestoringHistoryRef.current = true;
    canvas.loadFromJSON(entries[nextIndex], () => {
      canvas.requestRenderAll();
      historyIndexRef.current[side] = nextIndex;
      isRestoringHistoryRef.current = false;
      syncSelectionState(canvas.getActiveObject());
      syncLayers(canvas);
      updateHistoryButtons(side);
    });
  }, [fabricRef, side, syncSelectionState, syncLayers, updateHistoryButtons]);

  const handleUndo = useCallback(() => {
    const currentIndex = historyIndexRef.current[side] ?? -1;
    if (currentIndex <= 0) return;
    applyHistoryIndex(currentIndex - 1);
  }, [applyHistoryIndex, side]);

  const handleRedo = useCallback(() => {
    const entries = historyRef.current[side] || [];
    const currentIndex = historyIndexRef.current[side] ?? -1;
    if (currentIndex < 0 || currentIndex >= entries.length - 1) return;
    applyHistoryIndex(currentIndex + 1);
  }, [applyHistoryIndex, side]);

  useEffect(() => {
    updateHistoryButtons(side);
  }, [side, updateHistoryButtons]);

  return {
    canUndo,
    canRedo,
    initHistoryForCurrentSide,
    pushHistory,
    handleUndo,
    handleRedo,
  };
}
