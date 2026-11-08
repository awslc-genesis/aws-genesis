import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import TechText from '@/components/TechText'
import { NAV_LINKS } from '@/lib/navigation'

const COLUMNS = [
  { title: 'Club', links: NAV_LINKS.slice(0, 3) },
  { title: 'Get involved', links: NAV_LINKS.slice(3) },
]

const YEAR = new Date().getFullYear()

const linkClass =
  'rounded-sm text-ink/75 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'

export default function Footer() {
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
    },
    { scope: root },
  )

  return (
    // Pulled up under the rounded bottom of the section above, so the paper
    // background shows in its corners.
    <footer ref={root} className="relative z-[5] -mt-16 bg-paper pt-16 text-ink">
      <div className="px-5 pt-16 sm:px-10 sm:pt-24 lg:px-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <p className="type-h3">Start your Day One</p>

          {COLUMNS.map(column => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="type-label text-ink/55">{column.title}</h2>
              <ul className="type-body mt-6 space-y-3">
                {column.links.map(link => (
                  <li key={link.href}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
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
              fontFamily='"Inter", sans-serif'
              fontWeight={600}
              fontSize={900}
              color="#dedad4"
              accentColor="#0e0c11"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
              intro="none"
              introDuration={2}
              clickKick
              guides={false}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10 px-5 py-6 sm:px-10 lg:px-16">
        <div className="type-body flex flex-col gap-4 text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {YEAR} AWS Learning Club – Genesis</span>
          <span>Tarlac State University · Tarlac City</span>
        </div>
      </div>
    </footer>
  )
}
