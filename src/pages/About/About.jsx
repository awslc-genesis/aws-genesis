import { useRef } from 'react'

import AwsLogo from '@/components/AwsLogo'
import PageLayout from '@/components/PageLayout'
import useReveal from '@/lib/useReveal'

// Draft copy: replace with the club's own mission, story and numbers.
const PILLARS = [
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

const STATS = [
  { value: '120+', label: 'Members' },
  { value: '30+', label: 'Workshops run' },
  { value: '15', label: 'Events this year' },
  { value: '40+', label: 'Projects shipped' },
]

export default function About() {
  const root = useRef(null)
  useReveal(root)

  return (
    <PageLayout title="About Genesis">
      <div ref={root} className="px-5 py-24 sm:px-10 sm:py-36 lg:px-16">
        {/* Mission, with the AWS logo beside it. */}
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_min(42rem,45vw)] lg:gap-20">
          <div data-reveal className="w-[min(45vw,14rem)] text-[#232f3e]">
            <AwsLogo className="h-auto w-full" />
          </div>
          <p data-reveal className="type-statement">
            Genesis is where students of Tarlac State University start building in the cloud, learning AWS side by
            side and shipping real things together.
          </p>
        </div>

        {/* Mission and vision. */}
        <div className="mt-28 grid gap-12 border-t border-ink/10 pt-12 sm:mt-40 md:grid-cols-2">
          <div data-reveal>
            <p className="type-label text-ink/55">Mission</p>
            <p className="type-h3 mt-6 max-w-[28ch]">
              Make cloud skills reachable for every student, whatever their course or year.
            </p>
          </div>
          <div data-reveal>
            <p className="type-label text-ink/55">Vision</p>
            <p className="type-h3 mt-6 max-w-[28ch]">
              A campus where students graduate having already built and shipped on the cloud.
            </p>
          </div>
        </div>

        {/* What we do: the three pillars. */}
        <ul className="mt-28 sm:mt-40">
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar.title}
              data-reveal
              className="grid gap-6 border-t border-ink/10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_min(42rem,45vw)] lg:gap-20"
            >
              <p className="type-label text-ink/55">No.{i + 1}</p>
              <div>
                <h2 className="type-h2">{pillar.title}</h2>
                <p className="type-body mt-6 max-w-[40ch] text-ink/60">{pillar.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* In numbers (placeholder figures). */}
        <div className="border-t border-ink/10 pt-12">
          <p data-reveal className="type-label text-ink/55">
            In numbers
          </p>
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
            {STATS.map(stat => (
              <div key={stat.label} data-reveal>
                <dt className="type-label order-2 text-ink/55">{stat.label}</dt>
                <dd className="type-h1 mt-3 tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PageLayout>
  )
}
