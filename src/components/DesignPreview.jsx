import { useEffect, useState } from 'react';
import { fabric } from 'fabric';

const CANVAS_SIZE = 680;

/**
 * Hook: Renders design (Fabric JSON) on top of template image and exports to data URLs.
 * Uses same background logic as DesignPage for correct positioning.
 */
export function useDesignPreview(template, designSnapshot) {
  const [frontDataUrl, setFrontDataUrl] = useState(null);
  const [backDataUrl, setBackDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!template || !designSnapshot) return;

    let parsed;
    try {
      parsed = typeof designSnapshot === 'string' ? JSON.parse(designSnapshot) : designSnapshot;
    } catch {
      setLoading(false);
      return;
    }

    const { front, back } = parsed;
    const addCrossOrigin = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      const o = JSON.parse(JSON.stringify(obj));
      const walk = (x) => {
        if (!x || typeof x !== 'object') return;
        if (x.src) x.crossOrigin = 'anonymous';
        if (Array.isArray(x.objects)) x.objects.forEach(walk);
      };
      if (Array.isArray(o.objects)) o.objects.forEach(walk);
      return o;
    };
    const frontJson = addCrossOrigin(front || { objects: [] });
    const backJson = addCrossOrigin(back || { objects: [] });

    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(container);

    const renderSide = (side) => {
      return new Promise((resolve, reject) => {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = CANVAS_SIZE;
        canvasEl.height = CANVAS_SIZE;
        container.appendChild(canvasEl);

        const c = new fabric.StaticCanvas(canvasEl, {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          renderOnAddRemove: false,
        });

        const imgUrl = side === 'front' ? template.frontImageUrl : template.backImageUrl;

        const finish = (dataUrl) => {
          try {
            c.dispose();
          } catch (_) {}
          container.removeChild(canvasEl);
          resolve(dataUrl);
        };

        const fail = (err) => {
          try {
            c.dispose();
          } catch (_) {}
          if (canvasEl.parentNode) container.removeChild(canvasEl);
          reject(err);
        };

        fabric.Image.fromURL(imgUrl, (img, isError) => {
          if (isError || !img || !img.width) {
            fail(new Error('Failed to load template image'));
            return;
          }
          const imgW = img.width || 1;
          const imgH = img.height || 1;
          const scale = Math.min(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH);
          const scaledW = imgW * scale;
          const scaledH = imgH * scale;
          const imgLeft = (CANVAS_SIZE - scaledW) / 2;
          const imgTop = (CANVAS_SIZE - scaledH) / 2;

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: imgLeft,
            top: imgTop,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
          });

          c.setBackgroundImage(img, () => {
            const saved = side === 'front' ? frontJson : backJson;
            const done = () => {
              try {
                c.renderAll();
                const dataUrl = c.toDataURL({ format: 'png', quality: 1 });
                finish(dataUrl);
              } catch (e) {
                fail(e);
              }
            };
            if (saved && (saved.objects?.length > 0 || saved.version)) {
              c.loadFromJSON(saved, done);
            } else {
              done();
            }
          });
        }, { crossOrigin: 'anonymous' });
      });
    };

    const timeout = 15000;
    const timeoutId = setTimeout(() => {
      if (container.parentNode) document.body.removeChild(container);
      setLoading(false);
    }, timeout);

    Promise.all([renderSide('front'), renderSide('back')])
      .then(([front, back]) => {
        clearTimeout(timeoutId);
        if (container.parentNode) document.body.removeChild(container);
        setFrontDataUrl(front);
        setBackDataUrl(back);
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (container.parentNode) document.body.removeChild(container);
        console.error('DesignPreview error:', err);
        setLoading(false);
      });
  }, [template, designSnapshot]);

  return { frontDataUrl, backDataUrl, loading };
}
