import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Text fields: the pen lowers onto the paper over these.
const WRITABLE = 'input:not([type="radio"]):not([type="checkbox"]), textarea, [contenteditable="true"]'
// How far the pen leans to the right, like a right-handed writer's.
const BASE_TILT = 28

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// A ballpoint pen. Drawn upright with the ball point at the bottom centre;
// the CSS turns it around that point.
function PenDrawing() {
  return (
    <svg viewBox="0 0 24 124" width="20" height="104">
      {/* Click button and cap end */}
      <rect x="9.5" y="1" width="5" height="8" rx="2" fill="#c9c9cf" />
      <rect x="7" y="7" width="10" height="18" rx="4.5" fill="#26242b" />
      {/* Barrel, with a soft highlight down its left side */}
      <rect x="7" y="20" width="10" height="74" rx="1.5" fill="#0e0c11" />
      <rect x="9" y="22" width="1.6" height="68" rx="0.8" fill="#fff" opacity="0.2" />
      {/* Orange clip and band, the Genesis colour */}
      <path d="M16.2 9h2.3a1 1 0 0 1 1 1v40.5a2 2 0 0 1-2 2h-.3z" fill="#f07a22" />
      <rect x="7" y="88" width="10" height="3" fill="#f07a22" />
      {/* Grip, tapering to the metal tip */}
      <path d="M7 94h10l-2 20H9z" fill="#2c2a31" />
      <path d="M8.2 98h7.6M8.6 102h6.8M9 106h6M9.4 110h5.2" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.8" />
      <path d="M9 114h6l-2.2 8.5h-1.6z" fill="#c9c9cf" />
      <circle cx="12" cy="123" r="1" fill="#0e0c11" />
    </svg>
  )
}

// On the Join page, a pen replaces the cursor. Its point is exactly where the
// pointer is, so clicks land where you aim. It sways as you move, lowers onto
// the paper over a text field, presses down when you click, scribbles while
// you type, and its shadow shows how far it is lifted off the page. Mouse
// and trackpad only; touch screens keep their usual behaviour.
export default function PenCursor() {
  const penRef = useRef(null)
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )

  useEffect(() => {
    if (!enabled) return undefined
    const html = document.documentElement
    const pen = penRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    html.classList.add('has-pen-cursor')

    const point = { x: -200, y: -200 }
    let lastX = null
    let sway = 0
    let tilt = BASE_TILT
    let lift = 1
    let scribble = 0
    let pressed = false
    let writing = false
    let shown = false
    let raf = 0

    const frame = time => {
      const ease = reduced ? 1 : 0.18
      sway *= reduced ? 0 : 0.86
      const goalTilt = BASE_TILT + sway
      const goalLift = pressed ? 0 : writing ? 0.35 : 1
      tilt += (goalTilt - tilt) * ease
      lift += (goalLift - lift) * (reduced ? 1 : 0.2)
      scribble *= 0.9

      // While typing, the point jiggles a little, as if writing.
      const jx = reduced ? 0 : Math.sin(time / 22) * 2.2 * scribble
      const jy = reduced ? 0 : Math.cos(time / 31) * 1.4 * scribble
      pen.style.transform = `translate3d(${point.x + jx}px, ${point.y + jy}px, 0)`
      pen.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`)
      pen.style.setProperty('--lift', lift.toFixed(3))

      const settled =
        Math.abs(sway) < 0.05 && Math.abs(goalTilt - tilt) < 0.05 && Math.abs(goalLift - lift) < 0.005 && scribble < 0.01
      if (settled) {
        raf = 0
        return
      }
      raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const show = value => {
      if (shown === value) return
      shown = value
      html.toggleAttribute('data-pen-hidden', !value)
    }

    const onMove = event => {
      if (lastX !== null && shown) sway = clamp(sway + (event.clientX - lastX) * 0.35, -14, 14)
      lastX = event.clientX
      point.x = event.clientX
      point.y = event.clientY
      show(true)
      wake()
    }
    const onOver = event => {
      writing = Boolean(event.target.closest?.(WRITABLE))
      wake()
    }
    const onDown = () => {
      pressed = true
      wake()
    }
    const onUp = () => {
      pressed = false
      wake()
    }
    const onType = event => {
      if (!event.target.closest?.(WRITABLE)) return
      scribble = 1
      wake()
    }
    const onLeave = () => {
      show(false)
      lastX = null
    }

    show(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('input', onType)
    html.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('input', onType)
      html.removeEventListener('pointerleave', onLeave)
      html.classList.remove('has-pen-cursor')
      html.removeAttribute('data-pen-hidden')
    }
  }, [enabled])

  if (!enabled) return null

  // Rendered on <body>, so a page transition's transform can't knock the
  // fixed position off.
  return createPortal(
    <div ref={penRef} className="pen-cursor" aria-hidden="true">
      <div className="pen-cursor__shadow">
        <PenDrawing />
      </div>
      <div className="pen-cursor__pen">
        <PenDrawing />
      </div>
    </div>,
    document.body,
  )
}
