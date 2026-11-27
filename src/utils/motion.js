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

// The screen height with the mobile address bar showing (CSS `100svh`). Unlike
// window.innerHeight it doesn't change as the bar slides in and out, so layout
// sized from it (like the events strip) stays put and the page never shifts
// under the visitor's finger. Matches the `h-svh` sticky panels.
let svhProbe = null
export const viewportHeight = () => {
  if (typeof document === 'undefined') return 0
  if (!svhProbe) {
    svhProbe = document.createElement('div')
    svhProbe.setAttribute('aria-hidden', 'true')
    svhProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(svhProbe)
  }
  return svhProbe.offsetHeight || window.innerHeight
}

// Mobile browsers resize the window whenever the address bar slides in or out
// while scrolling. Re-measuring every scroll effect on each of those makes the
// page jump mid-scroll, so only real resizes (width changes) trigger it.
ScrollTrigger.config({ ignoreMobileResize: true })
