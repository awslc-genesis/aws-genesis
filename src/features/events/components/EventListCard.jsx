import TransitionLink from '@/components/common/TransitionLink'
import { cn } from '@/utils/cn'

import { photoOf, registrationState, statusOf } from '../eventUtils'
import TicketStub from './TicketStub'

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

// A card on the Events page, shaped like one ticket: photo, then the title and
// summary, then the same tear-off stub as the home page. The large one (the
// featured event) lies sideways on wide screens: photo, details, and the stub
// at the right end.
export default function EventListCard({ event, large = false }) {
  const past = statusOf(event) === 'past'
  return (
    <TransitionLink
      to={`/events/${event.slug}`}
      className={cn(
        'group flex h-full flex-col bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink',
        large && 'lg:flex-row',
      )}
    >
      <div className={cn('relative aspect-[3/2] overflow-hidden bg-ink/5', large && 'lg:aspect-[16/10] lg:w-5/12 lg:shrink-0')}>
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

      <div className={cn('min-w-0 flex-1 px-5 pt-5 pb-6 sm:px-7', large && 'lg:px-10 lg:py-8')}>
        <h3 className={cn(large ? 'type-h3 lg:type-statement' : 'type-h3')}>{event.title}</h3>
        <p className={cn('type-body mt-3 text-ink/60', large ? 'max-w-[44ch]' : 'max-w-[40ch]')}>{event.summary}</p>
      </div>

      <TicketStub event={event} side={large} />
    </TransitionLink>
  )
}
