import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import './ColorBends.css'

/**
 * Animated "light bends" background: a full-screen fragment shader drawing
 * soft colored bands. Adapted from React Bits (reactbits.dev).
 *
 * The renderer is created once. Prop changes update uniforms in place, and
 * intensity / mouseInfluence ease toward new values so callers can change
 * them on hover without a visible snap.
 */

const MAX_COLORS = 8
const POINTER_SMOOTHING = 8
const EASING = 4

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 maxCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-6.0 / exp(6.0 * m));
            vec3 colorWithWeight = uColors[i] * w;
            // Use max blend to prevent white - take the maximum color value
            maxCol = max(maxCol, colorWithWeight);
            cover = max(cover, w);
      }
      col = clamp(maxCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    rgb *= uIntensity;
    gl_FragColor = vec4(rgb, a);
}
`

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

function hexToVec3(hex) {
  const h = String(hex).replace('#', '').trim()
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  if (!/^[0-9a-f]{6}$/i.test(full)) return new THREE.Vector3(0, 0, 0)
  const n = parseInt(full, 16)
  return new THREE.Vector3((n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

export function ColorBends({
  className = '',
  style,
  rotation = 45,
  speed = 0.2,
  colors = ['#264b96', '#27b376', '#bf212f'],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.1,
  intensity = 0.6,
}) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const materialRef = useRef(null)
  const rotationRef = useRef(rotation)
  const autoRotateRef = useRef(autoRotate)
  const easedTargetRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: 0 },
        uColors: { value: Array.from({ length: MAX_COLORS }, () => new THREE.Vector3()) },
        uTransparent: { value: 1 },
        uScale: { value: 1 },
        uFrequency: { value: 1 },
        uWarpStrength: { value: 1 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: 0 },
        uParallax: { value: 0 },
        uNoise: { value: 0 },
        uIntensity: { value: 0 },
      },
      premultipliedAlpha: true,
      transparent: true,
    })
    materialRef.current = material
    scene.add(new THREE.Mesh(geometry, material))

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: true,
    })
    rendererRef.current = renderer
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })
    container.appendChild(renderer.domElement)

    const resize = () => {
      const w = container.clientWidth || 1
      const h = container.clientHeight || 1
      renderer.setSize(w, h, false)
      material.uniforms.uCanvas.value.set(w, h)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    // On window, not the container: page content sits above the canvas and
    // would otherwise swallow every pointer event.
    const pointerTarget = new THREE.Vector2(0, 0)
    const pointerCurrent = new THREE.Vector2(0, 0)
    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1)
      pointerTarget.set(x, y)
    }
    window.addEventListener('pointermove', onPointerMove)

    const clock = new THREE.Clock()
    let raf = 0
    const loop = () => {
      const dt = clock.getDelta()
      const elapsed = clock.elapsedTime
      const u = material.uniforms
      u.uTime.value = elapsed

      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed
      const rad = (deg * Math.PI) / 180
      u.uRot.value.set(Math.cos(rad), Math.sin(rad))

      pointerCurrent.lerp(pointerTarget, Math.min(1, dt * POINTER_SMOOTHING))
      u.uPointer.value.copy(pointerCurrent)

      const eased = easedTargetRef.current
      if (eased) {
        const k = Math.min(1, dt * EASING)
        u.uIntensity.value += (eased.intensity - u.uIntensity.value) * k
        u.uMouseInfluence.value += (eased.mouseInfluence - u.uMouseInfluence.value) * k
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms

    rotationRef.current = rotation
    autoRotateRef.current = autoRotate
    u.uSpeed.value = speed
    u.uScale.value = scale
    u.uFrequency.value = frequency
    u.uWarpStrength.value = warpStrength
    u.uParallax.value = parallax
    u.uNoise.value = noise

    // The first values apply immediately; later ones are eased by the loop.
    if (!easedTargetRef.current) {
      u.uIntensity.value = intensity
      u.uMouseInfluence.value = mouseInfluence
    }
    easedTargetRef.current = { intensity, mouseInfluence }

    const vecs = colors.filter(Boolean).slice(0, MAX_COLORS).map(hexToVec3)
    u.uColors.value.forEach((vec, i) => (i < vecs.length ? vec.copy(vecs[i]) : vec.set(0, 0, 0)))
    u.uColorCount.value = vecs.length

    u.uTransparent.value = transparent ? 1 : 0
    rendererRef.current?.setClearColor(0x000000, transparent ? 0 : 1)
  }, [
    rotation,
    autoRotate,
    speed,
    scale,
    frequency,
    warpStrength,
    mouseInfluence,
    parallax,
    noise,
    colors,
    transparent,
    intensity,
  ])

  return <div ref={containerRef} className={`color-bends-container ${className}`} style={style} />
}
