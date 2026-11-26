import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { cn } from '@/utils/cn'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const leadPhotos = import.meta.glob('/src/assets/images/leads/*.{avif,jpeg,jpg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

// To add a portrait, put the image in src/assets/images/leads and set the
// member's photoFile to its exact filename. Entries without a match show initials.
const TEAM = [
  {
    name: 'Kacey Francisco',
    role: 'CEO / Lead',
    program: 'BS Electronics Engineering',
    photoFile: 'FRANCISCO-CEO.jpg',
    quote:
      "AWSLC - Genesis began as a dream during Senior High School, making it was far from easy. There were doubts, hurdles, and moments when I felt like I should wait until next year. However, building something that will bring opportunities and open doors for people cannot wait. So, do it even when your hand shakes and even when your mind races— for you, for the people, and for the community. Here's to growth. 🍀",
  },
  {
    name: 'Jasmine Madronio',
    role: 'Executive Secretary',
    program: 'BS Information Technology',
    quote:
      "Technology continues to challenge me to explore unfamiliar grounds, but I’ve learned that growth comes in many forms, and there’s always room to discover new things about ourselves. I hope to contribute to building not just an organization, but a community where people with different strengths and levels of experience can find their place, share what they know, and grow together. After all, meaningful things are built not only by what we know, but by what we’re willing to bring to the table.",
  },
  {
    name: 'John Michael Sapad ',
    role: 'COO',
    program: 'BS Information Technology',
    quote:
      'As the Chief Operations Officer I am committed to maintaining teamwork, communication and organization within our team. I believe that a good leader listens, supports their members, and ensures that everyone works together toward our common goals. I am open to suggestions, willing to learn, and ready to help whenever needed to make our organization better.',
  },
  {
    name: 'Mic Andre Gawat',
    role: 'CFO',
    program: 'BS Information Technology',
    quote:
      'Managing numbers by day and exploring cybersecurity by night. Driven by hard work and goals; down to always wanting to learn new things. Come and join me achieve my dream, one step at a time.',
  },
  {
    name: 'Elton John Lennon',
    role: 'CTO',
    program: 'BS Information Technology',
    photoFile: 'BUNDUKIN-CTO.jpg',
    quote:
      'This isn’t why I came here, thinking I have all the answers. This is my effort at learning alongside people with just as much curiosity as I. As your Tech Lead, it’s important to me that we foster a community of people where no one is afraid to question or break something or even start from zero, because this is where everyone starts from. Our success is shown by every single piece of code and every projects we create as a team.',
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
  const photo = leadPhotos[`/src/assets/images/leads/${member.photoFile}`]

  return (
    <li data-member className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] lg:gap-16">
      <div>
        <div className="relative size-44 overflow-hidden bg-ink sm:size-52">
          {photo ? (
            <img src={photo} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            // Stand-in until a photo is added: initials in the orange serif
            // over a warm glow, the same palette as the rest of the page.
            <div aria-hidden="true" className="flex size-full items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_120%,#f97316_0%,rgb(110_36_6/0.6)_45%,transparent_75%)] opacity-80" />
              <span className="type-accent text-genesis-gradient relative text-[4.5rem] leading-none font-bold tracking-[-0.04em]">
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

      <blockquote data-member-quote className="type-h3">
        {member.quote}
      </blockquote>
    </li>
  )
}

// Meet the Team: a title row in the same style as Our Partners, then one row
// per member that rises in as it scrolls into view.
export default function TeamSection({ className, heading = true }) {
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
    <section ref={root} id="team" aria-labelledby={heading ? 'team-title' : undefined} aria-label={heading ? undefined : 'Team members'} className={cn('text-ink', className)}>
      {heading && (
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="team-title" className="type-h2 overflow-hidden pb-[0.1em]">
          <span data-team-line className="block">
            Meet the <span className="text-genesis-gradient type-accent">Leads</span>
          </span>
        </h2>
        <p data-team-intro className="type-body max-w-[32ch] text-ink/60 sm:pb-2">
          The students running Genesis: organising events, mentoring members and building alongside everyone.
        </p>
      </div>
      )}

      <ul className={cn('lg:ml-[25%]', heading && 'mt-14 sm:mt-20')}>
        {TEAM.map(member => (
          <MemberRow key={member.name} member={member} />
        ))}
      </ul>
    </section>
  )
}
