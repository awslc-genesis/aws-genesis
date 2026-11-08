import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Placeholder team: replace the names, roles, programs and quotes with the
// club's real officers. Add `photo` (an imported image or a URL, ideally a
// square portrait) to show it instead of the initials tile.
const TEAM = [
  {
    name: 'Alex Santos',
    role: 'President',
    program: 'BS Computer Science',
    quote:
      'I started Genesis because I wanted a place where TSU students could learn AWS together and ship real projects, not just pass exams. Every week someone deploys something for the first time, and that never gets old.',
  },
  {
    name: 'Bea Reyes',
    role: 'Vice President',
    program: 'BS Information Technology',
    quote:
      'My favourite part is pairing new members with mentors. Most of us walked in not knowing what a VPC was. A semester later the same people are helping the next batch get unstuck.',
  },
  {
    name: 'Carlo Mendoza',
    role: 'Technical Lead',
    program: 'BS Computer Engineering',
    quote:
      'Our workshops are hands-on from the first minute. You leave with something running in the cloud, a repo you can show, and the confidence to break it and fix it again on your own.',
  },
  {
    name: 'Dana Cruz',
    role: 'Events Lead',
    program: 'BS Information Systems',
    quote:
      'From study jams to Cloud Day, every event is a chance to meet people who build. We bring in speakers from the wider AWS community so members see where this can take them.',
  },
]

const initials = name =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// One member: a hairline across the top, then the portrait, name and role on
// the left, and their quote set large on the right (stacked on small screens).
// On wide screens the list is indented a quarter of the width, like the
// reference, with the quote taking the larger share of each row.
function MemberRow({ member }) {
  return (
    <li data-member className="grid gap-8 border-t border-ink/10 py-14 sm:py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] lg:gap-16">
      <div>
        <div className="relative size-44 overflow-hidden bg-ink sm:size-52">
          {member.photo ? (
            <img src={member.photo} alt="" className="size-full object-cover" />
          ) : (
            // Stand-in until a photo is added: initials in the orange serif
            // over a warm glow, the same palette as the rest of the page.
            <div aria-hidden="true" className="flex size-full items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_120%,#f97316_0%,rgb(110_36_6/0.6)_45%,transparent_75%)] opacity-80" />
              <span className="type-accent text-genesis-gradient relative text-[4.5rem] leading-none">
                {initials(member.name)}
              </span>
            </div>
          )}
        </div>
        <h3 className="type-h3 mt-6">{member.name}</h3>
        <p className="type-body mt-3 text-ink/60">
          {member.role}
          <br />
          {member.program}
        </p>
      </div>

      <blockquote data-member-quote className="type-h3 leading-[1.25]">
        {member.quote}
      </blockquote>
    </li>
  )
}

// Meet the Team: a title row in the same style as Our Partners, then one row
// per member that rises in as it scrolls into view.
export default function TeamSection({ className }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: root.current, start: 'top 75%', toggleActions: 'play none none reverse' },
          })
          .from('[data-team-line]', { yPercent: 115, duration: 1.2 })
          .from('[data-team-intro]', { autoAlpha: 0, y: 20, duration: 1 }, 0.15)

        gsap.utils.toArray('[data-member]').forEach(row => {
          gsap
            .timeline({
              defaults: { ease: 'expo.out' },
              scrollTrigger: { trigger: row, start: 'top 80%', toggleActions: 'play none none reverse' },
            })
            .from(row, { y: 60, autoAlpha: 0, duration: 1.2 })
            .from(row.querySelector('[data-member-quote]'), { y: 30, autoAlpha: 0, duration: 1.2 }, 0.15)
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="team" aria-labelledby="team-title" className={cn('text-ink', className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="team-title" className="type-h2 overflow-hidden pb-[0.1em]">
          <span data-team-line className="block">
            Meet the <span className="text-genesis-gradient type-accent">Team</span>
          </span>
        </h2>
        <p data-team-intro className="type-body max-w-[32ch] text-ink/55 sm:pb-2">
          The students running Genesis: organising events, mentoring members and building alongside everyone.
        </p>
      </div>

      <ul className="mt-14 border-b border-ink/10 sm:mt-20 lg:ml-[25%]">
        {TEAM.map(member => (
          <MemberRow key={member.name} member={member} />
        ))}
      </ul>
    </section>
  )
}
