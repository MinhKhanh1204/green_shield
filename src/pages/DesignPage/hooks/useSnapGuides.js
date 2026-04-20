import { useCallback } from 'react';
import { isEditableCanvasObject } from '../utils/designConstants';

export default function useSnapGuides() {
  const getRectSnapPoints = useCallback((rect) => ({
    x1: rect.left,
    x2: rect.left + rect.width,
    cx: rect.left + (rect.width / 2),
    y1: rect.top,
    y2: rect.top + rect.height,
    cy: rect.top + (rect.height / 2),
  }), []);

  const getSnapPoints = useCallback(({
    movingObject,
    canvas,
    clipBounds,
    nearbyLimit = 64,
  }) => {
    if (!movingObject || !canvas || !clipBounds) return null;

    const movingRect = movingObject.getBoundingRect(true, true);
    const sourcePoints = getRectSnapPoints(movingRect);
    const { clipX, clipY, clipW, clipH } = clipBounds;

    const targetsX = [
      { value: clipX, from: clipY, to: clipY + clipH, kind: 'edge', owner: 'canvas' },
      { value: clipX + clipW / 2, from: clipY, to: clipY + clipH, kind: 'center', owner: 'canvas' },
      { value: clipX + clipW, from: clipY, to: clipY + clipH, kind: 'edge', owner: 'canvas' },
    ];
    const targetsY = [
      { value: clipY, from: clipX, to: clipX + clipW, kind: 'edge', owner: 'canvas' },
      { value: clipY + clipH / 2, from: clipX, to: clipX + clipW, kind: 'center', owner: 'canvas' },
      { value: clipY + clipH, from: clipX, to: clipX + clipW, kind: 'edge', owner: 'canvas' },
    ];

    let candidates = canvas.getObjects()
      .filter((object) => object !== movingObject && isEditableCanvasObject(object) && object.visible !== false);

    if (candidates.length > 50) {
      const srcCx = sourcePoints.cx;
      const srcCy = sourcePoints.cy;
      candidates = candidates
        .map((object) => {
          const rect = object.getBoundingRect(true, true);
          const points = getRectSnapPoints(rect);
          const distance = Math.abs(points.cx - srcCx) + Math.abs(points.cy - srcCy);
          return { object, points, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, nearbyLimit)
        .map((item) => ({ object: item.object, points: item.points }));
    } else {
      candidates = candidates.map((object) => ({
        object,
        points: getRectSnapPoints(object.getBoundingRect(true, true)),
      }));
    }

    candidates.forEach(({ points }) => {
      targetsX.push(
        { value: points.x1, from: points.y1, to: points.y2, kind: 'edge', owner: 'object' },
        { value: points.cx, from: points.y1, to: points.y2, kind: 'center', owner: 'object' },
        { value: points.x2, from: points.y1, to: points.y2, kind: 'edge', owner: 'object' },
      );
      targetsY.push(
        { value: points.y1, from: points.x1, to: points.x2, kind: 'edge', owner: 'object' },
        { value: points.cy, from: points.x1, to: points.x2, kind: 'center', owner: 'object' },
        { value: points.y2, from: points.x1, to: points.x2, kind: 'edge', owner: 'object' },
      );
    });

    return {
      sourcePoints,
      targetsX,
      targetsY,
      clipBounds,
    };
  }, [getRectSnapPoints]);

  const detectSnap = useCallback(({
    sourcePoints,
    targetsX,
    targetsY,
    threshold = 6,
  }) => {
    if (!sourcePoints) return { snapX: null, snapY: null, distance: null, guides: [] };

    const sourceX = [
      { key: 'x1', value: sourcePoints.x1 },
      { key: 'cx', value: sourcePoints.cx },
      { key: 'x2', value: sourcePoints.x2 },
    ];
    const sourceY = [
      { key: 'y1', value: sourcePoints.y1 },
      { key: 'cy', value: sourcePoints.cy },
      { key: 'y2', value: sourcePoints.y2 },
    ];

    const pickNearest = (sources, targets) => {
      let best = null;
      sources.forEach((source) => {
        targets.forEach((target) => {
          const diff = target.value - source.value;
          const abs = Math.abs(diff);
          if (abs > threshold) return;
          const score = abs + (target.kind === 'center' ? 0 : 0.02);
          if (!best || score < best.score) {
            best = { source, target, diff, abs, score };
          }
        });
      });
      return best;
    };

    const snapX = pickNearest(sourceX, targetsX);
    const snapY = pickNearest(sourceY, targetsY);
    const nearest = Math.min(snapX?.abs ?? Number.POSITIVE_INFINITY, snapY?.abs ?? Number.POSITIVE_INFINITY);

    const guides = [];
    if (snapX) {
      guides.push({
        axis: 'x',
        value: snapX.target.value,
        from: snapX.target.from,
        to: snapX.target.to,
      });
    }
    if (snapY) {
      guides.push({
        axis: 'y',
        value: snapY.target.value,
        from: snapY.target.from,
        to: snapY.target.to,
      });
    }

    return {
      snapX,
      snapY,
      distance: Number.isFinite(nearest) ? nearest : null,
      guides,
    };
  }, []);

  const applySnap = useCallback(({
    object,
    snapResult,
    magneticStrength = 0.8,
  }) => {
    if (!object || !snapResult) return;

    const applyDiff = (diff) => {
      if (!Number.isFinite(diff)) return 0;
      if (Math.abs(diff) < 1) return diff;
      return diff * magneticStrength;
    };

    const dx = applyDiff(snapResult.snapX?.diff);
    const dy = applyDiff(snapResult.snapY?.diff);

    if (dx) object.set('left', (object.left || 0) + dx);
    if (dy) object.set('top', (object.top || 0) + dy);
  }, []);

  return {
    getSnapPoints,
    detectSnap,
    applySnap,
  };
}
