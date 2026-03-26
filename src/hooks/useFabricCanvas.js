import { useCallback } from 'react';

export default function useFabricCanvas({ fabricRef, designRef, side, setSide, exportCanvasJson }) {
  const switchSide = useCallback((nextSide) => {
    if (!nextSide || nextSide === side) return;
    if (fabricRef.current) {
      designRef.current[side] = exportCanvasJson(fabricRef.current);
    }
    setSide(nextSide);
  }, [designRef, exportCanvasJson, fabricRef, side, setSide]);

  const saveCurrentSide = useCallback(() => {
    if (!fabricRef.current) return;
    designRef.current[side] = exportCanvasJson(fabricRef.current);
  }, [designRef, exportCanvasJson, fabricRef, side]);

  return {
    switchSide,
    saveCurrentSide,
  };
}
