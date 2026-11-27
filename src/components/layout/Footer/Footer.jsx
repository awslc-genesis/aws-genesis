import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { ArrowUpRight } from 'lucide-react'

import DitherClouds from '@/components/animations/DitherClouds'
import TechText from '@/components/animations/TechText'
import TransitionLink from '@/components/common/TransitionLink'
import { NAV_LINKS } from '@/config/navigation'
import { isCoarsePointer } from '@/utils/motion'

const COLUMNS = [
  { title: 'Club', links: NAV_LINKS.slice(0, 3) },
  { title: 'Get involved', links: NAV_LINKS.slice(3) },
]

const YEAR = new Date().getFullYear()

// Two colour schemes. Light (the default) is a sand a step deeper than the
// cream pages, so their rounded bottoms still read as they tuck over it; dark
// is ink.
const TONES = {
  light: {
    footer: 'bg-[#e9e4dc] text-ink',
    label: 'text-ink/55',
    link: 'text-ink/75 hover:text-ink focus-visible:outline-ink',
    meta: 'text-ink/60',
    lede: 'text-ink/65',
    fade: 'from-[#e9e4dc]',
    button: 'btn-dark',
    mark: '#e0dad1',
    accent: '#0e0c11',
    // Pale daylight clouds: warm shadow -> white lit top.
    cloud: ['#d8cfc2', '#e3dcd2', '#f0ebe4', '#fcfbf9'],
  },
  dark: {
    footer: 'bg-ink text-paper',
    label: 'text-paper/55',
    link: 'text-paper/70 hover:text-paper focus-visible:outline-paper',
    meta: 'text-paper/60',
    lede: 'text-paper/65',
    fade: 'from-ink',
    button: 'bg-paper text-ink hover:bg-white focus-visible:!outline-paper',
    mark: '#141217',
    accent: '#f6f3ee',
    // Night clouds lit by the last of the hero's ember sunset.
    cloud: ['#141016', '#1d1519', '#3a1d14', '#6e3214'],
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
      // A refresh can itself resize the page (the events strip sets its own
      // height). Take that as the new baseline instead of refreshing again,
      // since every extra refresh nudges the scroll position on phones.
      const syncHeight = () => {
        lastHeight = document.body.scrollHeight
      }
      ScrollTrigger.addEventListener('refresh', syncHeight)
      return () => {
        ScrollTrigger.removeEventListener('refresh', syncHeight)
        observer.disconnect()
        clearTimeout(timer)
      }
    },
    { scope: root },
  )

  return (
    // Pulled up under the rounded bottom of the section above, so the
    // footer's background shows in its corners.
    <footer ref={root} className={`relative z-[5] -mt-16 overflow-hidden pt-16 ${t.footer}`}>
      <div className="px-4 pt-16 sm:px-10 sm:pt-24 lg:px-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[2fr_1fr_1fr] md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <p className="type-h3">Start your Day One</p>
            <p className={`type-caption mt-3 max-w-[38ch] ${t.lede}`}>
              Learn the cloud with peers at Tarlac State University. Every builder starts somewhere.
            </p>
            <TransitionLink to="/join" className={`btn mt-6 ${t.button}`}>
              Join the club <ArrowUpRight aria-hidden="true" />
            </TransitionLink>
          </div>

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

      {/* Dithered clouds roll in front of the wordmark's base, so "Genesis"
          rises out of them. The sky is see-through and the layer ignores the
          pointer, so the letters underneath stay draggable. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(11rem,32vw,28rem)]"
        aria-hidden="true"
      >
        <DitherClouds transparent cloud={t.cloud} cellSize={isCoarsePointer() ? 2 : 3} speed={0.8} />
        {/* Settles the clouds into the footer colour behind the meta line. */}
        <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${t.fade} to-transparent`} />
      </div>

      <div className="relative px-4 py-6 sm:px-10 lg:px-16">
        <div className={`type-caption flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${t.meta}`}>
          <span>© {YEAR} AWS Learning Club – Genesis</span>
          <span>Tarlac State University · Tarlac City</span>
        </div>
      </div>
    </footer>
  )
}
