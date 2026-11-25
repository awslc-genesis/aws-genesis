// What the application form asks for, and what counts as a valid answer. The
// Google Sheets script (integrations/google-sheets/Code.gs) repeats these
// choices, so change both together.
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

export const DEPARTMENTS = ['Operations', 'Finance', 'Tech Team', 'Creatives', 'N/A (Member only)']

const FACEBOOK_HOST = /(^|\.)(facebook\.com|fb\.com|fb\.me)$/i

// Accepts links with or without https:// and returns the full link, or null
// when it isn't a link to someone's Facebook page.
export function facebookUrl(value) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return FACEBOOK_HOST.test(url.hostname) && url.pathname.length > 1 ? url.href : null
  } catch {
    return null
  }
}

// Returns an error message per invalid field; empty when everything is fine.
export function validate(values) {
  const errors = {}
  if (!values.name) errors.name = 'Enter your name.'
  if (!values.college) errors.college = 'Enter your college.'
  if (!YEARS.includes(values.year)) errors.year = 'Choose your year.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!facebookUrl(values.facebook)) errors.facebook = 'Enter a link to your Facebook profile.'
  if (!DEPARTMENTS.includes(values.department)) errors.department = 'Choose a department.'
  if (!values.reason) errors.reason = 'Tell us why you want to join.'
  return errors
}
