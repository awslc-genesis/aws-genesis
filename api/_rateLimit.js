// A small in-memory rate limiter for the Vercel functions. Files in api/ that
// start with "_" are not routes. Counts live in the function instance's memory,
// so they reset on a cold start and aren't shared between instances: it slows
// down a single sender hammering the form, not a spread-out attack.

const buckets = new Map()

// Allows `limit` hits per `windowMs` for each key. Returns how many seconds to
// wait when the key is over its limit, or 0 when this hit is allowed.
export function hit(key, limit, windowMs) {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter(time => now - time < windowMs)
  if (recent.length >= limit) {
    buckets.set(key, recent)
    return Math.ceil((recent[0] + windowMs - now) / 1000)
  }
  recent.push(now)
  buckets.set(key, recent)
  sweep(now)
  return 0
}

// Drop keys that have gone quiet, so memory doesn't grow with every visitor.
let lastSweep = 0
function sweep(now) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, times] of buckets) {
    if (!times.length || now - times[times.length - 1] > 60 * 60_000) buckets.delete(key)
  }
}

// The visitor's address as Vercel reports it.
export function clientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  )
}
