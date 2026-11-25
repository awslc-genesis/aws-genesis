// The Google Apps Script web app that adds each application to the sheet. See
// integrations/google-sheets/README.md for how to get this address.
const ENDPOINT = import.meta.env.VITE_JOIN_SHEET_URL
const TIMEOUT_MS = 30_000

// Sends one application to the sheet. Throws when it was not saved.
export async function submitApplication(application) {
  if (!ENDPOINT) throw new Error('VITE_JOIN_SHEET_URL is not set')

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    // Plain text on purpose: Apps Script can't answer the extra permission
    // request browsers send ahead of application/json.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(application),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const result = await response.json()
  if (!result.ok) throw new Error(result.error || 'The application was not saved')
}
