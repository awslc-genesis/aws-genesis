import { useRef } from 'react'

import PageLayout from '@/components/PageLayout'
import TeamSection from '@/components/TeamSection'
import useReveal from '@/lib/useReveal'

// Placeholder members: replace with the club's real committee members and
// volunteers. Add `photo` (an imported image or a URL, ideally square) to show
// a portrait instead of the initials.
const MEMBERS = [
  { name: 'Ella Ramos', role: 'Secretary' },
  { name: 'Franco Lim', role: 'Treasurer' },
  { name: 'Gabby Torres', role: 'Creative Lead' },
  { name: 'Hans Aquino', role: 'Partnerships Lead' },
  { name: 'Iya Domingo', role: 'Community Lead' },
  { name: 'Jared Pascual', role: 'Cloud Mentor' },
  { name: 'Kaye Villanueva', role: 'Cloud Mentor' },
  { name: 'Leo Manalo', role: 'Workshop Lead' },
  { name: 'Mika Bautista', role: 'Content Writer' },
  { name: 'Nico Fernandez', role: 'Developer' },
  { name: 'Olive Santiago', role: 'Developer' },
  { name: 'Paolo Castro', role: 'Logistics' },
]

const initials = name =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// Small tick marks at a cell's corners, like crop marks.
function CornerTicks() {
  const tick = 'absolute size-[3px] bg-ink/40'
  return (
    <span aria-hidden="true">
      <span className={`${tick} top-2 left-2`} />
      <span className={`${tick} top-2 right-2`} />
      <span className={`${tick} bottom-2 left-2`} />
      <span className={`${tick} right-2 bottom-2`} />
    </span>
  )
}

export default function Team() {
  const root = useRef(null)
  useReveal(root)

  return (
    <PageLayout title="Meet the Team">
      <TeamSection className="px-5 pt-24 sm:px-10 sm:pt-32 lg:px-16" />

      {/* The rest of the members: a bordered grid (two across on phones, up
          to five on wide screens). Each cell shows the member's initials or
          photo, with their name and role underneath. */}
      <section
        ref={root}
        aria-labelledby="members-title"
        className="px-5 pt-28 pb-24 sm:px-10 sm:pt-36 sm:pb-32 lg:px-16"
      >
        <div data-reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="members-title" className="type-h2">
            Our <span className="text-genesis-gradient type-accent">Team</span>
          </h2>
          <p className="type-body max-w-[32ch] text-ink/60 sm:pb-2">
            The committee members and volunteers who keep every workshop and event running.
          </p>
        </div>

        <ul data-reveal className="mt-14 grid grid-cols-2 border-t border-l border-ink/10 sm:mt-20 md:grid-cols-3 lg:grid-cols-5">
          {MEMBERS.map(member => (
            <li
              key={member.name}
              className="group relative flex min-h-56 flex-col items-center justify-center gap-5 border-r border-b border-ink/10 px-5 py-10 text-center transition-colors duration-500 hover:bg-ink/[0.04] sm:min-h-64"
            >
              <CornerTicks />
              {member.photo ? (
                <img
                  src={member.photo}
                  alt=""
                  className="size-20 rounded-full object-cover grayscale transition duration-500 group-hover:grayscale-0 sm:size-24"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="type-accent text-[clamp(2.5rem,4vw,3.75rem)] leading-none transition-colors duration-500 group-hover:text-orange-600"
                >
                  {initials(member.name)}
                </span>
              )}
              <span className="block w-full min-w-0">
                <span className="type-body block truncate font-medium">{member.name}</span>
                <span className="type-label mt-1 block text-ink/55">{member.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  )
}
