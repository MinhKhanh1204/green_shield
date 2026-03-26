import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function ShaderPlane({ themeMode = 'dark', reducedMotion = false }) {
  const materialRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const smoothedPointerRef = useRef(new THREE.Vector2(0.5, 0.5));
  const pointerVectorRef = useRef(new THREE.Vector2(0.5, 0.5));
  const isDark = themeMode === 'dark';
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTheme: { value: isDark ? 1 : 0 },
  }), [isDark]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      pointerRef.current.x = event.clientX / window.innerWidth;
      pointerRef.current.y = 1 - (event.clientY / window.innerHeight);
    };
    const handlePointerLeave = () => {
      pointerRef.current.x = 0.5;
      pointerRef.current.y = 0.5;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTheme.value = isDark ? 1 : 0;
  }, [isDark]);

  useFrame((state) => {
    if (!materialRef.current) return;

    const targetX = pointerRef.current.x;
    const targetY = pointerRef.current.y;
    const smoothing = reducedMotion ? 1 : 0.08;
    pointerVectorRef.current.set(targetX, targetY);
    smoothedPointerRef.current.lerp(pointerVectorRef.current, smoothing);

    materialRef.current.uniforms.uTime.value = reducedMotion
      ? 0
      : state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.set(
      smoothedPointerRef.current.x,
      smoothedPointerRef.current.y,
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;

          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uTheme;

          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }

          float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x)
              + (c - a) * u.y * (1.0 - u.x)
              + (d - b) * u.x * u.y;
          }

          void main() {
            vec2 uv = vUv;
            float n = noise(uv * 3.0 + uTime * 0.1);
            vec3 color;

            if (uTheme > 0.5) {
              vec3 dark = vec3(0.02, 0.05, 0.08);
              vec3 green = vec3(0.05, 0.4, 0.2);
              color = mix(dark, green, n);

              float dist = distance(uv, uMouse);
              float glow = smoothstep(0.35, 0.0, dist);
              color += glow * vec3(0.0, 0.9, 0.5) * 0.4;
            } else {
              vec3 light = vec3(0.95, 0.98, 0.96);
              vec3 green = vec3(0.6, 0.9, 0.75);
              color = mix(light, green, n * 0.4);

              float dist = distance(uv, uMouse);
              float glow = smoothstep(0.4, 0.0, dist);
              color += glow * vec3(0.2, 0.8, 0.5) * 0.25;
            }

            float vignette = smoothstep(0.9, 0.3, distance(uv, vec2(0.5)));
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function WebGLBackground({ themeMode = 'dark' }) {
  const reducedMotion = useMemo(() => (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ), []);

  return (
    <div className="webgl-bg" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <ShaderPlane themeMode={themeMode} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
