import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'

import TiltedCard, { TiltedCardLayer } from '@/components/TiltedCard'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Placeholder events with stock photos (picsum.photos, fixed per seed so they
// don't change between visits). Replace with the club's real events, photos,
// summaries and links, newest first.
const EVENTS = [
  {
    title: 'AWS Cloud Day 2026',
    type: 'Conference',
    date: 'Nov 5, 2026',
    place: 'TSU Main Campus',
    seed: 'genesis-cloud-day',
    summary: 'A full day of talks and demos on how students and startups build on AWS, closing with a community mixer.',
  },
  {
    title: 'Serverless 101 Workshop',
    type: 'Workshop',
    date: 'Oct 24, 2026',
    place: 'CCS Laboratory',
    seed: 'genesis-serverless',
    summary: 'Members built and deployed their first Lambda function behind API Gateway, start to finish in one afternoon.',
  },
  {
    title: 'Build Your First Website',
    type: 'Hands-on',
    date: 'Oct 10, 2026',
    place: 'Online',
    seed: 'genesis-website',
    summary: 'A beginner-friendly session on hosting a static website with Amazon S3 and CloudFront.',
  },
]

function EventCard({ event, index }) {
  // Cards alternate a little above and below the row's center for an editorial rhythm.
  const raised = index % 2 === 1
  const number = String(index + 1).padStart(2, '0')

  return (
    <li
      className={cn(
        // Width follows the screen's height on wide screens, so a card plus its
        // caption always fits vertically; on phones one card fills most of the
        // width with the next peeking in.
        'relative w-[min(85vw,66svh)] shrink-0 self-center text-ink',
        raised ? '-translate-y-[5svh]' : 'translate-y-[5svh]',
      )}
    >
      {/* Landscape photo as a React Bits TiltedCard: it tilts toward the
          pointer with a glare, the title floats on a parallax layer, and a
          click flips it over to the event's summary. Black and white until
          hovered (see .event-tilt in index.css). */}
      <div className="aspect-[3/2]">
        <TiltedCard
          className="event-tilt"
          imageSrc={`https://picsum.photos/seed/${event.seed}/1200/800`}
          altText={event.title}
          captionText={event.title}
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          radius={28}
          rotateAmplitude={12}
          scaleOnHover={1.05}
          glare={0.5}
          shadow={0.5}
          backContent={
            <div className="flex size-full flex-col justify-between bg-ink p-6 text-paper sm:p-8">
              <p className="type-label text-paper/55">
                {event.date} · {event.place}
              </p>
              <p className="type-body max-w-[36ch] text-paper/80">{event.summary}</p>
              <p className="type-label text-paper/40">Click to flip back</p>
            </div>
          }
        >
          <TiltedCardLayer depth={30}>
            {/* Darkens the bottom of the photo so the title stays readable. */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
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
          <p className="type-body mt-2 text-ink/55">
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
// hold at the end.
export default function EventsSection({ className }) {
  const root = useRef(null)
  const track = useRef(null)

  useGSAP(
    () => {
      const section = root.current
      const row = track.current
      const distance = () => Math.max(0, row.scrollWidth - window.innerWidth)
      // Extra scroll before the cards start moving, so the first card can be
      // seen while the strip holds still...
      const lead = () => window.innerHeight * 0.5
      // ...and after the last card arrives, so the strip rests with every
      // event in view before the page moves on to the next section.
      const hold = () => window.innerHeight * 0.6

      // Re-measured on every refresh (resize, font load) before triggers recalc.
      const setHeight = () => {
        section.style.height = `${window.innerHeight + lead() + distance() + hold()}px`
      }
      setHeight()
      ScrollTrigger.addEventListener('refreshInit', setHeight)

      // The strip sticks at the top, holds for `lead`, slides over `distance`,
      // then holds again for the rest of the block.
      gsap.to(row, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: () => `top top-=${lead()}`,
          end: () => `+=${distance()}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
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
        <div className="flex items-end justify-between gap-6 px-5 sm:px-10 lg:px-16">
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
          className="mt-8 flex min-h-0 w-max flex-1 gap-12 px-5 will-change-transform sm:mt-10 sm:gap-24 sm:px-10 lg:gap-40 lg:px-16"
        >
          {EVENTS.map((event, i) => (
            <EventCard key={event.seed} event={event} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
