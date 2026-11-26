import { EVENTS } from './data/events'

const eventPhotos = import.meta.glob('/src/assets/images/events/*.{avif,jpeg,jpg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

// Today's date in the Philippines as 'YYYY-MM-DD', so an event is "past" from
// the day after it ends there, wherever the visitor is.
export function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())
}

// 'upcoming' | 'ongoing' | 'past'
// An event without a date yet counts as upcoming.
export function statusOf(event, now = today()) {
  if (!event.date) return 'upcoming'
  const end = event.endDate || event.date
  if (now < event.date) return 'upcoming'
  if (now > end) return 'past'
  return 'ongoing'
}

// 'open' | 'closed' | 'none'. Registration closes on its `closes` day (or when
// the event starts) unless the event says otherwise.
export function registrationState(event, now = today()) {
  const reg = event.registration
  if (!reg) return 'none'
  if (reg.closed) return 'closed'
  const lastDay = reg.closes || event.date
  if (!lastDay) return 'open'
  return now <= lastDay && statusOf(event, now) !== 'past' ? 'open' : 'closed'
}

export function photoOf(event) {
  return (
    (event.photoFile && eventPhotos[`/src/assets/images/events/${event.photoFile}`]) ||
    `https://picsum.photos/seed/${event.slug}/1200/800`
  )
}

const parse = value => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const fmt = options => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options })
const DAY = fmt({ day: 'numeric' })
const MONTH_DAY = fmt({ month: 'short', day: 'numeric' })
const FULL = fmt({ month: 'short', day: 'numeric', year: 'numeric' })

// "Feb 20, 2027", "Feb 20 – 21, 2027", "Feb 28 – Mar 1, 2027", or "Date TBA"
export function formatDates(event) {
  if (!event.date) return 'Date TBA'
  const start = parse(event.date)
  if (!event.endDate || event.endDate === event.date) return FULL.format(start)
  const end = parse(event.endDate)
  if (start.getUTCFullYear() !== end.getUTCFullYear()) return `${FULL.format(start)} – ${FULL.format(end)}`
  if (start.getUTCMonth() === end.getUTCMonth()) return `${MONTH_DAY.format(start)} – ${DAY.format(end)}, ${end.getUTCFullYear()}`
  return `${MONTH_DAY.format(start)} – ${FULL.format(end)}`
}

// Upcoming and ongoing events, soonest first; ones without a date yet last.
export function upcomingEvents(now = today()) {
  return EVENTS.filter(event => statusOf(event, now) !== 'past').sort((a, b) =>
    (a.date || '9999').localeCompare(b.date || '9999'),
  )
}

// Past events, most recent first.
export function pastEvents(now = today()) {
  return EVENTS.filter(event => statusOf(event, now) === 'past').sort((a, b) => b.date.localeCompare(a.date))
}

// What the home page strip shows: what's coming up, then the latest past ones.
export function latestEvents(limit = 6) {
  return [...upcomingEvents(), ...pastEvents()].slice(0, limit)
}

export function findEvent(slug) {
  return EVENTS.find(event => event.slug === slug)
}
