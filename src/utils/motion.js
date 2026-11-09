import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Scroll effects that take over the page (pinning a section in place, turning
// vertical scroll into sideways movement) only run on wide screens with a mouse
// or trackpad. Phones and tablets scroll freely and natively instead: nothing
// is held in place or snapped, and swipeable rows are real swipes.
// Keep in sync with the `pinned` / `free` variants in styles/index.css.
export const PINNED = '(min-width: 1024px) and (pointer: fine)'
export const FREE = '(max-width: 1023px), (pointer: coarse)'

// Touch devices get lighter WebGL backgrounds (fewer pixels to draw), which
// keeps scrolling smooth on phones.
export const isCoarsePointer = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false)

// Mobile browsers resize the window whenever the address bar slides in or out
// while scrolling. Re-measuring every scroll effect on each of those makes the
// page jump mid-scroll, so only real resizes (width changes) trigger it.
ScrollTrigger.config({ ignoreMobileResize: true })
