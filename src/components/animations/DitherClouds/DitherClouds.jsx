import { useEffect, useImperativeHandle, useRef } from 'react'

import './DitherClouds.css'

// Drifting clouds drawn with ordered (Bayer) dithering: the picture only ever
// uses the few flat colors in `cloud`, and the shading between them comes from how
// densely the square cells of each color are packed. The sky is one plain color.

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uSize;      // canvas size, in dither cells
uniform float uTime;
uniform float uPresence; // 0 -> 1 intro
uniform vec3 uPointer;   // x, y (cells, y up), strength
uniform vec3 uBanks;     // which banks to draw: far, mid, front (1 or 0)
uniform vec4 uGusts[3];  // shockwaves: x, y (cells, y up), age (s), strength
uniform vec3 uSky;       // one flat color
uniform float uSkyAlpha; // 0 lets the page show through the sky
uniform vec3 uCloud[4];  // shadow -> lit top
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// 8x8 Bayer matrix, as thresholds between 0 and 1.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a) + 1.0 / 128.0; }

// One bank of clouds: rows of round puffs under a rolling skyline.
// Returns brightness in x and coverage (0 or 1) in y.
vec2 bank(vec2 p, vec2 view, float id, float spacing, float level, float swell, float drift) {
  float x = p.x + drift;
  float cell = floor(x / spacing);
  vec3 normal = vec3(0.0);
  float weight = 0.0;
  float skyline = 0.0;
  for (int i = -2; i <= 2; i++) {
    float c = cell + float(i);
    // Skyline height for this column: a slow roll, taller towards the right
    // of the screen so the headline keeps open sky around it.
    float roll = noise(vec2(c * 0.38 + id * 17.0, id * 3.7));
    float side = smoothstep(0.1, 0.95, ((c + 0.5) * spacing - drift) / view.x);
    float top = view.y * (level + swell * (roll - 0.45) + 0.14 * side);
    skyline += top * max(0.0, 1.0 - abs(x / spacing - c - 0.5));
    for (int j = 0; j < 4; j++) {
      float row = float(j);
      vec2 key = vec2(c, row + id * 11.0);
      float a = hash(key + 0.5);
      float b = hash(key + 41.3);
      float r = spacing * (0.5 + 0.5 * b + 0.14 * row);
      r *= 1.0 + 0.05 * sin(uTime * 0.5 + a * 40.0);
      vec2 center = vec2((c + 0.5 + (a - 0.5) * 0.9) * spacing - drift, top - row * spacing * 0.72 - r * 0.5);
      vec2 d = p - center;
      float q = r * r - dot(d, d);
      if (q <= 0.0) continue;
      float z = sqrt(q);
      // Soft maximum: the nearest puff wins, with a gentle crease between two.
      float w = exp((z + row * spacing * 0.22) / spacing * 7.0);
      normal += w * vec3(d, z) / r;
      weight += w;
    }
  }
  if (weight == 0.0) return p.y < skyline - spacing * 2.0 ? vec2(0.2, 1.0) : vec2(0.0);
  normal = normalize(normal);
  vec3 light = normalize(vec3(0.5, 0.75, 0.42));
  float lit = dot(normal, light) * 0.62 + 0.3;
  // Clouds sink into their own shadow further below the skyline.
  lit *= mix(1.0, 0.4, smoothstep(0.0, spacing * 3.4, skyline - p.y));
  return vec2(clamp(lit, 0.0, 1.0), 1.0);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  // Puffs keep a similar size on tall phones and wide desktops.
  float unit = sqrt(uSize.x * uSize.y);
  vec2 view = uSize / unit;
  vec2 p = (cell + 0.5) / unit;

  // The pointer gently pushes the clouds apart and lights them.
  vec2 away = p - uPointer.xy / unit;
  float near = uPointer.z * exp(-dot(away, away) / 0.018);
  p -= away * near * 0.35;

  // Shockwaves: a ring spreads out from each gust's origin, shoving the
  // clouds outward and lighting them as it passes, then dies away.
  float gustLight = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 g = uGusts[i];
    if (g.w <= 0.0) continue;
    vec2 d = p - g.xy / unit;
    float r = length(d) + 1e-4;
    float front = g.z * 0.75;
    float band = exp(-pow((r - front) / 0.05, 2.0));
    float amp = g.w * exp(-g.z * 2.0);
    p -= (d / r) * band * amp * 0.012;
    gustLight += band * amp;
  }

  // Ragged, slowly boiling edges.
  vec2 w = p * 9.0 + vec2(uTime * 0.05, -uTime * 0.04);
  p += 0.022 * (vec2(noise(w), noise(w + 31.7)) - 0.5);
  p += 0.011 * (vec2(noise(w * 3.1), noise(w * 3.1 + 11.3)) - 0.5);

  // 1 on wide screens, where the hero text sits bottom-left over the clouds;
  // 0 on narrow ones, where it sits at the top over the sky.
  float wide = smoothstep(0.8, 1.5, uSize.x / uSize.y);
  // Lower skyline on narrow screens, to stay clear of that text.
  vec2 span = vec2(view.x, view.y * mix(0.64, 0.72, wide));

  float rise = (1.0 - uPresence) * 0.45;
  vec2 far = vec2(0.0);
  vec2 mid = vec2(0.0);
  vec2 front = vec2(0.0);
  if (uBanks.x > 0.5) far = bank(p + vec2(0.0, rise * 0.5), span, 1.0, 0.075, 0.36, 0.5, uTime * 0.006 + 3.0);
  if (uBanks.y > 0.5) mid = bank(p + vec2(0.0, rise * 0.8), span, 2.0, 0.11, 0.2, 0.42, uTime * 0.011 + 7.0);
  if (uBanks.z > 0.5) front = bank(p + vec2(0.0, rise * 1.2), span, 3.0, 0.15, 0.03, 0.3, uTime * 0.018 + 1.0);

  float threshold = bayer8(cell);
  vec3 color = uSky;

  float tone = 0.0;
  tone = mix(tone, far.x * 0.62, far.y);
  tone = mix(tone, mid.x * 0.85, mid.y);
  tone = mix(tone, front.x, front.y);
  float cloud = max(far.y, max(mid.y, front.y));
  tone += near * 0.22 * cloud;
  tone += gustLight * 0.04 * cloud;
  tone *= mix(0.4, 1.0, uPresence);

  float alpha = uSkyAlpha;
  if (cloud > 0.5) {
    float steps = clamp(tone, 0.0, 0.999) * 3.0;
    color = uCloud[int(floor(steps)) + (fract(steps) > threshold ? 1 : 0)];
    alpha = 1.0;
  }
  // The canvas is premultiplied, so a see-through sky must be black too.
  outColor = vec4(color * alpha, alpha);
}`

const INTRO_SECONDS = 1.8
// How long a shockwave lasts, and how many can overlap.
const GUST_SECONDS = 2.4
const GUST_SLOTS = 3
// Clouds move slowly, so 30 frames a second looks the same and costs half.
const FRAME_MS = 1000 / 31

const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)

const compile = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  console.error('DitherClouds:', gl.getShaderInfoLog(shader))
  return null
}

const link = gl => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  if (!vertex || !fragment) return null
  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, 'aPosition')
  gl.linkProgram(program)
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null
}

// Ember sunset, all in one orange hue. Clouds: shadow to lit top.
const SKY = '#ffffff'
const ALL_BANKS = ['far', 'mid', 'front']
const CLOUD = ['#2b110a', '#4a1a08', '#b8480f', '#ffb056']

/**
 * @param {{
 *   sky?: string,       // one #rrggbb color
 *   cloud?: string[],   // four #rrggbb colors: shadow to lit top
 *   cellSize?: number,   // dither cell size in CSS pixels
 *   speed?: number,
 *   paused?: boolean,
 *   transparent?: boolean, // draw only the clouds; the sky shows what's behind
 *   banks?: ('far' | 'mid' | 'front')[], // which cloud banks to draw, for
 *     // stacking content between them with a second, transparent instance
 * }} props
 *
 * The ref exposes `disturb(clientX?, clientY?)`: sends a shockwave through the
 * clouds from that point on screen (default: the right side, mid-height).
 */
export default function DitherClouds({
  ref,
  sky = SKY,
  cloud = CLOUD,
  cellSize = 3,
  speed = 1,
  paused = false,
  transparent = false,
  banks = ALL_BANKS,
}) {
  const containerRef = useRef(null)
  const wakeRef = useRef(null)
  const settings = useRef(null)
  const disturbRef = useRef(null)

  useImperativeHandle(ref, () => ({ disturb: (x, y) => disturbRef.current?.(x, y) }), [])

  useEffect(() => {
    settings.current = {
      sky: hexToRgb(sky),
      cloud: cloud.flatMap(hexToRgb),
      cellSize,
      speed,
      paused,
      transparent,
      banks: ALL_BANKS.map(name => (banks.includes(name) ? 1 : 0)),
    }
    wakeRef.current?.()
  }, [sky, cloud, cellSize, speed, paused, transparent, banks.join()])

  useEffect(() => {
    const container = containerRef.current
    // A fresh canvas per mount: cleanup drops the WebGL context, and a canvas
    // can't get a new one (React StrictMode mounts twice in development).
    const canvas = document.createElement('canvas')
    canvas.className = 'dither-clouds-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    const gl = canvas.getContext('webgl2', { antialias: false, depth: false, premultipliedAlpha: true })
    const program = gl && link(gl)
    if (!program) return undefined
    container.appendChild(canvas)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)
    const uniform = name => gl.getUniformLocation(program, name)
    const u = {
      size: uniform('uSize'),
      time: uniform('uTime'),
      presence: uniform('uPresence'),
      pointer: uniform('uPointer'),
      sky: uniform('uSky'),
      skyAlpha: uniform('uSkyAlpha'),
      cloud: uniform('uCloud'),
      gusts: uniform('uGusts'),
      banks: uniform('uBanks'),
    }
    const gusts = []
    const gustData = new Float32Array(GUST_SLOTS * 4)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0, inside: false }
    const state = { clock: 0, intro: reduce ? 1 : 0, touch: 0, x: 0, y: 0 }
    let raf = 0
    let last = 0
    let visible = true
    let cssCell = 1

    const render = () => {
      const eased = 1 - (1 - state.intro) ** 3
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(u.size, canvas.width, canvas.height)
      gl.uniform1f(u.time, state.clock)
      gl.uniform1f(u.presence, eased)
      gl.uniform3f(u.pointer, state.x / cssCell, state.y / cssCell, state.touch)
      gl.uniform3fv(u.sky, settings.current.sky)
      gl.uniform1f(u.skyAlpha, settings.current.transparent ? 0 : 1)
      gl.uniform3fv(u.cloud, settings.current.cloud)
      gl.uniform3fv(u.banks, settings.current.banks)
      gustData.fill(0)
      gusts.forEach((g, i) => gustData.set([g.x / cssCell, g.y / cssCell, g.age, g.strength], i * 4))
      gl.uniform4fv(u.gusts, gustData)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = now => {
      raf = 0
      const { paused: stopped, speed: rate } = settings.current
      if (!visible || document.hidden || stopped) {
        last = 0
        return
      }
      if (last && now - last < FRAME_MS) {
        raf = requestAnimationFrame(frame)
        return
      }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : FRAME_MS / 1000
      last = now
      state.clock += dt * rate
      state.intro = Math.min(1, state.intro + dt / INTRO_SECONDS)
      for (let i = gusts.length - 1; i >= 0; i--) {
        gusts[i].age += dt
        if (gusts[i].age > GUST_SECONDS) gusts.splice(i, 1)
      }
      if (pointer.inside && state.touch < 0.01) {
        state.x = pointer.x
        state.y = pointer.y
      }
      const follow = 1 - Math.exp(-dt * 7)
      state.x += (pointer.x - state.x) * follow
      state.y += (pointer.y - state.y) * follow
      state.touch += ((pointer.inside ? 1 : 0) - state.touch) * (1 - Math.exp(-dt * 3))
      render()
      raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const deviceCell = Math.max(1, Math.round(settings.current.cellSize * ratio))
      cssCell = deviceCell / ratio
      canvas.width = Math.max(1, Math.ceil(container.clientWidth / cssCell))
      canvas.height = Math.max(1, Math.ceil(container.clientHeight / cssCell))
      canvas.style.width = `${canvas.width * cssCell}px`
      canvas.style.height = `${canvas.height * cssCell}px`
      render()
      wake()
    }

    const onPointerMove = event => {
      if (event.pointerType === 'touch') return
      const rect = container.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = rect.bottom - event.clientY
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
    }
    const onPointerLeave = () => {
      pointer.inside = false
    }

    disturbRef.current = (clientX, clientY) => {
      if (reduce) return
      const rect = container.getBoundingClientRect()
      const x = clientX == null ? rect.width * 0.8 : clientX - rect.left
      const y = clientY == null ? rect.height * 0.5 : rect.bottom - clientY
      gusts.push({ x, y, age: 0, strength: 1 })
      if (gusts.length > GUST_SLOTS) gusts.shift()
      wake()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersection = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting
      wake()
    })
    intersection.observe(container)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', wake)
    wakeRef.current = resize
    resize()

    return () => {
      cancelAnimationFrame(raf)
      wakeRef.current = null
      disturbRef.current = null
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', wake)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [])

  return <div ref={containerRef} className={transparent ? 'dither-clouds dither-clouds-clear' : 'dither-clouds'} />
}
