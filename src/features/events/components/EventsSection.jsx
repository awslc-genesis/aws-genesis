import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'

import TiltedCard, { TiltedCardLayer } from '@/components/animations/TiltedCard'
import { FREE, PINNED } from '@/utils/motion'
import { cn } from '@/utils/cn'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const eventPhotos = import.meta.glob('/src/assets/images/events/*.{avif,jpeg,jpg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

// Placeholder events; replace with the club's real events, summaries and links,
// newest first. To add a photo, put the image in src/assets/images/events and
// set the event's photoFile to its exact filename. Entries without a match show
// a stock photo (picsum.photos, fixed per seed so it doesn't change between visits).
const EVENTS = [
  {
    title: 'tba', //'AWS Cloud Day 2026'
    type: 'tba', // 'Conference'
    date: 'tba', // 'Nov 5, 2026'
    place: 'tba', // 'TSU Main Campus'
    seed: 'tba', // 'genesis-cloud-day'
    summary: 'tba', // 'A full day of talks and demos on how students and startups build on AWS, closing with a community mixer.'
    photoFile: 'tbaEvent.png', // 'cloud-day.jpg'
  },
]

function EventCard({ event, index }) {
  // Cards alternate a little above and below the row's center for an editorial rhythm.
  const raised = index % 2 === 1
  const number = String(index + 1).padStart(2, '0')
  const photo = eventPhotos[`/src/assets/images/events/${event.photoFile}`]

  return (
    <li
      className={cn(
        // Width follows the screen's height on wide screens, so a card plus its
        // caption always fits vertically; on phones one card fills most of the
        // width with the next peeking in.
        'relative w-[min(90vw,78svh)] shrink-0 self-center text-ink',
        raised ? '-translate-y-[5svh]' : 'translate-y-[5svh]',
      )}
    >
      {/* Landscape photo as a React Bits TiltedCard: it tilts toward the
          pointer with a glare, the title floats on a parallax layer, and a
          click flips it over to the event's summary. Black and white until
          hovered (see .event-tilt in styles/index.css). */}
      <div className="aspect-[3/2]">
        <TiltedCard
          className="event-tilt"
          imageSrc={photo ?? `https://picsum.photos/seed/${event.seed}/1200/800`}
          altText={event.title}
          captionText={event.title}
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          radius={0}
          rotateAmplitude={12}
          scaleOnHover={1.05}
          glare={0.5}
          shadow={0.2}
          backContent={
            <div className="flex size-full flex-col justify-between bg-ink p-6 text-paper sm:p-8">
              <p className="type-label text-paper/55">
                {event.date} · {event.place}
              </p>
              <p className="type-body max-w-[36ch] text-paper/80">{event.summary}</p>
              <p className="type-label text-paper/55">Click to flip back</p>
            </div>
          }
        >
          {/* Blended so the title inverts against the photo: dark on light
              photos, white on dark ones. */}
          <TiltedCardLayer depth={30} className="mix-blend-difference">
            <h3 className="type-h3 absolute right-6 bottom-5 left-6 text-white sm:bottom-6 sm:left-7">
              {event.title}
            </h3>
          </TiltedCardLayer>
        </TiltedCard>
      </div>

      {/* Caption in the same style as the About points: mono label, details, link. */}
      <div className="flex items-end justify-between gap-4 pt-5">
        <div className="min-w-0">
          <p className="type-label text-ink/55">
            No.{number} · {event.type}
          </p>
          <p className="type-body mt-2 text-ink/60">
            {event.date} · {event.place}
          </p>
        </div>
        <a
          href="#events"
          aria-label={`View ${event.title}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
    </li>
  )
}

// Latest events: a full-width strip that sticks to the screen while the page
// scrolls, moving the cards sideways instead. The outer block is made as tall
// as the sideways distance (so vertical scroll maps 1:1 onto it) plus a short
// hold at the end. On phones and tablets it also snaps: when you stop
// scrolling, the strip glides to the nearest card, centred on screen.
export default function EventsSection({ className }) {
  const root = useRef(null)
  const track = useRef(null)

  useGSAP(
    () => {
      gsap.matchMedia().add({ desktop: PINNED, touch: FREE }, context => {
        const { touch } = context.conditions
        const section = root.current
        const row = track.current
        const distance = () => Math.max(0, row.scrollWidth - window.innerWidth)
        // Extra scroll before the cards start moving, so the first card can be
        // seen while the strip holds still...
        const lead = () => window.innerHeight * (touch ? 0.25 : 0.5)
        // ...and after the last card arrives, so the strip rests with every
        // event in view before the page moves on to the next section.
        const hold = () => window.innerHeight * (touch ? 0.35 : 0.6)

        // Re-measured on every refresh (resize, font load) before triggers recalc.
        const setHeight = () => {
          section.style.height = `${window.innerHeight + lead() + distance() + hold()}px`
        }
        setHeight()
        ScrollTrigger.addEventListener('refreshInit', setHeight)

        // Where the strip's progress (0 to 1) has each card centred on screen,
        // clamped to the ends; used for snapping on touch screens.
        const cardStops = () => {
          const total = distance()
          if (!total) return [0]
          return [...row.children].map(card => {
            const centred = card.offsetLeft + card.offsetWidth / 2 - window.innerWidth / 2
            return Math.min(1, Math.max(0, centred / total))
          })
        }

        // The strip sticks at the top, holds for `lead`, slides over `distance`,
        // then holds again for the rest of the block.
        gsap.to(row, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: () => `top top-=${lead()}`,
            end: () => `+=${distance()}`,
            scrub: touch ? 0.3 : 0.5,
            invalidateOnRefresh: true,
            snap: touch
              ? { snapTo: value => gsap.utils.snap(cardStops(), value), duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: 'power2.inOut' }
              : false,
          },
        })

        // This block's height pushes down everything after it, so whenever the
        // row's width changes (cards added or removed, a hot reload, a resize)
        // every scroll trigger is re-measured: this block's height, the pinned
        // About panel and the black section's cover. Otherwise they keep stale
        // positions and the next section slides up over the strip too early.
        let lastWidth = row.scrollWidth
        let timer = setTimeout(() => ScrollTrigger.refresh(), 50)
        const observer = new ResizeObserver(() => {
          if (row.scrollWidth === lastWidth) return
          lastWidth = row.scrollWidth
          clearTimeout(timer)
          timer = setTimeout(() => ScrollTrigger.refresh(), 50)
        })
        observer.observe(row)

        return () => {
          clearTimeout(timer)
          observer.disconnect()
          ScrollTrigger.removeEventListener('refreshInit', setHeight)
          section.style.height = ''
        }
      })
    },
    // Rebuilt when the event list changes (including on a hot reload), so the
    // height and scroll distance always match the cards on screen.
    { scope: root, dependencies: [EVENTS], revertOnUpdate: true },
  )

  return (
    <section
      ref={root}
      id="events"
      aria-labelledby="events-title"
      className={cn('relative h-[300svh]', className)}
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10">
        <div className="flex items-end justify-between gap-6 px-4 sm:px-10 lg:px-16">
          <h2
            id="events-title"
            className="type-h2"
          >
            Latest{' '}
            <span className="text-genesis-gradient type-accent">
              Events
            </span>
          </h2>
          <p className="type-body hidden max-w-[32ch] pb-2 text-ink/60 sm:block">
            Workshops, study jams and talks where Genesis members learn and build together.
          </p>
        </div>

        <ul
          ref={track}
          className="mt-8 flex min-h-0 w-max flex-1 gap-12 pt-[6svh] px-4 will-change-transform sm:mt-10 sm:gap-24 sm:px-10 lg:gap-40 lg:px-16"
        >
          {EVENTS.map((event, i) => (
            <EventCard key={event.seed} event={event} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
