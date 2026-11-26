import { useMemo, useRef, useState } from 'react'
import { DropdownMenu } from 'radix-ui'
import { Check, ChevronDown, X } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import SplitWords from '@/components/common/SplitWords'
import { EVENTS, EventListCard, pastEvents, upcomingEvents } from '@/features/events'
import useReveal from '@/hooks/useReveal'

const ALL = 'All'

// Event-type dropdown: a square trigger showing the current choice, opening a
// menu of every type with how many events each has.
function TypeFilter({ types, counts, value, onChange }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label={`Filter by type: ${value}`}
        className="group type-small inline-flex h-10 min-w-44 items-center justify-between gap-3 border border-ink/15 px-4 font-medium transition-colors hover:border-ink/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-[state=open]:border-ink"
      >
        <span>
          <span className="text-ink/50">Type: </span>
          {value === ALL ? 'All events' : value}
        </span>
        <ChevronDown
          className="size-4 text-ink/55 transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] border border-ink/15 bg-paper p-1 text-ink shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <DropdownMenu.Label className="type-label px-3 pt-2 pb-1.5 text-ink/45">Event type</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {types.map(option => (
              <DropdownMenu.RadioItem
                key={option}
                value={option}
                className="type-small flex h-10 cursor-pointer items-center gap-3 px-3 text-ink/75 outline-none select-none data-[highlighted]:bg-ink/[0.06] data-[highlighted]:text-ink data-[state=checked]:font-medium data-[state=checked]:text-ink"
              >
                <span className="flex size-4 items-center justify-center">
                  <DropdownMenu.ItemIndicator>
                    <Check className="size-4" aria-hidden="true" />
                  </DropdownMenu.ItemIndicator>
                </span>
                <span className="flex-1">{option === ALL ? 'All events' : option}</span>
                <span className="type-label text-ink/40 tabular-nums">{String(counts[option] ?? 0).padStart(2, '0')}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// Events page: what's coming up (the next one featured large), then what has
// already happened. Everything comes from src/features/events/data/events.js.
export default function Events() {
  const root = useRef(null)
  useReveal(root)
  const [type, setType] = useState(ALL)

  const types = useMemo(() => [ALL, ...new Set(EVENTS.map(event => event.type))], [])
  const counts = useMemo(() => {
    const tally = { [ALL]: EVENTS.length }
    for (const event of EVENTS) tally[event.type] = (tally[event.type] ?? 0) + 1
    return tally
  }, [])
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
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 sm:mt-16">
            <div className="flex items-center gap-3">
              <span className="type-label text-ink/55">Filter</span>
              <TypeFilter types={types} counts={counts} value={type} onChange={setType} />
              {type !== ALL && (
                <button
                  type="button"
                  onClick={() => setType(ALL)}
                  className="type-small inline-flex h-10 items-center gap-1.5 px-2 text-ink/55 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <X className="size-3.5" aria-hidden="true" /> Clear
                </button>
              )}
            </div>
            <p className="type-label text-ink/45 tabular-nums" aria-live="polite">
              {String(upcoming.length + past.length).padStart(2, '0')} {upcoming.length + past.length === 1 ? 'event' : 'events'}
            </p>
          </div>
        )}

        <section aria-labelledby="upcoming-title" className="mt-16 sm:mt-24">
          <div className="flex items-baseline justify-between gap-6">
            <h2 id="upcoming-title" className="type-h3 font-semibold">
              Upcoming
            </h2>
            <p className="type-label text-ink/45 tabular-nums">{String(upcoming.length).padStart(2, '0')}</p>
          </div>

          {featured ? (
            <>
              <div data-reveal className="mt-8 sm:mt-10">
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
            <div className="flex items-baseline justify-between gap-6">
              <h2 id="past-title" className="type-h3 font-semibold text-ink/55">
                Past events
              </h2>
              <p className="type-label text-ink/45 tabular-nums">{String(past.length).padStart(2, '0')}</p>
            </div>
            <ul className="mt-8 grid gap-x-10 gap-y-16 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
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
