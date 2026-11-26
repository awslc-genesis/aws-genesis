import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Desktop only: a mouse or trackpad, and a screen wide enough that the sheet
// sits beside the intro, leaving empty desk to doodle on.
const DESK_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'
// Pressing on any of these does its usual job instead of drawing.
const NOT_DESK = '.paper, a, button, input, textarea, select, label, [contenteditable="true"]'
// The same orange ink that circles a choice on the form.
const INK = '#f07a22'
// The wipe: how long the eraser takes to cross the ink, and how soft its edge is.
const WIPE_MS = 650
const WIPE_FEATHER = 80

const ScratchContext = createContext(null)

function useDesk() {
  const [desk, setDesk] = useState(() => typeof window !== 'undefined' && window.matchMedia(DESK_QUERY).matches)
  useEffect(() => {
    const media = window.matchMedia(DESK_QUERY)
    const onChange = () => setDesk(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return desk
}

// Draws one stroke as a smooth curve through the midpoints of its points.
function drawStroke(ctx, points) {
  if (points.length === 0) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  if (points.length === 1) {
    ctx.lineTo(points[0].x + 0.1, points[0].y)
  } else {
    for (let i = 1; i < points.length - 1; i += 1) {
      const mx = (points[i].x + points[i + 1].x) / 2
      const my = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
    }
    const last = points[points.length - 1]
    ctx.lineTo(last.x, last.y)
  }
  ctx.stroke()
}

// The desk around the application: click and drag anywhere off the sheet to
// try the pen out. The ink sits under the text and the paper, as if drawn on
// the desk itself, and scrolls with the page.
export default function ScratchPad({ children }) {
  const desk = useDesk()
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const strokesRef = useRef([])
  const [hasInk, setHasInk] = useState(false)

  // While wiping: the strokes being erased, and how far across them the
  // eraser has gone.
  const wipeRef = useRef(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const wipe = wipeRef.current
    if (wipe) {
      // Ink left of the eraser's edge is gone; the edge itself is soft, so
      // lines fade out as it passes rather than being cut.
      wipe.strokes.forEach(points => drawStroke(ctx, points))
      const edge = wipe.x
      const gradient = ctx.createLinearGradient(edge - WIPE_FEATHER, 0, edge, 0)
      gradient.addColorStop(0, '#000')
      gradient.addColorStop(1, 'rgb(0 0 0 / 0)')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, edge, canvas.height / dpr)
      ctx.globalCompositeOperation = 'source-over'
    }
    strokesRef.current.forEach(points => drawStroke(ctx, points))
  }, [])

  // Sweeps an eraser across the ink from left to right. Anything drawn while
  // it sweeps stays.
  const clear = useCallback(() => {
    if (wipeRef.current || strokesRef.current.length === 0) return
    const strokes = strokesRef.current
    strokesRef.current = []
    const finish = () => {
      wipeRef.current = null
      setHasInk(strokesRef.current.length > 0)
      redraw()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    let left = Infinity
    let right = -Infinity
    strokes.forEach(points =>
      points.forEach(p => {
        left = Math.min(left, p.x)
        right = Math.max(right, p.x)
      }),
    )
    const from = left - 4
    const to = right + WIPE_FEATHER + 4
    const start = performance.now()
    wipeRef.current = { strokes, x: from }
    const step = now => {
      const t = Math.min(1, (now - start) / WIPE_MS)
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      wipeRef.current.x = from + (to - from) * eased
      redraw()
      if (t < 1) requestAnimationFrame(step)
      else finish()
    }
    requestAnimationFrame(step)
  }, [redraw])

  useEffect(() => {
    if (!desk) return undefined
    const wrap = wrapRef.current
    const canvas = canvasRef.current

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(wrap.clientWidth * dpr)
      canvas.height = Math.round(wrap.clientHeight * dpr)
      redraw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    resize()

    let stroke = null
    const at = event => {
      const rect = wrap.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onDown = event => {
      if (event.button !== 0 || event.pointerType === 'touch') return
      if (event.target.closest?.(NOT_DESK)) return
      // No text selection while drawing over the intro.
      event.preventDefault()
      wrap.setPointerCapture(event.pointerId)
      stroke = [at(event)]
      strokesRef.current.push(stroke)
      setHasInk(true)
      redraw()
    }
    const onMove = event => {
      if (!stroke) return
      const events = event.getCoalescedEvents?.() ?? [event]
      events.forEach(e => stroke.push(at(e)))
      redraw()
    }
    const onUp = event => {
      if (!stroke) return
      stroke = null
      if (wrap.hasPointerCapture(event.pointerId)) wrap.releasePointerCapture(event.pointerId)
    }

    wrap.addEventListener('pointerdown', onDown)
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerup', onUp)
    wrap.addEventListener('pointercancel', onUp)
    return () => {
      observer.disconnect()
      wrap.removeEventListener('pointerdown', onDown)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerup', onUp)
      wrap.removeEventListener('pointercancel', onUp)
    }
  }, [desk, redraw])

  return (
    <ScratchContext.Provider value={{ desk, hasInk, clear }}>
      <div ref={wrapRef} className="relative">
        {desk && <canvas ref={canvasRef} className="scratch-canvas" aria-hidden="true" />}
        <div className="relative z-[1]">{children}</div>
      </div>
    </ScratchContext.Provider>
  )
}

// A handwritten-style note inviting you to try the pen, with a way to wipe
// the desk clean once you have. Shows only where drawing works.
export function ScratchHint({ className }) {
  const scratch = useContext(ScratchContext)
  if (!scratch?.desk) return null
  return (
    <div className={className}>
      <p className="scratch-hint type-small text-ink/45">
        Test your pen here!
        <svg viewBox="0 0 48 40" width="40" height="34" aria-hidden="true">
          <path
            d="M4 4c10 2 22 8 26 20 2 6 1 9 0 12m0 0-6-6m6 6 5-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </p>
      {scratch.hasInk && (
        <button type="button" onClick={scratch.clear} className="type-fine mt-1 text-ink/45 hover:text-ink">
          Wipe the desk
        </button>
      )}
    </div>
  )
}
