// Turns a form from data/forms.js into what the page needs: which questions
// are showing, what's missing, and the rows sent to Google Sheets.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LENGTH = { textarea: 2000, default: 200 }

export const isShown = (field, values) => !field.showIf || field.showIf(values)

export const visibleFields = (step, values) => step.fields.filter(field => isShown(field, values))

// How many members a 'members' question asks for, from the size of the option
// picked in its `countFrom` question.
export function memberCount(field, form, values) {
  const source = form.flatMap(step => step.fields).find(f => f.name === field.countFrom)
  const picked = source?.options?.find(option => (option.value ?? option) === values[field.countFrom])
  return picked?.size ?? 1
}

export const memberFields = (field, index) => field.fields.filter(f => !f.leaderOnly || index === 0)

function checkValue(field, value) {
  const text = typeof value === 'string' ? value.trim() : value
  const required = field.required !== false
  if (field.type === 'check') return required && !text ? 'Tick this box to continue.' : null
  if (!text) return required ? (field.type === 'choice' || field.type === 'cards' ? 'Choose one.' : 'Fill this in.') : null
  if (field.type === 'email' && !EMAIL.test(text)) return 'Enter a valid email address.'
  if (field.type === 'tel' && !/^[+\d][\d\s-]{6,19}$/.test(text)) return 'Enter a valid mobile number.'
  return null
}

// Errors for one step, keyed by the input's name ("email", "members.0.email").
export function validateStep(step, form, values) {
  const errors = {}
  for (const field of visibleFields(step, values)) {
    if (field.type === 'note') continue
    if (field.type === 'members') {
      const count = memberCount(field, form, values)
      for (let i = 0; i < count; i++) {
        for (const sub of memberFields(field, i)) {
          const error = checkValue(sub, values[field.name]?.[i]?.[sub.name])
          if (error) errors[`${field.name}.${i}.${sub.name}`] = error
        }
      }
      continue
    }
    const error = checkValue(field, values[field.name])
    if (error) errors[field.name] = error
  }
  return errors
}

const clip = (field, value) => String(value ?? '').trim().slice(0, MAX_LENGTH[field.type] ?? MAX_LENGTH.default)

// The answers as [heading, answer] pairs, in the order asked. Questions that
// were hidden are left out; members become "Member 1 · Full name" and so on.
export function toRows(form, values) {
  const rows = []
  for (const step of form) {
    for (const field of visibleFields(step, values)) {
      if (field.type === 'note') continue
      if (field.type === 'members') {
        const count = memberCount(field, form, values)
        for (let i = 0; i < count; i++) {
          for (const sub of memberFields(field, i)) {
            rows.push([`Member ${i + 1} · ${sub.label}`, clip(sub, values[field.name]?.[i]?.[sub.name])])
          }
        }
        continue
      }
      const value = values[field.name]
      rows.push([field.label, field.type === 'check' ? (value ? 'Yes' : 'No') : clip(field, value)])
    }
  }
  return rows
}

// The registrant's email: the first email question, or member 1's.
export function contactEmail(form, values) {
  for (const step of form) {
    for (const field of step.fields) {
      if (field.type === 'email' && values[field.name]) return values[field.name].trim()
      if (field.type === 'members') {
        const sub = field.fields.find(f => f.type === 'email')
        const email = sub && values[field.name]?.[0]?.[sub.name]
        if (email) return email.trim()
      }
    }
  }
  return ''
}

// The Google Apps Script web app that saves registrations. See
// integrations/google-sheets/README.md for how to get this address.
const ENDPOINT = import.meta.env.VITE_EVENTS_SHEET_URL

// Sends one registration to the sheet. Throws when it was not saved.
export async function submitRegistration({ event, form, values, id, website }) {
  if (!ENDPOINT) throw new Error('VITE_EVENTS_SHEET_URL is not set')
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    // Plain text on purpose: Apps Script can't answer the extra permission
    // request browsers send ahead of application/json.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      id,
      website,
      event: event.slug,
      eventTitle: event.title,
      email: contactEmail(form, values),
      rows: toRows(form, values),
    }),
    signal: AbortSignal.timeout(30_000),
  })
  const result = await response.json()
  if (!result.ok) throw new Error(result.error || 'The registration was not saved')
}
