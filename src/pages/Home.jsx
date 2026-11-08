import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'

import AwsLogo from '@/components/AwsLogo'
import CircularText from '@/components/CircularText'
import DarkVeil from '@/components/DarkVeil'
import Footer from '@/components/Footer'
import GradientASCII from '@/components/GradientASCII'
import Navbar from '@/components/Navbar'
import SplitWords from '@/components/SplitWords'
import VariableProximity from '@/components/VariableProximity'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STATEMENT =
  'Genesis is where students of Tarlac State University start building in the cloud, learning AWS side by side and shipping real things together.'

// Draft copy for the three points under the AWS logo; replace with the club's own wording.
const FEATURES = [
  {
    title: 'Learn the cloud',
    body: 'Get hands-on with AWS alongside fellow students, from your first account to your first deploy.',
  },
  {
    title: 'Build together',
    body: 'Turn what you learn into real projects with teammates who are learning the same things.',
  },
  {
    title: 'Grow your path',
    body: 'Pick up the skills and connections that carry into internships, certifications and tech careers.',
  },
]

export default function Home() {
  const root = useRef(null)
  const [veilPaused, setVeilPaused] = useState(false)
  const pressStart = useRef(null)
  const heroTitleRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Hero intro: headline words rise out of their masks.
        gsap
          .timeline({ defaults: { ease: 'expo.out' }, delay: 0.25 })
          // VariableProximity also marks its own inner words with data-word; skip those.
          .from('[data-hero-title] [data-word]:not(.variable-proximity [data-word])', {
            yPercent: 115,
            duration: 1.4,
            stagger: 0.08,
          })

        // As the white panel rises, the hero recedes: content drifts up and dims,
        // the veil sinks back, and the panel's top corners flatten as it lands.
        const cover = {
          trigger: '[data-panel]',
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        }
        gsap.to('[data-hero-content]', { yPercent: -18, autoAlpha: 0, ease: 'none', scrollTrigger: cover })
        gsap.to('[data-hero-veil]', { scale: 0.92, ease: 'none', scrollTrigger: cover })
        gsap.to('[data-hero-dim]', { opacity: 0.7, ease: 'none', scrollTrigger: cover })
        gsap.fromTo(
          '[data-panel]',
          { borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' },
          { borderTopLeftRadius: 0, borderTopRightRadius: 0, ease: 'none', scrollTrigger: cover },
        )

        // Statement words brighten one by one while it scrolls through the viewport.
        gsap.fromTo(
          '[data-statement] [data-word]',
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: '[data-statement]', start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        )

        // AWS logo pops up from below the statement as it scrolls into view,
        // overshooting slightly before settling.
        gsap.from('[data-aws-logo]', {
          scale: 0.25,
          yPercent: 45,
          rotate: -14,
          autoAlpha: 0,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '[data-aws-logo]', start: 'top 95%', end: 'center 55%', scrub: 0.6 },
        })

        // The three points reveal column by column when they reach the viewport:
        // the number fades in, the title rises out of its mask, then the text.
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: '[data-features]', start: 'top 85%', toggleActions: 'play none none reverse' },
          })
          .from('[data-feature-label]', { autoAlpha: 0, x: -12, duration: 0.8, stagger: 0.15 })
          .from('[data-feature-title]', { yPercent: 115, duration: 1.1, stagger: 0.15 }, 0.1)
          .from('[data-feature-body]', { autoAlpha: 0, y: 24, duration: 1, stagger: 0.15 }, 0.3)

        // A little further down, the membership button rises in under the logo.
        gsap.from('[data-member-cta]', {
          y: 40,
          autoAlpha: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: '[data-member-cta]', start: 'top 98%', end: 'top 78%', scrub: 0.6 },
        })

        // While the black section covers About: About darkens and the black
        // section's top corners flatten as it reaches the top.
        const coverAbout = { trigger: '[data-cover]', start: 'top bottom', end: 'top top', scrub: true }
        gsap.to('[data-about-dim]', { opacity: 0.65, ease: 'none', scrollTrigger: coverAbout })
        gsap.fromTo(
          '[data-cover]',
          { borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' },
          { borderTopLeftRadius: 0, borderTopRightRadius: 0, ease: 'none', scrollTrigger: coverAbout },
        )
      })

      // Hold the About panel in place once its bottom reaches the bottom of the
      // screen, so the next section scrolls up over it instead of pushing it away.
      ScrollTrigger.create({
        trigger: '[data-panel]',
        start: 'bottom bottom',
        end: () => `+=${window.innerHeight}`,
        pin: true,
        pinSpacing: false,
      })

      // Stop the shader animating once the panel fully covers it.
      ScrollTrigger.create({
        trigger: '[data-panel]',
        start: 'top top',
        onEnter: () => setVeilPaused(true),
        onLeaveBack: () => setVeilPaused(false),
      })

      // Fonts change text metrics, so re-measure triggers once they load.
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative bg-ink">
      {/* Page-level so the full-screen menu stacks above every section. */}
      <Navbar />
      {/* Hero stays pinned (CSS sticky) while the next section slides over it. */}
      <section id="home" className="sticky top-0 h-svh overflow-hidden text-white" aria-labelledby="hero-title">
        <div data-hero-veil className="absolute inset-0 origin-top">
          <DarkVeil color="#6e2406" paused={veilPaused} />
        </div>
        <div data-hero-dim className="pointer-events-none absolute inset-0 bg-ink opacity-0" />


        <div
          data-hero-content
          className="relative flex h-full flex-col justify-end px-5 pb-10 sm:px-10 sm:pb-14"
        >
          {/* Tight sans set against an italic serif, sharing one size and baseline. */}
          <h1
            id="hero-title"
            ref={heroTitleRef}
            data-hero-title
            className="text-[clamp(2.75rem,15.5vw,3.75rem)] leading-[0.92] sm:text-[clamp(3.75rem,11vw,12rem)] font-medium tracking-[-0.055em]"
          >
            {/* "It's always Day" is set in Inter, whose letters thicken as the cursor
                nears (React Bits VariableProximity); the payoff word "One" switches
                to the italic serif with the orange gradient, on the same baseline.
                Each piece sits in a mask so the intro can raise it into view. */}
            <span className="block">
              <span className="mr-[0.1em] inline-block overflow-hidden pr-[0.1em] pb-[0.08em] align-bottom">
                <span data-word className="text-hero-sheen inline-block">
                  <VariableProximity
                    label="It’s Always"
                    fromFontVariationSettings="'wght' 500"
                    toFontVariationSettings="'wght' 900"
                    containerRef={heroTitleRef}
                    radius={100}
                    falloff="linear"
                    smoothing={0.2}
                  />
                </span>
              </span>
            </span>
            <span className="block">
              <span className="mr-[0.1em] inline-block overflow-hidden pr-[0.1em] pb-[0.08em] align-bottom">
                <span data-word className="text-hero-sheen inline-block">
                  <VariableProximity
                    label="Day"
                    fromFontVariationSettings="'wght' 500"
                    toFontVariationSettings="'wght' 900"
                    containerRef={heroTitleRef}
                    radius={100}
                    falloff="linear"
                    smoothing={0.2}
                  />
                </span>
              </span>{' '}
              <SplitWords
                text="One"
                wordClassName="text-genesis-gradient font-display pr-[0.12em] text-[1.12em] leading-[0.82] font-normal italic tracking-[-0.01em]"
              />
            </span>
          </h1>
        </div>
      </section>

      {/* White panel that rises over the hero. */}
      <section
        id="about"
        data-panel
        className="relative z-10 min-h-svh rounded-t-[3rem] bg-paper px-5 py-24 text-ink sm:px-10 sm:py-36"
        aria-labelledby="about-title"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="about-title" className="mb-10 text-xs uppercase tracking-[0.25em] text-ink/50 sm:text-sm">
            About the club
          </h2>
          <p
            data-statement
            className="text-[clamp(2rem,5.2vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.035em]"
          >
            <SplitWords text={STATEMENT} />
          </p>

          <div className="flex flex-col items-center pt-24 sm:pt-36">
            <div data-aws-logo className="w-[min(58vw,21rem)] text-[#232f3e] will-change-transform">
              <AwsLogo className="h-auto w-full" />
            </div>

            <ul data-features className="mt-40 grid w-full gap-12 sm:mt-[20svh] lg:grid-cols-3 lg:gap-10">
              {FEATURES.map((feature, i) => (
                <li key={feature.title} data-feature>
                  <p data-feature-label className="font-mono text-[11px] tracking-[0.2em] text-ink/55 uppercase">
                    No.{i + 1}
                  </p>
                  <h3 className="mt-6 overflow-hidden pb-[0.1em] text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                    <span data-feature-title className="block">
                      {feature.title}
                    </span>
                  </h3>
                  <p data-feature-body className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-ink/60">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>

            <a
              data-member-cta
              href="#contact"
              aria-label="Become a member"
              onPointerDown={event => {
                pressStart.current = { x: event.clientX, y: event.clientY }
              }}
              onClick={event => {
                // The ring can be dragged to spin it; don't follow the link
                // when the press was a drag rather than a click.
                const start = pressStart.current
                if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) {
                  event.preventDefault()
                }
              }}
              className="mt-[35svh] block rounded-full text-ink focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ink"
            >
              <CircularText
                text="* BECOME * A * MEMBER "
                onHover="speedUp"
                direction="clockwise"
                spinDuration={20}
                size={150}
                fontSize={18}
                draggable
                hoverTilt={20}
              >
                <ArrowUpRight className="size-9" strokeWidth={1.5} aria-hidden="true" />
              </CircularText>
            </a>
          </div>
        </div>

        {/* Darkens the About panel while the black section slides over it. */}
        <div
          data-about-dim
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-ink opacity-0"
        />
      </section>

      {/* Black section after About. It slides up over the About panel (which is
          pinned once its end is reached), with rounded top corners that flatten
          as it lands. */}
      <section
        data-cover
        className="relative z-10 min-h-[200svh] overflow-hidden rounded-t-[3rem] rounded-b-[2.5rem] bg-ink sm:rounded-b-[4rem]"
      >
        {/* Animated ASCII gradient (React Bits GradientASCII), kept one screen tall
            at the top of the section so its shape doesn't stretch as the section grows. */}
        <div className="absolute inset-x-0 top-0 h-svh">
          <GradientASCII
            colors={['#f97316', '#f9bf16', '#f0fdfa']}
            shape="pinch"
            characters=" .:-=+*#%@"
            cellSize={16}
            density={0.8}
          />
        </div>

        {/* Content for this section goes here. It sits above the ASCII
            background, and the section grows if the content needs more room. */}
        <div className="relative px-5 py-24 sm:px-10 sm:py-36 lg:px-16"></div>
      </section>

      <Footer />
    </div>
  )
}
