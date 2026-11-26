import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import TechText from '@/components/animations/TechText'
import TransitionLink from '@/components/common/TransitionLink'
import { NAV_LINKS } from '@/config/navigation'

const COLUMNS = [
  { title: 'Club', links: NAV_LINKS.slice(0, 3) },
  { title: 'Get involved', links: NAV_LINKS.slice(3) },
]

const YEAR = new Date().getFullYear()

// Two colour schemes: light (cream, used on the home page) and dark (ink, used
// under the inner pages' cream closing band).
const TONES = {
  light: {
    footer: 'bg-paper text-ink',
    label: 'text-ink/55',
    link: 'text-ink/75 hover:text-ink focus-visible:outline-ink',
    rule: 'border-ink/10',
    meta: 'text-ink/60',
    mark: '#dedad4',
    accent: '#0e0c11',
  },
  dark: {
    footer: 'bg-ink text-paper',
    label: 'text-paper/55',
    link: 'text-paper/70 hover:text-paper focus-visible:outline-paper',
    rule: 'border-paper/10',
    meta: 'text-paper/60',
    mark: '#24212a',
    accent: '#f6f3ee',
  },
}

export default function Footer({ tone = 'light' }) {
  const t = TONES[tone] ?? TONES.light
  const linkClass = `inline-flex min-h-11 items-center rounded-sm transition-colors sm:min-h-8 focus-visible:outline-2 focus-visible:outline-offset-4 ${t.link}`
  const root = useRef(null)

  // The giant wordmark rises out of its mask as the footer scrolls into view.
  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-footer-mark]', {
          yPercent: 60,
          ease: 'none',
          // Trigger on the static mask: the moving wordmark would skew the end point.
          scrollTrigger: { trigger: '[data-footer-mask]', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
        })
      })

      // ScrollTrigger measures positions once, so when the page above
      // changes height without a window resize (e.g. the Join form swapping
      // to its short receipt), the footer's trigger would be left pointing at
      // the old spot and the wordmark stuck half-hidden. Re-measure then.
      let lastHeight = document.body.scrollHeight
      let timer = 0
      const observer = new ResizeObserver(() => {
        const height = document.body.scrollHeight
        if (height === lastHeight) return
        lastHeight = height
        clearTimeout(timer)
        timer = setTimeout(() => ScrollTrigger.refresh(), 100)
      })
      observer.observe(document.body)
      return () => {
        observer.disconnect()
        clearTimeout(timer)
      }
    },
    { scope: root },
  )

  return (
    // Pulled up under the rounded bottom of the section above, so the
    // footer's background shows in its corners.
    <footer ref={root} className={`relative z-[5] -mt-16 pt-16 ${t.footer}`}>
      <div className="px-4 pt-16 sm:px-10 sm:pt-24 lg:px-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <p className="type-h3">Start your Day One</p>

          {COLUMNS.map(column => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className={`type-label ${t.label}`}>{column.title}</h2>
              <ul className="type-caption mt-4 sm:space-y-1">
                {column.links.map(link => (
                  <li key={link.to}>
                    <TransitionLink to={link.to} className={linkClass}>
                      {link.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Giant wordmark spanning the page, drawn by React Bits TechText in a
            faint gray like a silhouette. Hovering a letter turns it into a
            dashed outline with a measurement frame; letters can be dragged and
            spring back, and a click kicks them. The box's shape keeps the word
            as wide as the page: TechText shrinks the text to fit 90% of the
            width and 66% of the height, so fontSize is only an upper limit. */}
        <div data-footer-mask className="mt-8 overflow-hidden sm:mt-12" aria-hidden="true">
          <div data-footer-mark className="relative aspect-[3.2/1] w-full">
            <TechText
              text="Genesis"
              fontFamily='"Inter Tight", sans-serif'
              fontWeight={600}
              fontSize={900}
              color={t.mark}
              accentColor={t.accent}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={0}
              intro="none"
              introDuration={2}
              clickKick
              guides={false}
            />
          </div>
        </div>
      </div>

      <div className={`border-t px-4 py-6 sm:px-10 lg:px-16 ${t.rule}`}>
        <div className={`type-caption flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${t.meta}`}>
          <span>© {YEAR} AWS Learning Club – Genesis</span>
          <span>Tarlac State University · Tarlac City</span>
        </div>
      </div>
    </footer>
  )
}
