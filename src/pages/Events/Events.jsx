import { useMemo, useRef, useState } from 'react'

import PageLayout from '@/components/layout/PageLayout'
import SplitWords from '@/components/common/SplitWords'
import { EVENTS, EventListCard, pastEvents, upcomingEvents } from '@/features/events'
import useReveal from '@/hooks/useReveal'
import { cn } from '@/utils/cn'

const ALL = 'All'

// Events page: what's coming up (the next one featured large), then what has
// already happened. Everything comes from src/features/events/data/events.js.
export default function Events() {
  const root = useRef(null)
  useReveal(root)
  const [type, setType] = useState(ALL)

  const types = useMemo(() => [ALL, ...new Set(EVENTS.map(event => event.type))], [])
  const matches = event => type === ALL || event.type === type
  const upcoming = upcomingEvents().filter(matches)
  const past = pastEvents().filter(matches)
  const [featured, ...later] = upcoming

  return (
    <PageLayout title="Events">
      <div ref={root} className="px-4 pt-16 pb-24 sm:px-10 sm:pt-24 sm:pb-36 lg:px-16">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="type-label text-ink/55">Hackathons · Webinars · Seminars · Workshops</p>
            <h2 className="type-display mt-4 max-w-[14ch]">
              <SplitWords text="Learn it, build it," />{' '}
              <SplitWords
                text="ship it."
                wordClassName="text-genesis-gradient type-accent pb-[0.15em]"
                maskClassName="-mb-[0.15em]"
              />
            </h2>
          </div>
          <p className="type-lede max-w-[40ch] text-ink/70 lg:pb-3">
            Everything Genesis runs, in one place. Register for what’s next, or look back at what we’ve built together.
          </p>
        </header>

        {types.length > 2 && (
          <div role="group" aria-label="Filter by type" className="mt-12 flex flex-wrap gap-2 sm:mt-16">
            {types.map(option => (
              <button
                key={option}
                type="button"
                aria-pressed={type === option}
                onClick={() => setType(option)}
                className={cn(
                  'type-small h-10 rounded-full border px-4 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  type === option ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink/70 hover:border-ink/50 hover:text-ink',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <section aria-labelledby="upcoming-title" className="mt-16 sm:mt-24">
          <div className="flex items-end justify-between gap-6 border-b border-ink/10 pb-5">
            <h2 id="upcoming-title" className="type-h2">
              Upcoming
            </h2>
            <p className="type-label pb-1 text-ink/55 tabular-nums">{String(upcoming.length).padStart(2, '0')}</p>
          </div>

          {featured ? (
            <>
              <div data-reveal className="mt-10 sm:mt-14">
                <EventListCard event={featured} large />
              </div>
              {later.length > 0 && (
                <ul className="mt-16 grid gap-x-10 gap-y-16 sm:mt-24 sm:grid-cols-2 lg:grid-cols-3">
                  {later.map(event => (
                    <li key={event.slug} data-reveal>
                      <EventListCard event={event} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="type-lede mt-10 max-w-[44ch] text-ink/60">
              Nothing scheduled{type !== ALL && ` for ${type.toLowerCase()}s`} yet. New events are announced here and on
              our Facebook page.
            </p>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past-title" className="mt-24 sm:mt-36">
            <div className="flex items-end justify-between gap-6 border-b border-ink/10 pb-5">
              <h2 id="past-title" className="type-h2 text-ink/35">
                Past events
              </h2>
              <p className="type-label pb-1 text-ink/55 tabular-nums">{String(past.length).padStart(2, '0')}</p>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-16 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
              {past.map(event => (
                <li key={event.slug} data-reveal>
                  <EventListCard event={event} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageLayout>
  )
}
