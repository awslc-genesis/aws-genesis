import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import CardSwap from '@/components/animations/CardSwap'
import CircularText from '@/components/animations/CircularText'
import DarkVeil from '@/components/animations/DarkVeil'
import PixelTrail from '@/components/animations/PixelTrail'
import VariableProximity from '@/components/animations/VariableProximity'
import AwsLogo from '@/components/common/AwsLogo'
import SplitWords from '@/components/common/SplitWords'
import TransitionLink from '@/components/common/TransitionLink'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import { EventsSection } from '@/features/events'
import { PartnersMarquee } from '@/features/partners'
import { TeamSection } from '@/features/team'
import { isCoarsePointer, PINNED } from '@/utils/motion'
import { onPageReveal } from '@/utils/pageReveal'

import './Home.css'

// Loaded on demand: its code is only downloaded once the black section nears the screen.
const GradientASCII = lazy(() => import('@/components/animations/GradientASCII'))

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STATEMENT =
  'Genesis is where students of Tarlac State University start building in the cloud, learning AWS side by side and shipping real things together.'

// Cards cycling on the right of the hero (React Bits CardSwap). The photos are
// placeholders, like the event images; swap in the club's own shots later.
const HERO_CARDS = [
  { title: 'Cloud workshops', image: 'https://picsum.photos/seed/genesis-workshop/900/640' },
  { title: 'Build nights', image: 'https://picsum.photos/seed/genesis-build/900/640' },
  { title: 'Study jams', image: 'https://picsum.photos/seed/genesis-study/900/640' },
  { title: 'Demo days', image: 'https://picsum.photos/seed/genesis-demo/900/640' },
]

const HERO_LINK_CLASS = 'inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-medium text-black transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

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
  const coverRef = useRef(null)
  const [showAscii, setShowAscii] = useState(false)

  // Mount the ASCII background only when the black section is about to scroll
  // into view (within a quarter screen of the bottom edge), so its WebGL setup
  // and intro animation happen when the visitor actually gets there. Scrolling
  // back up until the section is below the screen again unmounts it, which
  // resets the intro so it plays again the next time you scroll down to it.
  useEffect(() => {
    const section = coverRef.current
    if (!section) return undefined
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1]
        if (entry.isIntersecting) setShowAscii(true)
        // Out of range and below the screen: the visitor scrolled back up.
        else if (entry.boundingClientRect.top > 0) setShowAscii(false)
      },
      { rootMargin: '0px 0px 25% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Hero intro: headline words rise out of their masks, once the loading
        // screen or page curtain has lifted so the visitor sees it play.
        const heroIntro = gsap
          .timeline({ defaults: { ease: 'expo.out' }, paused: true })
          // VariableProximity also marks its own inner words with data-word; skip those.
          .from('[data-hero-title] [data-word]:not(.variable-proximity [data-word])', {
            yPercent: 115,
            duration: 1.4,
            stagger: 0.08,
          })
          .from('[data-hero-actions]', { autoAlpha: 0, y: 12, duration: 0.65 }, '-=0.75')
        const cancelHeroIntro = onPageReveal(() => heroIntro.play())

        // The headline scrolls up with the page like normal content, while the
        // hero background stays pinned and full size behind it. It travels the
        // same distance as the page scroll until the panel reaches the top, so it
        // moves exactly 1:1 with the scroll; it also fades as the panel rises.
        ScrollTrigger.create({
          start: 0,
          endTrigger: '[data-panel]',
          end: 'top top',
          onUpdate: self => gsap.set('[data-hero-content]', { y: -Math.min(self.scroll(), self.end) }),
          onRefresh: self => gsap.set('[data-hero-content]', { y: -Math.min(self.scroll(), self.end) }),
        })
        const cover = {
          trigger: '[data-panel]',
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        }
        gsap.to('[data-hero-content]', { autoAlpha: 0, ease: 'none', scrollTrigger: cover })
        // Light floods up from the panel's edge into the dark hero. The glow is
        // anchored to the panel and grows upward (it never fades, so its paper
        // end always matches the panel and no edge shows). Its top is fully
        // transparent, so it melts into the hero. A lagging scrub keeps it fluid.
        // It starts a little before the panel arrives: once the panel's top is
        // a quarter screen below the bottom of the screen (GLOW_LEAD). At that
        // moment it is scaled so its top edge sits exactly at the bottom of the
        // screen, so the light starts rising into view from there.
        const GLOW_LEAD = 0.25
        const glowEl = document.querySelector('[data-panel-glow]')
        const glowStartScale = () => {
          const box = glowEl.parentElement.getBoundingClientRect()
          const panelTop = document.querySelector('[data-panel]').getBoundingClientRect().top
          // The glow box reaches a little way into the panel (its bottom overlap).
          const overlap = box.bottom - panelTop
          return Math.min(1, Math.max(0, (GLOW_LEAD * window.innerHeight + overlap) / box.height))
        }
        gsap.fromTo(
          glowEl,
          { scaleY: glowStartScale },
          {
            scaleY: 1,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: '[data-panel]',
              start: `top ${100 + GLOW_LEAD * 100}%`,
              end: 'top top',
              scrub: 1.8,
              invalidateOnRefresh: true,
            },
          },
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

        // When the About split reaches the screen, the headline lines rise out
        // of their masks; the left column then sticks.
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: '[data-about-split]', start: 'top 75%', toggleActions: 'play none none reverse' },
          })
          .from('[data-about-line]', { yPercent: 115, duration: 1.3, stagger: 0.12 })

        // The AWS logo pops up as you scroll into About, tied to the scroll:
        // it grows from small, rises, untwists and overshoots slightly before
        // settling, and plays back in reverse when you scroll up.
        gsap.from('[data-aws-logo]', {
          scale: 0.25,
          yPercent: 45,
          rotate: -14,
          autoAlpha: 0,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '[data-about-split]', start: 'top 85%', end: 'top 15%', scrub: 0.6 },
        })

        // Each of the three points reveals as it scrolls up the right column:
        // the number fades in, the title rises out of its mask, then the text.
        gsap.utils.toArray('[data-feature]').forEach(feature => {
          gsap
            .timeline({
              defaults: { ease: 'expo.out' },
              scrollTrigger: { trigger: feature, start: 'top 80%', toggleActions: 'play none none reverse' },
            })
            .from(feature.querySelector('[data-feature-label]'), { autoAlpha: 0, x: -12, duration: 0.8 })
            .from(feature.querySelector('[data-feature-title]'), { yPercent: 115, duration: 1.1 }, 0.1)
            .from(feature.querySelector('[data-feature-body]'), { autoAlpha: 0, y: 24, duration: 1 }, 0.3)
        })

        // A little further down, the membership button rises in under the logo.
        gsap.from('[data-member-cta]', {
          y: 40,
          autoAlpha: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: '[data-member-cta]', start: 'top 98%', end: 'top 78%', scrub: 0.6 },
        })

        // The principal sponsor block rises and fades in as it scrolls into view.
        gsap.from('[data-sponsor]', {
          y: 80,
          autoAlpha: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: '[data-sponsor]', start: 'top 95%', end: 'top 60%', scrub: 0.6 },
        })

        // As the black section comes up under About, a black-and-white glow
        // grows up from its edge: the same curved, rising gradient as the hero
        // hand-off, fading the cream page through soft greys into black. It is
        // anchored to the black section and only grows (never fades), so its
        // black end always meets the section with no line. It starts while the
        // section is still COVER_LEAD screens below the bottom of the screen:
        // at that moment it is scaled so its top edge sits exactly at the
        // bottom of the screen, so it begins rising into view right away.
        const COVER_LEAD = 0.6
        const coverGlow = document.querySelector('[data-cover-glow]')
        const coverGlowStart = () => {
          const box = coverGlow.parentElement.getBoundingClientRect()
          const overlap = box.bottom - coverRef.current.getBoundingClientRect().top
          return Math.min(1, Math.max(0, (COVER_LEAD * window.innerHeight + overlap) / box.height))
        }
        gsap.fromTo(
          coverGlow,
          { scaleY: coverGlowStart },
          {
            scaleY: 1,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: '[data-cover]',
              start: `top ${100 + COVER_LEAD * 100}%`,
              end: 'top 35%',
              scrub: 2.2,
              invalidateOnRefresh: true,
            },
          },
        )

        return cancelHeroIntro
      })

      // Hold the About panel in place once its bottom reaches the bottom of the
      // screen, so the next section scrolls up over it instead of pushing it away.
      // The black section sits a gap below the panel (its top margin), so the
      // panel first rests on the Become a Member button for that much scrolling
      // before the black section starts sliding over it.
      // Only on wide screens with a mouse or trackpad: on phones and tablets the
      // panel just scrolls away naturally, with nothing held in place.
      const coverGap = () => parseFloat(getComputedStyle(coverRef.current).marginTop) || 0
      gsap.matchMedia().add(PINNED, () => {
        ScrollTrigger.create({
          trigger: '[data-panel]',
          start: 'bottom bottom',
          end: () => `+=${window.innerHeight + coverGap()}`,
          pin: true,
          pinSpacing: false,
        })
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

      // Re-measure whenever the page's height changes after load (images or
      // fonts arriving late, a section changing size), so the About panel's
      // hold and the black section's slide-over start at the right place
      // instead of positions measured for the old layout.
      let lastHeight = root.current.offsetHeight
      let pending = 0
      const heightWatcher = new ResizeObserver(() => {
        const height = root.current?.offsetHeight ?? 0
        if (Math.abs(height - lastHeight) < 2) return
        lastHeight = height
        clearTimeout(pending)
        pending = setTimeout(() => ScrollTrigger.refresh(), 150)
      })
      heightWatcher.observe(root.current)
      return () => {
        heightWatcher.disconnect()
        clearTimeout(pending)
      }
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
          <DarkVeil color="#6e2406" paused={veilPaused} dpr={isCoarsePointer() ? 1 : undefined} />
        </div>


        <div
          data-hero-content
          className="relative flex h-full flex-col justify-end px-5 pb-10 sm:px-10 sm:pb-14"
        >
          {/* Card stack in the empty space of the hero. On phones and tablets it
              fills the gap between the navbar and the headline; on wide screens
              it sits to the right of the headline instead. */}
          <div className="relative mt-24 mb-8 min-h-0 flex-1 lg:absolute lg:top-[18%] lg:right-10 lg:m-0 lg:h-[52%] lg:w-[38%] lg:flex-none">
            <CardSwap
              items={HERO_CARDS}
              delay={4000}
              cardDistance={0}
              verticalDistance={56}
              depth={100}
              skewAmount={0}
              cardRadius={0}
              theme="light"
              className="card-swap-polaroid"
            />
          </div>

          {/* Tight sans set against an italic serif, sharing one size and baseline. */}
          <h1
            id="hero-title"
            ref={heroTitleRef}
            data-hero-title
            className="type-display"
          >
            {/* "Let's make" is set in Inter, whose letters thicken as the cursor
                nears (React Bits VariableProximity); the payoff word "history"
                switches to the italic serif with the orange gradient. Each piece
                sits in a mask so the intro can raise it into view. The gradient
                is clipped to the text but only painted inside the word's box, so
                "history" gets extra bottom and right padding (cancelled by the
                mask's negative margin) to keep the y's tail coloured. */}
            <span className="block">
              <span className="mr-[0.1em] inline-block overflow-hidden pr-[0.1em] pb-[0.08em] align-bottom">
                <span data-word className="text-hero-sheen inline-block">
                  <VariableProximity
                    label="Let’s make"
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
              <SplitWords
                text="history"
                wordClassName="text-genesis-gradient type-accent leading-[0.82] pr-[0.1em] pb-[0.3em]"
                maskClassName="-mb-[0.3em]"
              />
            </span>
          </h1>
          <div data-hero-actions className="mt-5 sm:mt-8 lg:flex lg:items-end lg:justify-between lg:gap-8">
            <p className="type-body max-w-xl text-white/75">
              Join fellow Tarlac State University students to learn AWS through hands-on projects.
              Start with the basics, experiment with cloud services, and work with a team to get your ideas online.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 lg:mt-0 lg:shrink-0">
              <TransitionLink to="/contact" className={`${HERO_LINK_CLASS} bg-genesis hover:brightness-110`}>
                Join Us <ArrowRight className="size-4" aria-hidden="true" />
              </TransitionLink>
              <a href="#events" className={`${HERO_LINK_CLASS} bg-white hover:bg-white/85`}>
                Events
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* White panel that rises over the hero. Its top margin keeps the hero on
          screen for an extra 60% of a screen of scrolling before the glow starts. */}
      <section
        id="about"
        data-panel
        className="relative z-10 mt-[60svh] min-h-svh bg-paper px-5 py-24 text-ink sm:px-10 sm:py-36"
        aria-label="About the club"
      >
        {/* Gradient band above the panel: it fades the hero through ember orange
            into the paper. It reaches 4rem down into the panel so the panel's own
            top edge stays covered and no seam line can show at any screen scale. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-[160svh] h-[calc(160svh+4rem)] overflow-hidden"
        >
          <div data-panel-glow className="absolute inset-0 origin-bottom">
            <div className="panel-glow-fill absolute inset-0" />
          </div>
        </div>
        {/* Split layout: on large screens the left column (logo and headline)
            sticks in place while the right column (statement and the three
            points) scrolls past it. On small screens the two simply stack. */}
        <div data-about-split className="grid items-start gap-16 lg:grid-cols-[minmax(0,1fr)_min(42rem,38vw)] lg:gap-20">
          {/* Fills the screen height while stuck, so the logo sits at the top and
              the headline at the bottom-left corner. */}
          <div className="lg:sticky lg:top-28 lg:flex lg:h-[calc(100svh-16rem)] lg:flex-col lg:justify-end">
            {/* On wide screens (1280px and up) the headline sits at the
                bottom-left and the logo beside it, centred on the page: its left
                is half the screen width, minus the panel's 2.5rem side padding,
                minus half the logo's width. The right column is kept narrow
                (at most 42rem or 38% of the screen) so it clears the logo. On
                narrower screens the logo sits above the headline and centers
                when the columns stack. The logo pops
                up into place as you scroll (see the scrubbed tween above). */}
            <div className="relative flex flex-col gap-12 xl:flex-row xl:items-center">
              <div data-aws-logo className="w-[min(38vw,10rem)] shrink-0 origin-bottom self-center text-[#232f3e] will-change-transform lg:w-[min(14vw,15rem)] lg:origin-bottom-left lg:self-auto xl:absolute xl:top-1/2 xl:left-[calc(50vw-2.5rem-min(5vw,6rem))] xl:w-[min(10vw,12rem)] xl:-translate-y-1/2 xl:origin-center">
                <AwsLogo className="h-auto w-full" />
              </div>
              <h2 data-about-title className="type-h1 whitespace-nowrap">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-about-line className="block text-ink/35">
                    It’s Always
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.12em]">
                  <span data-about-line className="block">
                    Day <span className="text-genesis-gradient type-accent">One</span>
                  </span>
                </span>
              </h2>
            </div>
          </div>

          <div>
            <p data-statement className="type-statement">
              <SplitWords text={STATEMENT} />
            </p>

            <ul data-features className="mt-24 sm:mt-36">
              {FEATURES.map((feature, i) => (
                <li key={feature.title} data-feature className="border-t border-ink/10 py-14 sm:py-20">
                  <p data-feature-label className="type-label text-ink/55">
                    No.{i + 1}
                  </p>
                  <h3 className="type-h2 mt-8 overflow-hidden pb-[0.1em]">
                    <span data-feature-title className="block">
                      {feature.title}
                    </span>
                  </h3>
                  <p data-feature-body className="type-body mt-6 max-w-[40ch] text-ink/60">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Events strip spans the full screen width, so it cancels the panel's side padding. */}
        <EventsSection className="-mx-5 mt-[20svh] sm:-mx-10" />

        {/* Meet the Team, just before the Become a Member button. */}
        <TeamSection className="mt-[20svh]" />

        {/* The button gets the whole last screen of the panel to itself, centred
            in it. The negative bottom margin cancels the panel's bottom padding,
            so this block ends exactly at the panel's bottom edge; when the panel
            is held in place there, the button sits in the middle of the screen. */}
        <div className="relative -mx-5 -mb-24 flex min-h-svh flex-col items-center justify-center overflow-hidden sm:-mx-10 sm:-mb-36">
          {/* Pixel trail (React Bits PixelTrail) follows the cursor across this
              screen, behind the button. It ignores pointer events itself. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <PixelTrail
              gridSize={50}
              trailSize={0.1}
              maxAge={500}
              interpolate={5}
              color="#f97316"
              trailColor="#f9bf16"
              gooeyFilter={false}
            />
          </div>
          <TransitionLink
            data-member-cta
            to="/contact"
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
            className="relative z-10 block rounded-full text-ink focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ink"
          >
            <CircularText
              text="* BECOME * A * MEMBER "
              onHover="speedUp"
              direction="clockwise"
              spinDuration={20}
              size={150}
              fontSize={18}
              fontWeight={700}
              draggable
              hoverTilt={20}
            >
              <ArrowUpRight className="size-9" strokeWidth={1.5} aria-hidden="true" />
            </CircularText>
          </TransitionLink>
        </div>

      </section>

      {/* Black section after About. It slides up over the About panel (which is
          pinned once its end is reached on desktop), led by a black-and-white
          glow that grows up from its top edge into the cream page. */}
      <section
        ref={coverRef}
        data-cover
        className="relative z-10 min-h-[200svh] rounded-b-[2.5rem] bg-ink sm:rounded-b-[4rem] pinned:mt-[70svh]"
      >
        {/* The glow band: sits above the section's top edge and reaches 4rem
            into it (covered there by the ASCII effect, which is drawn after it),
            so no seam can show. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-[130svh] h-[calc(130svh+4rem)] overflow-hidden"
        >
          <div data-cover-glow className="absolute inset-0 origin-bottom">
            <div className="cover-glow-fill absolute inset-0" />
          </div>
        </div>
        {/* Animated ASCII gradient (React Bits GradientASCII), kept one screen tall
            at the top of the section so its shape doesn't stretch as the section grows. */}
        {/* The mask fades its bottom edge into the section's black, so there's no hard line. */}
        <div className="absolute inset-x-0 top-[30svh] h-svh overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_55%,transparent)]">
          {showAscii && (
            <Suspense fallback={null}>
              <GradientASCII
                colors={['#f97316', '#f9bf16', '#f0fdfa']}
                shape="pinch"
                characters=" .:-=+*#%@"
                cellSize={16}
                density={0.8}
                fontFamily='"Inter", sans-serif'
                dpr={isCoarsePointer() ? 1 : undefined}
              />
            </Suspense>
          )}
        </div>

        {/* Partners, over the ASCII effect: the effect starts 30svh down (below
            the black-and-white glow that leads into this section) with its top
            and bottom faded out; the title sits just above its bright middle
            band and the logo strip runs through that band (80svh down), so both
            fit on screen together. Logos are in dark ink to read on the light. */}
        <div aria-labelledby="partners-title" role="region" className="relative h-[130svh]">
          <div className="flex items-end justify-between gap-6 px-5 pt-[48svh] sm:px-10 lg:px-16">
            <h2 id="partners-title" className="type-h2 text-white">
              Our{' '}
              <span className="text-genesis-gradient type-accent">
                Partners
              </span>
            </h2>
            <p className="type-body hidden max-w-[32ch] pb-2 text-white/70 sm:block">
              The companies and communities helping Genesis bring the cloud to campus.
            </p>
          </div>

          <div className="absolute inset-x-0 top-[80svh] -translate-y-1/2">
            <PartnersMarquee tone="dark" />
          </div>
        </div>

        {/* The rest of the section sits on the black below the effect, and the
            section grows if the content needs more room. */}
        <div className="relative pb-24 sm:pb-36">
          {/* Principal sponsor, set open on the black like the rest of the page:
              a hairline and label, the sponsor's logo large on the left, and a
              statement and link on the right. AWS is a placeholder; swap the
              logo, copy and link for the real sponsor. */}
          <div
            data-sponsor
            role="region"
            aria-labelledby="sponsor-title"
            className="mt-28 px-5 text-white sm:mt-40 sm:px-10 lg:px-16"
          >
            <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-6">
              <p id="sponsor-title" className="type-label text-white/55">
                Principal Sponsor
              </p>
              <p className="type-label text-white/55">No.01</p>
            </div>

            <div className="mt-16 grid items-center gap-14 sm:mt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
              <div className="flex justify-center">
                <AwsLogo title="Amazon Web Services" className="h-auto w-[min(70vw,30rem)]" />
              </div>

              <div>
                <p className="type-h3">
                  Building on the cloud that{' '}
                  <span className="text-genesis-gradient type-accent">
                    started it all
                  </span>
                </p>
                <p className="type-body mt-6 max-w-[44ch] text-white/60">
                  Amazon Web Services powers Genesis with credits, training and mentorship, so every member can build
                  on real cloud infrastructure.
                </p>
                <a
                  href="https://aws.amazon.com"
                  target="_blank"
                  rel="noreferrer"
                  className="type-body group mt-10 inline-flex items-center gap-3 rounded-sm text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span className="border-b border-white/30 pb-1 transition-colors group-hover:border-white">
                    Visit Amazon Web Services
                  </span>
                  <ArrowUpRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
