// Vercel function: emails a Contact page message to the club's inbox through
// Resend (https://resend.com). Setup is in .env.example. The visitor's address
// is set as Reply-To, so answering the email answers them.
import { TOPICS, validate } from '../src/features/contact/fields.js'

const RESEND_URL = 'https://api.resend.com/emails'
const LIMITS = { name: 100, email: 150, organization: 120, topic: 60, message: 2000 }

const json = (body, status = 200) => Response.json(body, { status })

export async function POST(request) {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.error('Contact email is not set up: RESEND_API_KEY and CONTACT_TO_EMAIL are required.')
    return json({ ok: false, error: 'not_configured' }, 500)
  }

  let input
  try {
    input = await request.json()
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400)
  }

  // Spam bots fill in the hidden field; pretend it worked and drop it.
  if (input.website) return json({ ok: true })

  const values = {}
  for (const [key, max] of Object.entries(LIMITS)) values[key] = String(input[key] ?? '').trim().slice(0, max)
  const errors = validate(values)
  if (Object.keys(errors).length || !TOPICS.includes(values.topic)) {
    return json({ ok: false, error: 'invalid', fields: Object.keys(errors) }, 400)
  }

  const text = [
    values.message || '(No message)',
    '',
    '—',
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.organization ? `School or organization: ${values.organization}` : null,
    `Topic: ${values.topic}`,
  ]
    .filter(line => line !== null)
    .join('\n')

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL || 'Genesis Contact <onboarding@resend.dev>',
      to: CONTACT_TO_EMAIL.split(',').map(address => address.trim()),
      reply_to: values.email,
      subject: `[Contact] ${values.topic} — ${values.name}`,
      text,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    console.error('Resend refused the message:', response.status, await response.text())
    return json({ ok: false, error: 'send_failed' }, 502)
  }
  return json({ ok: true })
}
