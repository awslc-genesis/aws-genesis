// What the contact form asks for, and what counts as a valid answer. The
// server (api/contact.js) checks the same rules, so keep this file free of
// browser-only code.

// Picking this topic shows a note pointing to the Join page.
export const JOIN_TOPIC = 'Joining Genesis'

export const TOPICS = ['Partnership or sponsorship', 'Talk or workshop', JOIN_TOPIC, 'Something else']

// Returns an error message per invalid field; empty when everything is fine.
export function validate(values) {
  const errors = {}
  if (!values.name) errors.name = 'Enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!TOPICS.includes(values.topic)) errors.topic = 'Choose a topic.'
  return errors
}
