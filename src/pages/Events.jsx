import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

import EventsSection from '@/components/EventsSection'
import PageLayout from '@/components/PageLayout'
import TransitionLink from '@/components/TransitionLink'
import useReveal from '@/lib/useReveal'

// Placeholder schedule: replace with the club's real upcoming events.
const UPCOMING = [
  { day: '21', month: 'Nov', title: 'Intro to AWS: Your First Account', type: 'Workshop', place: 'CCS Laboratory' },
  { day: '04', month: 'Dec', title: 'Cloud Practitioner Study Jam', type: 'Study jam', place: 'Online' },
  { day: '12', month: 'Dec', title: 'Build a Serverless API', type: 'Hands-on', place: 'TSU Main Campus' },
  { day: '23', month: 'Jan', title: 'Careers in Cloud: Alumni Talk', type: 'Talk', place: 'TSU Auditorium' },
]

export default function Events() {
  const root = useRef(null)
  useReveal(root)

  return (
    <PageLayout title="Events">
      <div ref={root} className="px-5 pt-24 sm:px-10 sm:pt-36 lg:px-16">
        <div data-reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="type-h2">
            Coming <span className="text-genesis-gradient type-accent">up</span>
          </h2>
          <p className="type-body max-w-[32ch] text-ink/60 sm:pb-2">Save the date, then register to get the details.</p>
        </div>

        {/* One row per event: date, title, type and place, and a register link. */}
        <ul className="mt-14 border-b border-ink/10 sm:mt-20">
          {UPCOMING.map(event => (
            <li
              key={event.title}
              data-reveal
              className="grid items-center gap-6 border-t border-ink/10 py-10 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-10 sm:py-12"
            >
              <p className="flex items-baseline gap-3">
                <span className="type-h2 tabular-nums">{event.day}</span>
                <span className="type-label text-ink/55">{event.month}</span>
              </p>
              <div>
                <h3 className="type-h3">{event.title}</h3>
                <p className="type-label mt-3 text-ink/55">
                  {event.type} · {event.place}
                </p>
              </div>
              <TransitionLink
                to="/contact"
                aria-label={`Register for ${event.title}`}
                className="type-body group inline-flex w-fit items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                Register
                <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Past events: the same sideways-scrolling strip as on the home page. */}
      <EventsSection className="mt-24 sm:mt-36" />
    </PageLayout>
  )
}
