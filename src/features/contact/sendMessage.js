const TIMEOUT_MS = 20_000

// Sends one contact message to the club's inbox (api/contact.js). Throws when
// it was not sent.
export async function sendMessage(message) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) throw new Error(result.error || `HTTP ${response.status}`)
}
