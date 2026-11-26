import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react'

import TransitionLink from '@/components/common/TransitionLink'
import PageLayout from '@/components/layout/PageLayout'
import {
  EventBadge,
  RegistrationForm,
  findEvent,
  formatDates,
  photoOf,
  registrationState,
  statusOf,
} from '@/features/events'
import useReveal from '@/hooks/useReveal'
import NotFound from '@/pages/NotFound'

const DATE = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const longDate = value => DATE.format(new Date(`${value}T00:00:00Z`))

// One event's page (/events/<slug>): what it is, when and where, and its
// registration form when it takes sign-ups.
export default function EventDetail() {
  const { slug } = useParams()
  const event = findEvent(slug)
  const root = useRef(null)
  useReveal(root)

  if (!event) return <NotFound />

  const status = statusOf(event)
  const reg = registrationState(event)
  const facts = [
    { label: 'Date', value: formatDates(event) },
    event.time && { label: 'Time', value: event.time },
    { label: 'Place', value: event.place },
    event.mode && { label: 'Format', value: event.mode },
    ...(event.details ?? []),
  ].filter(Boolean)

  return (
    <PageLayout title={event.title}>
      <div ref={root} className="px-4 pt-12 pb-24 sm:px-10 sm:pt-16 sm:pb-36 lg:px-16">
        <TransitionLink
          to="/events"
          className="type-small inline-flex items-center gap-2 rounded-sm text-ink/60 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" /> All events
        </TransitionLink>

        <header className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="type-label text-ink/55">{event.type}</p>
              <EventBadge event={event} />
            </div>
            <h2 className="type-display mt-5">{event.title}</h2>
            <p className="type-lede mt-6 max-w-[48ch] text-ink/70">
              {formatDates(event)} · {event.place}
            </p>
            {reg === 'open' && (
              <div className="mt-8 flex flex-wrap gap-2">
                {event.registration.url ? (
                  <a href={event.registration.url} target="_blank" rel="noreferrer" className="btn btn-dark">
                    Register <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : (
                  <a href="#register" className="btn btn-dark">
                    Register <ArrowDown aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="aspect-[3/2] overflow-hidden bg-ink/5">
            <img
              src={photoOf(event)}
              alt=""
              className={status === 'past' ? 'size-full object-cover grayscale' : 'size-full object-cover'}
            />
          </div>
        </header>

        <section
          aria-label="About this event"
          className="mt-20 grid gap-12 border-t border-ink/10 pt-12 sm:mt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20"
        >
          <dl data-reveal className="grid h-fit grid-cols-2 gap-x-8 lg:grid-cols-1">
            {facts.map(fact => (
              <div key={fact.label} className="border-b border-ink/10 py-4">
                <dt className="type-fine text-ink/45">{fact.label}</dt>
                <dd className="type-body mt-1">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div data-reveal>
            <p className="type-statement">{event.summary}</p>
            {event.about?.map(paragraph => (
              <p key={paragraph} className="type-body mt-6 max-w-[60ch] text-ink/65">
                {paragraph}
              </p>
            ))}
            {status === 'past' && event.recap && (
              <a
                href={event.recap}
                target="_blank"
                rel="noreferrer"
                className="type-body group mt-10 inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <span className="border-b border-ink/30 pb-1 transition-colors group-hover:border-ink">See the recap</span>
                <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </a>
            )}
          </div>
        </section>

        {/* Registration, only for events that take sign-ups on this site. */}
        {event.registration && !event.registration.url && (
          <section
            id="register"
            aria-labelledby="register-title"
            className="mt-24 scroll-mt-24 border-t border-ink/10 pt-12 sm:mt-36"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 id="register-title" className="type-h2">
                  Register for <span className="text-genesis-gradient type-accent">{event.title}</span>
                </h2>
                {reg === 'open' && (
                  <p className="type-lede mt-4 max-w-[52ch] text-ink/65">
                    {event.registration.note ?? 'Takes a few minutes. You’ll get the details by email.'}
                    {event.registration.closes && ` Closes ${longDate(event.registration.closes)}.`}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-10 sm:mt-14">
              {reg === 'open' ? (
                <RegistrationForm event={event} />
              ) : (
                <p className="type-lede max-w-[48ch] text-ink/60">
                  {status === 'past'
                    ? 'This event has ended. Thanks to everyone who joined.'
                    : 'Registration for this event is closed.'}{' '}
                  See what’s next on the{' '}
                  <TransitionLink to="/events" className="border-b border-ink/30 text-ink hover:border-ink">
                    Events page
                  </TransitionLink>
                  .
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  )
}
