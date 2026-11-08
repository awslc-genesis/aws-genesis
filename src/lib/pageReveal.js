// Tells pages when the transition curtain has lifted, so their intro
// animations play where the visitor can see them instead of behind the
// curtain. The curtain (PageTransition) calls markCovered() before it swaps
// the route and markRevealed() as it starts to lift; pages call onPageReveal().

let revealed = false
const listeners = new Set()

export function markCovered() {
  revealed = false
}

export function markRevealed() {
  revealed = true
  for (const listener of [...listeners]) listener()
  listeners.clear()
}

// Runs `callback` once the page is revealed (straight away if it already is).
// Returns a function that cancels it, for effect cleanup.
export function onPageReveal(callback) {
  if (revealed) {
    callback()
    return () => {}
  }
  listeners.add(callback)
  return () => listeners.delete(callback)
}
