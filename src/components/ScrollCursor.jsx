import { useEffect, useRef, useState } from 'react'

const SIZE = 76
const CENTER = SIZE / 2
const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const INITIAL_ARC_OFFSET = CIRCUMFERENCE - 9
const INTERACTIVE = 'a, button, [role="button"], label, summary, select'
const RING_FOLLOW_MS = 120

// Custom cursor that doubles as the scrollbar: a dot follows the pointer, and a
// ring trails just behind it with an arc that grows as you scroll down the
// page. Only used with a mouse or trackpad; touch devices keep their usual
// scrolling. Drawn white with a "difference" blend, so it reads dark on the
// cream sections and light on the black ones.
export default function ScrollCursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const arcRef = useRef(null)
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )

  useEffect(() => {
    if (!enabled) return undefined
    const html = document.documentElement
    html.classList.add('has-scroll-cursor')

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: -100, y: -100 }
    const ring = { x: -100, y: -100 }
    let progress = 0
    let shown = false
    let hovering = false
    let scale = 1
    let raf = 0
    let lastFrame

    const readProgress = () => {
      const max = html.scrollHeight - window.innerHeight
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    }
    progress = readProgress()

    const frame = time => {
      // Keep the ring's lag consistent across refresh rates. The dot still
      // uses the latest pointer position on every frame.
      const elapsed = time - (lastFrame ?? time)
      lastFrame = time
      const follow = reduced ? 1 : 1 - Math.exp(-elapsed / RING_FOLLOW_MS)
      ring.x += (target.x - ring.x) * follow
      ring.y += (target.y - ring.y) * follow
      progress += (readProgress() - progress) * (reduced ? 1 : 0.25)
      scale += ((hovering ? 1.35 : 1) - scale) * (reduced ? 1 : 0.2)

      dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) scale(${scale.toFixed(3)})`
      arcRef.current.style.strokeDashoffset = (INITIAL_ARC_OFFSET * (1 - progress)).toFixed(2)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const show = value => {
      if (shown === value) return
      shown = value
      html.toggleAttribute('data-cursor-hidden', !value)
    }

    const onMove = event => {
      if (!shown) {
        // Jump straight to the pointer when it (re)enters instead of sliding in.
        ring.x = event.clientX
        ring.y = event.clientY
      }
      target.x = event.clientX
      target.y = event.clientY
      show(true)
    }
    const onOver = event => {
      hovering = Boolean(event.target.closest?.(INTERACTIVE))
    }
    const onLeave = () => show(false)

    show(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      html.classList.remove('has-scroll-cursor')
      html.removeAttribute('data-cursor-hidden')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="scroll-cursor" aria-hidden="true">
      <div ref={ringRef} className="scroll-cursor__ring">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Faint full circle: the track of the "scrollbar". */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />
          {/* A short mark grows clockwise until it fills the track. */}
          <circle
            ref={arcRef}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeDasharray={CIRCUMFERENCE.toFixed(2)}
            strokeDashoffset={INITIAL_ARC_OFFSET.toFixed(2)}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </svg>
      </div>
      <div ref={dotRef} className="scroll-cursor__dot" />
    </div>
  )
}
