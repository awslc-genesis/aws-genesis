import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

const DEFAULT_ITEMS = ['Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave', 'Trance', 'Funk']

/**
 * A vertical wheel of labels that curves away from the selected one.
 *
 * Each item is a string, or `{ label, note }` to add a small line after the
 * label that only shows on the selected item.
 *
 * Mouse wheel and drag only act while the pointer is over the wheel, and the
 * wheel swallows those wheel events, so it never scrolls the page. With
 * `autoPlay` (milliseconds) it also steps to the next item on its own; any
 * wheel, drag, click or key press restarts that countdown so it never fights
 * the visitor.
 */
export default function OptionWheel({
  items = DEFAULT_ITEMS,
  defaultSelected = 0,
  onChange,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  autoPlay = 0,
  paused = false,
  className,
  style,
  ...props
}) {
  const rootRef = useRef(null)
  const itemRefs = useRef([])
  const posRef = useRef(defaultSelected)
  const targetRef = useRef(defaultSelected)
  const rafRef = useRef(null)
  const lastRef = useRef(0)
  const cfgRef = useRef({})
  const onChangeRef = useRef(onChange)
  const selectedRef = useRef(defaultSelected)
  const wheelTimerRef = useRef(null)
  const dragRef = useRef(null)
  const dragMovedRef = useRef(false)
  const lastInputRef = useRef(0)
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected)
  const [isDragging, setIsDragging] = useState(false)

  const remPx =
    typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16

  onChangeRef.current = onChange
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
  }

  const runFrame = useCallback(now => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05)
    lastRef.current = now
    const cfg = cfgRef.current
    const tau = Math.max(cfg.smoothing, 1) / 1000
    const k = 1 - Math.exp(-dt / tau)

    const target = targetRef.current
    let next = posRef.current + (target - posRef.current) * k
    const settled = Math.abs(target - next) < 0.001
    if (settled) next = target
    posRef.current = next

    const n = cfg.count
    const mirror = cfg.side === 'right' ? -1 : 1
    const tiltRad = (cfg.tilt * Math.PI) / 180
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0

    for (let i = 0; i < n; i++) {
      const el = itemRefs.current[i]
      if (!el) continue
      let d = i - next
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n
        if (d > n / 2) d -= n
      }
      const dist = Math.abs(d)
      let x = 0
      let y = d * cfg.rowH
      let rot = 0
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad))
        y = R * Math.sin(ang)
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve
        rot = (mirror * ang * 180) / Math.PI
      }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade))
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none'
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4))
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame)
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(runFrame)
  }, [runFrame])

  const applyTarget = useCallback(
    (value, snap) => {
      const cfg = cfgRef.current
      let v = value
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0))
      if (snap) v = Math.round(v)
      targetRef.current = v
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count
      if (idx !== selectedRef.current) {
        selectedRef.current = idx
        setSelectedIndex(idx)
        onChangeRef.current?.(idx, cfg.items[idx])
      }
      startLoop()
    },
    [startLoop],
  )

  const markInput = () => {
    lastInputRef.current = performance.now()
  }

  // Wheel input only reaches this element while the pointer is over it; it is
  // cancelled so the page underneath doesn't scroll.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = e => {
      e.preventDefault()
      markInput()
      const cfg = cfgRef.current
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH))
      applyTarget(targetRef.current + step, false)
      clearTimeout(wheelTimerRef.current)
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(wheelTimerRef.current)
    }
  }, [applyTarget])

  // Auto-advance one item per tick, skipping a tick right after the visitor
  // moved the wheel themselves.
  useEffect(() => {
    if (!autoPlay || paused) return
    const id = setInterval(() => {
      if (dragRef.current || document.hidden) return
      if (performance.now() - lastInputRef.current < autoPlay) return
      const cfg = cfgRef.current
      let next = Math.round(targetRef.current) + 1
      if (!cfg.loop && next > cfg.count - 1) next = 0
      applyTarget(next, true)
    }, autoPlay)
    return () => clearInterval(id)
  }, [autoPlay, paused, applyTarget])

  const handlePointerDown = useCallback(e => {
    if (!cfgRef.current.draggable) return
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId }
    dragMovedRef.current = false
    markInput()
    setIsDragging(true)
  }, [])

  const handlePointerMove = useCallback(
    e => {
      const drag = dragRef.current
      if (!drag) return
      const dy = e.clientY - drag.y
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true
        rootRef.current?.setPointerCapture(drag.id)
      }
      if (dragMovedRef.current) {
        markInput()
        applyTarget(drag.start - dy / cfgRef.current.rowH, false)
      }
    },
    [applyTarget],
  )

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    markInput()
    setIsDragging(false)
    if (dragMovedRef.current) applyTarget(targetRef.current, true)
  }, [applyTarget])

  const handleItemClick = useCallback(
    index => {
      if (dragMovedRef.current) return
      markInput()
      const cfg = cfgRef.current
      const cur = targetRef.current
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count)
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count
        else if (d < -cfg.count / 2) d += cfg.count
      }
      applyTarget(cur + d, true)
    },
    [applyTarget],
  )

  const handleKeyDown = useCallback(
    e => {
      let delta = null
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1
      if (delta == null) return
      e.preventDefault()
      markInput()
      applyTarget(Math.round(targetRef.current) + delta, true)
    },
    [applyTarget],
  )

  useEffect(() => {
    applyTarget(targetRef.current, false)
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget])

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    },
    [],
  )

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={cn(
        'relative h-full w-full touch-none overflow-hidden outline-none select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      style={{
        ...style,
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {items.map((item, index) => {
        const { label, note } = typeof item === 'string' ? { label: item } : item
        const active = selectedIndex === index
        return (
        <div
          key={`${label}-${index}`}
          ref={el => {
            itemRefs.current[index] = el
          }}
          role="option"
          aria-selected={active}
          className={cn(
            'absolute top-1/2 cursor-pointer leading-none whitespace-nowrap will-change-[transform,opacity,filter]',
            side === 'right' ? 'right-[var(--ow-inset)] origin-right' : 'left-[var(--ow-inset)] origin-left',
            active ? 'font-medium' : 'font-extralight',
          )}
          style={{
            fontSize: 'var(--ow-font-size)',
            color:
              'color-mix(in srgb, var(--ow-active-color) calc(var(--ow-p, 0) * 100%), var(--ow-text-color))',
          }}
          onClick={() => handleItemClick(index)}
        >
          {note && (
            <span
              className={cn(
                'mr-[0.9em] inline-block align-middle text-[0.3em] font-normal tracking-wide text-[var(--ow-text-color)] uppercase transition-opacity duration-300',
                active ? 'opacity-100' : 'opacity-0',
              )}
            >
              {note}
            </span>
          )}
          {label}
        </div>
        )
      })}
    </div>
  )
}
