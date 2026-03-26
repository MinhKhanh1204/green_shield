import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function InteractiveGridPattern({
  className,
  spacing = 32,
  dotSize = 1,
  dotColor = 'rgba(15, 23, 42, 0.14)',
  glowRadius = 420,
  glowColor = 'rgba(34, 197, 94, 0.08)',
  gridOpacity = 0.18,
  vignetteOpacity = 0.04,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    let rafId = null;
    let pendingPointer = null;

    const commitPointer = () => {
      rafId = null;
      const root = rootRef.current;
      if (!root || !pendingPointer) return;
      root.style.setProperty('--grid-pointer-x', `${pendingPointer.x}%`);
      root.style.setProperty('--grid-pointer-y', `${pendingPointer.y}%`);
    };

    const handlePointerMove = (event) => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      pendingPointer = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
      if (!rafId) {
        rafId = window.requestAnimationFrame(commitPointer);
      }
    };

    const handlePointerLeave = () => {
      pendingPointer = { x: 50, y: 50 };
      if (!rafId) {
        rafId = window.requestAnimationFrame(commitPointer);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
      style={{
        '--grid-pointer-x': '50%',
        '--grid-pointer-y': '50%',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${dotColor} ${dotSize}px, transparent ${dotSize}px),
            linear-gradient(to bottom, ${dotColor} ${dotSize}px, transparent ${dotSize}px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`,
          opacity: gridOpacity,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(${glowRadius}px circle at var(--grid-pointer-x) var(--grid-pointer-y), ${glowColor}, transparent 70%)`,
          filter: 'blur(16px)',
          transition: 'opacity 120ms ease-out',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 45%, rgba(2, 6, 23, ${vignetteOpacity}) 100%)`,
        }}
      />
    </div>
  );
}
