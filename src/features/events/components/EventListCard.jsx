import TransitionLink from '@/components/common/TransitionLink'
import { cn } from '@/utils/cn'

import { formatDates, photoOf, registrationState, statusOf } from '../eventUtils'

// Small pill on a card: "Registration open", "Happening now", "Past"…
export function EventBadge({ event, className }) {
  const status = statusOf(event)
  const reg = registrationState(event)
  const label =
    status === 'past' ? 'Past' : status === 'ongoing' ? 'Happening now' : reg === 'open' ? 'Registration open' : reg === 'closed' ? 'Registration closed' : 'Upcoming'
  const live = status !== 'past' && (reg === 'open' || status === 'ongoing')
  return (
    <span
      className={cn(
        'type-fine inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 font-medium',
        live ? 'bg-ink text-paper' : 'bg-ink/[0.06] text-ink/60',
        className,
      )}
    >
      {live && <span aria-hidden="true" className="size-1.5 rounded-full bg-[#f68a2c]" />}
      {label}
    </span>
  )
}

// A card on the Events page: photo, type, title, date and place, linking to
// the event's own page. Past events stay black and white.
export default function EventListCard({ event, large = false }) {
  const past = statusOf(event) === 'past'
  return (
    <TransitionLink
      to={`/events/${event.slug}`}
      className={cn(
        'group grid h-full gap-6 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink',
        large && 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12',
      )}
    >
      <div className={cn('relative aspect-[3/2] overflow-hidden bg-ink/5', large && 'lg:aspect-[16/10]')}>
        <img
          src={photoOf(event)}
          alt=""
          loading="lazy"
          className={cn(
            'size-full object-cover transition-[filter,scale] duration-700 ease-out group-hover:scale-[1.03]',
            past ? 'grayscale' : 'grayscale group-hover:grayscale-0',
          )}
        />
        <EventBadge event={event} className="absolute top-4 left-4" />
      </div>

      <div className={cn('flex min-w-0 flex-col', large && 'lg:justify-between lg:py-2')}>
        <div>
          <p className="type-label text-ink/55">
            {event.type} · {formatDates(event)}
          </p>
          <h3 className={cn('mt-3', large ? 'type-h3 lg:type-statement' : 'type-h3')}>{event.title}</h3>
          <p className={cn('type-body mt-4 text-ink/60', large ? 'max-w-[44ch]' : 'max-w-[40ch]')}>{event.summary}</p>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
          <p className="type-small truncate text-ink/55">{event.place}</p>
          <span className="type-small inline-flex h-10 shrink-0 items-center border border-ink/15 px-4 font-medium transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
            Check it out!
          </span>
        </div>
      </div>
    </TransitionLink>
  )
}
