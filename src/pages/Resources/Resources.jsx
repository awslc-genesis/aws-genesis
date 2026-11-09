import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import useReveal from '@/hooks/useReveal'

// Free, official AWS learning resources, grouped by what you want to do next.
const GROUPS = [
  {
    title: 'Learn',
    items: [
      {
        name: 'AWS Skill Builder',
        body: 'Free self-paced courses and learning plans, from cloud basics to specialist topics.',
        href: 'https://skillbuilder.aws/',
      },
      {
        name: 'AWS Educate',
        body: 'Beginner-friendly cloud training built for students, with hands-on labs and badges.',
        href: 'https://aws.amazon.com/education/awseducate/',
      },
      {
        name: 'AWS Cloud Quest',
        body: 'A role-playing game where you solve real cloud problems by building in AWS.',
        href: 'https://aws.amazon.com/training/digital/aws-cloud-quest/',
      },
    ],
  },
  {
    title: 'Certify',
    items: [
      {
        name: 'Cloud Practitioner',
        body: 'The foundational AWS certification: a good first goal for the club’s study jams.',
        href: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
      },
      {
        name: 'Solutions Architect Associate',
        body: 'The next step: designing resilient, cost-aware systems on AWS.',
        href: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      },
    ],
  },
  {
    title: 'Build',
    items: [
      {
        name: 'AWS Free Tier',
        body: 'Try many AWS services at no cost while you learn and build your first projects.',
        href: 'https://aws.amazon.com/free/',
      },
      {
        name: 'AWS Documentation',
        body: 'Guides, references and tutorials for every AWS service.',
        href: 'https://docs.aws.amazon.com/',
      },
      {
        name: 'AWS Workshops',
        body: 'Step-by-step workshops written by AWS, the same kind we run in our sessions.',
        href: 'https://workshops.aws/',
      },
    ],
  },
]

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

export default function Resources() {
  const root = useRef(null)
  useReveal(root)

  return (
    <PageLayout title="Resources">
      <div ref={root} className="px-5 py-24 sm:px-10 sm:py-36 lg:px-16">
        {GROUPS.map((group, g) => (
          <section key={group.title} aria-labelledby={`resources-${group.title}`} className={g > 0 ? 'mt-24 sm:mt-32' : ''}>
            <div data-reveal className="flex items-end justify-between gap-6">
              <h2 id={`resources-${group.title}`} className="type-h2">
                {group.title}
              </h2>
              <p className="type-label pb-2 text-ink/55">No.{String(g + 1).padStart(2, '0')}</p>
            </div>

            {/* Bordered grid of resources; each cell links out to AWS. */}
            <ul className="mt-10 grid border-t border-l border-ink/10 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map(item => (
                <li key={item.name} data-reveal className="border-r border-b border-ink/10">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex h-full min-h-64 flex-col justify-between gap-10 p-8 transition-colors duration-500 hover:bg-white/70 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink sm:p-10"
                  >
                    <CornerTicks />
                    <div>
                      <h3 className="type-h3">{item.name}</h3>
                      <p className="type-body mt-4 max-w-[36ch] text-ink/60">{item.body}</p>
                    </div>
                    <span className="type-label inline-flex items-center gap-2 text-ink/55 transition-colors group-hover:text-ink">
                      Open
                      <ArrowUpRight
                        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
