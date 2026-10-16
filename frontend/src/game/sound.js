import { useSyncExternalStore } from 'react'

// Small sounds made with the Web Audio API (no files): a soft tick when a field locks, a pencil
// scratch for a wrong guess, a rising chime at the reveal. Off until the player turns it on, and
// the choice is remembered. The audio context is created on the first sound, after a tap, as
// browsers require.
const KEY = 'arch-guesser:sound'

let on = false
try {
  on = localStorage.getItem(KEY) === 'on'
} catch {
  // Storage blocked: starts off, not remembered.
}

let context = null
const audio = () => {
  if (!on) return null
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)()
    if (context.state === 'suspended') context.resume()
    return context
  } catch {
    return null
  }
}

/** One soft note: a sine with a quick attack and a decay, so it never clicks. */
function note(ac, { freq, start = 0, length = 0.12, gain = 0.07 }) {
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t)
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length)
  osc.connect(amp).connect(ac.destination)
  osc.start(t)
  osc.stop(t + length + 0.02)
}

export const tick = () => {
  const ac = audio()
  if (ac) note(ac, { freq: 880, length: 0.07, gain: 0.05 })
}

/** A short burst of filtered noise that sweeps down: a pencil dragged across paper. */
export const scratch = () => {
  const ac = audio()
  if (!ac) return
  const length = 0.16
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * length), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const source = ac.createBufferSource()
  source.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(3600, ac.currentTime)
  filter.frequency.exponentialRampToValueAtTime(1400, ac.currentTime + length)
  const amp = ac.createGain()
  amp.gain.setValueAtTime(0.0001, ac.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + length)
  source.connect(filter).connect(amp).connect(ac.destination)
  source.start()
}

export const chime = () => {
  const ac = audio()
  if (!ac) return
  note(ac, { freq: 523.25, length: 0.22, gain: 0.07 })
  note(ac, { freq: 783.99, start: 0.12, length: 0.34, gain: 0.07 })
}

const subscribe = (notify) => {
  window.addEventListener('soundchange', notify)
  return () => window.removeEventListener('soundchange', notify)
}

export const useSoundOn = () => useSyncExternalStore(subscribe, () => on, () => false)

/** Turns sound on or off, with a tick to show it is on. */
export function toggleSound() {
  on = !on
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // Not remembered.
  }
  window.dispatchEvent(new Event('soundchange'))
  if (on) tick()
}
