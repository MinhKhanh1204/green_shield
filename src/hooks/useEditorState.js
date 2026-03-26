import { useState } from 'react';

export default function useEditorState() {
  const [zoom, setZoom] = useState(100);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(332);
  const [activeTab, setActiveTab] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [floatingObjectMenuPos, setFloatingObjectMenuPos] = useState(null);
  const [showLayerOverlay, setShowLayerOverlay] = useState(false);
  const [dragLayerId, setDragLayerId] = useState(null);
  const [dragOverLayerId, setDragOverLayerId] = useState(null);

  return {
    zoom,
    setZoom,
    leftSidebarWidth,
    setLeftSidebarWidth,
    activeTab,
    setActiveTab,
    contextMenu,
    setContextMenu,
    floatingObjectMenuPos,
    setFloatingObjectMenuPos,
    showLayerOverlay,
    setShowLayerOverlay,
    dragLayerId,
    setDragLayerId,
    dragOverLayerId,
    setDragOverLayerId,
  };
}
