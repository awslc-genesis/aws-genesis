import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowDown } from 'lucide-react'

import DitherClouds from '@/components/animations/DitherClouds'
import SplitWords from '@/components/common/SplitWords'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import { ContactForm } from '@/features/contact'
import useReveal from '@/hooks/useReveal'
import { isCoarsePointer } from '@/utils/motion'
import { onPageReveal } from '@/utils/pageReveal'

gsap.registerPlugin(useGSAP)

// Contact page: a cloud hero with one big line, then a "Get in touch" sheet
// of underlined fields with large answers, on cream.
export default function Contact() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const intro = gsap
          .timeline({ defaults: { ease: 'expo.out' }, paused: true })
          .from('[data-hero-kicker]', { autoAlpha: 0, y: 12, duration: 0.8 })
          .from('[data-hero-title] [data-word]', { yPercent: 115, duration: 1.4, stagger: 0.07 }, '-=0.6')
          .from('[data-hero-after]', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08 }, '-=0.9')
        return onPageReveal(() => intro.play())
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative bg-ink">
      <Navbar tone="dark" />
      <main className="relative z-10 overflow-hidden rounded-b-[2.5rem] bg-paper text-ink sm:rounded-b-[4rem]">
        {/* Hero: the headline on open sky, with a band of drifting clouds
            below it, so the clouds never sit behind the text. */}
        <section className="relative bg-white" aria-labelledby="contact-title">
          <div className="relative flex flex-col px-4 pt-28 sm:px-10 lg:px-16 lg:pt-[18svh]">
            <p data-hero-kicker className="type-label text-ink/60">
              We are listening
            </p>
            <h1 id="contact-title" data-hero-title className="type-display mt-4 max-w-[14ch]">
              <SplitWords text="Tell us about" />{' '}
              <SplitWords
                text="your idea."
                wordClassName="text-genesis-gradient type-accent pb-[0.15em]"
                maskClassName="-mb-[0.15em]"
              />
            </h1>
            <p data-hero-after className="type-lede mt-6 max-w-[44ch] text-ink/70">
              Partnerships, talks, workshops or a question about joining. Genesis reads every message. No idea too
              early, no question too small.
            </p>
            <div data-hero-after className="mt-7">
              <a href="#get-in-touch" className="btn btn-dark">
                Write to us <ArrowDown aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="relative mt-12 h-[clamp(14rem,42svh,28rem)] overflow-hidden sm:mt-16">
            <DitherClouds cellSize={isCoarsePointer() ? 2 : 3} />
            {/* Fades the clouds into the cream sheet below. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-paper" />
          </div>
        </section>

        {/* The sheet: a small heading on the left, the fields on the right. */}
        <section
          id="get-in-touch"
          aria-labelledby="get-in-touch-title"
          className="grid scroll-mt-20 gap-10 px-4 pt-16 pb-24 sm:px-10 sm:pt-24 sm:pb-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20 lg:px-16"
        >
          <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="get-in-touch-title" className="type-h2 pb-[0.1em]">
              Get in <span className="text-genesis-gradient type-accent">touch.</span>
            </h2>
            <p className="type-lede mt-6 max-w-[32ch] text-ink/70">
              We usually reply within a few days. Want to become a member instead? Use the Join page.
            </p>
          </div>
          <div data-reveal>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer tone="dark" />
    </div>
  )
}
