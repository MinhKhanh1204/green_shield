import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DockContext = createContext({
  mouseX: null,
  itemSize: 36,
  magnification: 1.65,
  distance: 140,
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function Dock({
  className,
  children,
  itemSize = 36,
  magnification = 1.65,
  distance = 140,
  ...props
}) {
  const [mouseX, setMouseX] = useState(null);

  const contextValue = useMemo(() => ({
    mouseX,
    itemSize,
    magnification,
    distance,
  }), [mouseX, itemSize, magnification, distance]);

  return (
    <DockContext.Provider value={contextValue}>
      <div
        className={cn('magic-dock', className)}
        onMouseMove={(event) => setMouseX(event.clientX)}
        onMouseLeave={() => setMouseX(null)}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export function DockItem({
  className,
  children,
  active = false,
  enableScale = true,
  style: styleProp,
  ...props
}) {
  const ref = useRef(null);
  const { mouseX, itemSize, magnification, distance } = useContext(DockContext);

  let scale = 1;
  if (enableScale && mouseX !== null && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const diff = Math.abs(mouseX - centerX);
    const influence = clamp(1 - diff / distance, 0, 1);
    scale = 1 + (magnification - 1) * influence;
  }

  const itemStyle = enableScale
    ? {
      width: itemSize,
      height: itemSize,
      transform: `translateZ(0) scale(${scale})`,
      ...styleProp,
    }
    : {
      width: itemSize,
      height: itemSize,
      transform: 'translateZ(0)',
      ...styleProp,
    };

  return (
    <div
      ref={ref}
      className={cn('dock-item', active && 'active', className)}
      style={itemStyle}
      {...props}
    >
      {children}
    </div>
  );
}
