import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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
          <p className="text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Start your Day One</p>

          {COLUMNS.map(column => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm text-ink/50">{column.title}</h2>
              <ul className="mt-6 space-y-3 text-base">
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

        {/* Giant wordmark spanning the page: Inter in a faint gray, like a silhouette. */}
        <div data-footer-mask className="mt-16 overflow-hidden pb-[2vw] sm:mt-24" aria-hidden="true">
          <p
            data-footer-mark
            className="text-[26vw] leading-[0.85] font-semibold tracking-[-0.07em] whitespace-nowrap text-ink/[0.07] select-none"
          >
            Genesis
          </p>
        </div>
      </div>

      <div className="border-t border-ink/10 px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-4 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {YEAR} AWS Learning Club – Genesis</span>
          <span>Tarlac State University · Tarlac City</span>
        </div>
      </div>
    </footer>
  )
}
