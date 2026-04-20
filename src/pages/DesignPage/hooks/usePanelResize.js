import { useCallback, useEffect, useRef } from 'react';

export default function usePanelResize({ leftSidebarWidth, setLeftSidebarWidth, leftMinWidth, leftMaxWidth, minCenterWidth }) {
  const resizeStateRef = useRef(null);

  const startResizePanel = useCallback((panel, event) => {
    event.preventDefault();
    resizeStateRef.current = {
      panel,
      startX: event.clientX,
      startLeftWidth: leftSidebarWidth,
    };
  }, [leftSidebarWidth]);

  useEffect(() => {
    const onMouseMove = (event) => {
      const stateInfo = resizeStateRef.current;
      if (!stateInfo) return;
      const viewportWidth = window.innerWidth;

      if (stateInfo.panel === 'left') {
        const maxByViewport = viewportWidth - minCenterWidth;
        const nextWidth = stateInfo.startLeftWidth + (event.clientX - stateInfo.startX);
        const clamped = Math.max(leftMinWidth, Math.min(Math.min(leftMaxWidth, maxByViewport), nextWidth));
        setLeftSidebarWidth(clamped);
      }
    };

    const onMouseUp = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [leftMaxWidth, leftMinWidth, minCenterWidth, setLeftSidebarWidth]);

  return {
    startResizePanel,
  };
}
