// The sound of the stub being torn off, made in the browser with Web Audio,
// so there's no audio file to load. A rip is noise shaped three ways: a
// stuttering texture as the tear catches and runs, sharp crackles where
// fibres snap, and a band of frequencies that climbs as the tear speeds up.

const DURATION = 0.55

// Browsers only let a page start sound in response to a click, so create the
// audio context during the Submit click and play the rip later from it.
export function createRipAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  try {
    const context = new AudioContext()
    context.resume?.()
    return context
  } catch {
    return null
  }
}

export function playRip(context) {
  if (!context) return
  try {
    const rate = context.sampleRate
    const length = Math.floor(DURATION * rate)
    const buffer = context.createBuffer(1, length, rate)
    const data = buffer.getChannelData(0)

    let crackle = 0
    for (let i = 0; i < length; i += 1) {
      const t = i / rate
      // Fibres snapping: random sharp bursts that die away quickly.
      if (Math.random() < 0.0045) crackle = 0.5 + Math.random() * 0.9
      crackle *= 0.984
      // Quick start, steady run, fade at the end.
      const attack = Math.min(1, t / 0.025)
      const release = t < DURATION * 0.72 ? 1 : Math.max(0, 1 - (t - DURATION * 0.72) / (DURATION * 0.28))
      // The tear catches and runs, so the texture stutters.
      const stutter = 0.35 + 0.65 * Math.abs(Math.sin(t * 95 + Math.sin(t * 41) * 3))
      data[i] = (Math.random() * 2 - 1) * attack * release * (0.28 * stutter + crackle)
    }

    const now = context.currentTime
    const source = context.createBufferSource()
    source.buffer = buffer

    const highpass = context.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 500

    const band = context.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 0.8
    band.frequency.setValueAtTime(1300, now)
    band.frequency.exponentialRampToValueAtTime(3900, now + DURATION)

    const volume = context.createGain()
    volume.gain.value = 0.55

    source.connect(highpass).connect(band).connect(volume).connect(context.destination)
    source.start(now)
  } catch {
    // No sound is fine; the rip still plays on screen.
  }
}
