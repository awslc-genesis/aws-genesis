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

    // Cache the scroll range so the loop never reads scrollHeight (which can
    // force a layout right after GSAP writes styles). Refreshed on resize and
    // whenever the page's height changes.
    let max = 0
    const updateMax = () => {
      const next = html.scrollHeight - window.innerHeight
      if (next === max) return
      max = next
      wake()
    }
    const readProgress = () => (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    max = html.scrollHeight - window.innerHeight
    progress = readProgress()

    const write = () => {
      dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) scale(${scale.toFixed(3)})`
      arcRef.current.style.strokeDashoffset = (INITIAL_ARC_OFFSET * (1 - progress)).toFixed(2)
    }

    const frame = time => {
      // Keep the ring's lag consistent across refresh rates. The dot still
      // uses the latest pointer position on every frame.
      const elapsed = Math.max(0, time - (lastFrame ?? time))
      lastFrame = time
      const follow = reduced ? 1 : 1 - Math.exp(-elapsed / RING_FOLLOW_MS)
      const goalProgress = readProgress()
      const goalScale = hovering ? 1.35 : 1
      ring.x += (target.x - ring.x) * follow
      ring.y += (target.y - ring.y) * follow
      progress += (goalProgress - progress) * (reduced ? 1 : 0.25)
      scale += (goalScale - scale) * (reduced ? 1 : 0.2)
      write()

      // Everything has settled: snap to the targets, draw once more and go
      // idle until the pointer, scroll or layout moves again.
      if (
        Math.abs(target.x - ring.x) < 0.1 &&
        Math.abs(target.y - ring.y) < 0.1 &&
        Math.abs(goalProgress - progress) < 0.0005 &&
        Math.abs(goalScale - scale) < 0.001
      ) {
        ring.x = target.x
        ring.y = target.y
        progress = goalProgress
        scale = goalScale
        write()
        raf = 0
        lastFrame = undefined
        return
      }
      raf = requestAnimationFrame(frame)
    }
    function wake() {
      if (raf) return
      // Re-read the range once per wake (not per frame), in case the page's
      // scroll height changed without the body resizing.
      max = html.scrollHeight - window.innerHeight
      // Count the first frame after idling as a normal frame step, so the ring
      // starts following right away, as it did when the loop never stopped.
      lastFrame = performance.now() - 1000 / 60
      raf = requestAnimationFrame(frame)
    }
    wake()

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
      wake()
    }
    const onOver = event => {
      hovering = Boolean(event.target.closest?.(INTERACTIVE))
      wake()
    }
    const onLeave = () => show(false)

    show(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', updateMax)
    const sizeWatcher = new ResizeObserver(updateMax)
    sizeWatcher.observe(document.body)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', updateMax)
      sizeWatcher.disconnect()
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
