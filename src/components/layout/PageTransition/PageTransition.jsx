import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { markCovered, markRevealed } from '@/lib/pageReveal'

gsap.registerPlugin(ScrollTrigger)

const TransitionContext = createContext({ go: () => {} })

export const usePageTransition = () => useContext(TransitionContext)

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// Waits two frames, so the newly rendered page has been laid out and painted.
const nextPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

// Page transitions for the whole site. The first page shows straight away and
// its intro plays as soon as it mounts. Moving between pages: a dark curtain
// wipes up from the bottom, the route changes behind it and the new page starts
// at the top, then the curtain carries on up and away. Pages start their intro
// animations as it lifts (see lib/pageReveal).
export default function PageTransition({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const curtain = useRef(null)
  const busy = useRef(false)
  const [phase, setPhase] = useState('idle') // 'idle' | 'moving'

  // First load: nothing covers the page, so it counts as revealed right away.
  // Layout effects run child-first, so the page's intro is already waiting.
  useLayoutEffect(() => {
    markRevealed()
  }, [])

  // Route change triggered by a link: cover, swap, uncover.
  const go = useCallback(
    async to => {
      if (busy.current) return
      if (to === location.pathname) {
        window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
        return
      }
      busy.current = true
      const reduce = reducedMotion()
      setPhase('moving')
      await gsap
        .timeline()
        .set(curtain.current, { clipPath: 'inset(100% 0% 0% 0%)' })
        .to(curtain.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: reduce ? 0 : 0.7, ease: 'expo.inOut' })

      markCovered()
      navigate(to)
      window.scrollTo(0, 0)
      await nextPaint()
      ScrollTrigger.refresh()
      markRevealed()

      await gsap
        .timeline()
        .to(curtain.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: reduce ? 0 : 0.8, ease: 'expo.inOut' })
      setPhase('idle')
      busy.current = false
    },
    [location.pathname, navigate],
  )

  // Back/forward buttons change the route without a link: start the new page
  // at the top unless the browser is restoring a scroll position.
  const lastPath = useRef(location.pathname)
  useEffect(() => {
    if (lastPath.current === location.pathname) return
    lastPath.current = location.pathname
    if (!busy.current) requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [location.pathname])

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}

      <div
        ref={curtain}
        aria-hidden={phase === 'idle'}
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        className={`fixed inset-0 z-[90] flex flex-col bg-ink text-paper ${phase === 'idle' ? 'pointer-events-none invisible' : ''}`}
      >
        {/* Warm glow from the bottom edge, the site's ember palette. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(90%_55%_at_50%_120%,rgb(249_115_22/0.45)_0%,rgb(110_36_6/0.35)_45%,transparent_75%)]"
        />

      </div>
    </TransitionContext.Provider>
  )
}
