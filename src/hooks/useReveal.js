import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Every element marked data-reveal inside `scope` rises and fades in as it
// scrolls into view (and back out when scrolling up past it). Skipped for
// visitors who prefer reduced motion.
export default function useReveal(scope) {
  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-reveal]').forEach(element => {
          gsap.from(element, {
            y: 50,
            autoAlpha: 0,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: { trigger: element, start: 'top 88%', toggleActions: 'play none none reverse' },
          })
        })
      })
    },
    { scope },
  )
}
