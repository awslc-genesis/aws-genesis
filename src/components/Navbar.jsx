import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import logo from '@/assets/logo.webp'
import { NAV_LINKS } from '@/lib/navigation'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4'

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const timeline = useRef(null)
  const buttonRef = useRef(null)
  const firstLinkRef = useRef(null)
  const openedByKeyboard = useRef(false)

  // Open: the white panel wipes down from the top until it fills the screen,
  // then the links rise into place. Closing plays the same timeline backwards.
  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      timeline.current = gsap
        // Once fully open, move focus into the menu for keyboard users only;
        // a mouse user would otherwise see the first link stuck highlighted.
        .timeline({
          paused: true,
          onComplete: () => openedByKeyboard.current && firstLinkRef.current?.focus({ preventScroll: true }),
        })
        .set('[data-menu]', { visibility: 'visible' })
        .fromTo(
          '[data-menu]',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: reduce ? 0 : 0.9, ease: 'expo.inOut' },
        )
        .from(
          '[data-menu-link]',
          { yPercent: 110, duration: reduce ? 0 : 0.8, stagger: 0.06, ease: 'expo.out' },
          reduce ? '>' : '-=0.35',
        )
    },
    { scope: root },
  )

  useEffect(() => {
    const tl = timeline.current
    if (!tl) return undefined
    if (open) {
      tl.timeScale(1).play()
      const onKey = event => event.key === 'Escape' && setOpen(false)
      // Block page scrolling while the menu is open without hiding the
      // scrollbar (overflow: hidden would remove it and shift the layout).
      const blockScroll = event => event.preventDefault()
      window.addEventListener('keydown', onKey)
      window.addEventListener('wheel', blockScroll, { passive: false })
      window.addEventListener('touchmove', blockScroll, { passive: false })
      return () => {
        window.removeEventListener('keydown', onKey)
        window.removeEventListener('wheel', blockScroll)
        window.removeEventListener('touchmove', blockScroll)
      }
    }
    tl.timeScale(1.5).reverse()
    if (root.current?.querySelector('[data-menu]')?.contains(document.activeElement)) {
      buttonRef.current?.focus({ preventScroll: true })
    }
    return undefined
  }, [open])

  // Close the menu and scroll to the section ourselves, so the jump also works
  // for links clicked while the menu is open.
  const goTo = href => event => {
    event.preventDefault()
    setOpen(false)
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      history.replaceState(null, '', href)
    }
  }

  return (
    <>
      <header ref={root} className="absolute inset-x-0 top-0 z-50">
        <div className="relative z-[45] px-5 py-5 sm:px-10 sm:py-6">
          <a
            href="#home"
            onClick={goTo('#home')}
            className={`flex w-fit items-center gap-3 rounded-full transition-colors duration-500 ${focusRing} ${
              open ? 'text-ink focus-visible:outline-ink' : 'text-white focus-visible:outline-gold'
            }`}
          >
            <img src={logo} alt="" className="size-10 sm:size-11" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-medium tracking-tight">AWSLC - Genesis</span>
              <span className={`text-xs font-normal tracking-wide ${open ? 'text-ink/70' : 'text-white/70'}`}>
                Tarlac State University
              </span>
            </span>
          </a>
        </div>

        <div
          id="site-menu"
          data-menu
          inert={!open}
          className="invisible fixed inset-0 z-40 flex flex-col bg-white text-ink"
        >
          <nav aria-label="Main" className="flex flex-1 items-center justify-center px-5">
            {/* Hovering (or keyboard-focusing) one link dims the others. */}
            <ul className="group/menu text-center">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} className="overflow-hidden">
                  <a
                    ref={i === 0 ? firstLinkRef : undefined}
                    data-menu-link
                    href={link.href}
                    onClick={goTo(link.href)}
                    className={`inline-block text-[clamp(2rem,min(9svh,15vw),6.5rem)] leading-[1.08] font-medium tracking-[-0.045em] uppercase transition-opacity duration-300 group-hover/menu:opacity-20 group-has-[a:focus-visible]/menu:opacity-20 hover:!opacity-100 focus-visible:!opacity-100 focus-visible:outline-ink ${focusRing}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Outside the header on purpose: the header is its own stacking context,
          which would stop the blend from seeing the page behind. With
          mix-blend-difference the white button reads white on dark sections and
          black on light ones (and splits cleanly across a boundary). */}
      <button
        ref={buttonRef}
        type="button"
        onClick={event => {
          // detail is 0 when the button is activated with Enter or Space.
          openedByKeyboard.current = event.detail === 0
          setOpen(v => !v)
        }}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={`fixed top-5 right-5 z-[60] grid size-11 place-items-center bg-white text-black mix-blend-difference sm:top-6 sm:right-10 ${focusRing} focus-visible:outline-white`}
      >
        <span aria-hidden="true" className="relative block h-3 w-5">
          <span
            className={`absolute left-0 h-[2px] w-full bg-current transition-all duration-500 ${
              open ? 'top-[5px] rotate-45' : 'top-0.5'
            }`}
          />
          <span
            className={`absolute left-0 h-[2px] w-full bg-current transition-all duration-500 ${
              open ? 'top-[5px] -rotate-45' : 'top-2'
            }`}
          />
        </span>
      </button>
    </>
  )
}
