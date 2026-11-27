import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/utils/cn'

import { statusOf } from '../eventUtils'

// The big date: "15" with "Jan 2027", "15–16" for multi-day events in one
// month, or "TBA" while the date isn't set.
const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })
function stubDate(event) {
  if (!event.date) return { day: 'TBA', month: 'Date' }
  const [y, m, d] = event.date.split('-').map(Number)
  const month = MONTH_YEAR.format(new Date(Date.UTC(y, m - 1, d)))
  const end = event.endDate && event.endDate.slice(0, 7) === event.date.slice(0, 7) ? Number(event.endDate.slice(8)) : null
  return { day: end && end !== d ? `${d}–${end}` : String(d), month }
}

// The tear-off end of an event ticket, shared by the home page strip and the
// Events page: a dashed tear line with notches punched into its ends, then the
// date, the event's type and place, and an arrow. It sits at the bottom of a
// ticket; with `side`, it moves to the ticket's right end on wide screens
// (tear line down its left edge). Put it inside an element with the `group`
// class (the link) so the arrow turns on hover. The notches are paper-coloured,
// so the ticket must sit on the paper background.
export default function TicketStub({ event, side = false, className }) {
  const date = stubDate(event)
  const past = statusOf(event) === 'past'

  return (
    <div
      className={cn(
        'relative flex items-center gap-5 bg-white px-5 py-4 sm:px-7',
        side && 'lg:w-60 lg:shrink-0 lg:flex-col lg:items-start lg:justify-between lg:gap-6 lg:py-8',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-5 top-0 border-t border-dashed border-ink/20',
          side && 'lg:inset-x-auto lg:inset-y-5 lg:left-0 lg:border-t-0 lg:border-l',
        )}
      />
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper"
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 right-0 size-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-paper',
          side && 'lg:top-auto lg:right-auto lg:bottom-0 lg:left-0 lg:-translate-x-1/2 lg:translate-y-1/2',
        )}
      />

      {/* Gradient text only paints inside its own box, so the box gets a
          taller line and a little side padding to fit the whole glyphs.
          Past events keep a grey date. */}
      <span
        className={cn(
          'shrink-0 px-[0.06em] text-[32px] leading-[1.15] font-bold tracking-[-0.04em]',
          side && 'lg:-ml-[0.06em] lg:text-[56px]',
          past ? 'text-ink/35' : 'text-genesis-gradient',
        )}
      >
        {date.day}
      </span>

      <span className={cn('min-w-0 flex-1', side && 'lg:flex-none lg:self-stretch')}>
        <span className="type-label block text-ink/55">
          {date.month} · {event.type}
        </span>
        <span className="type-small mt-0.5 block truncate text-ink/70">{event.place}</span>
      </span>

      <ArrowUpRight
        aria-hidden="true"
        className={cn(
          'size-5 shrink-0 text-ink/40 transition-[color,rotate] duration-300 group-hover:rotate-45 group-hover:text-[#f68a2c]',
          side && 'lg:self-end',
        )}
      />
    </div>
  )
}
