import { useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import logo from '@/assets/logo.webp'
import PageLayout from '@/components/PageLayout'
import useReveal from '@/lib/useReveal'

// Placeholder details: replace the email, social link and meetup details with
// the club's real ones. The form has no server behind it, so sending opens the
// visitor's email app with the message filled in, addressed to CONTACT_EMAIL.
const CONTACT_EMAIL = 'hello@genesis-club.example'
const SOCIALS = [{ label: 'Facebook', href: 'https://www.facebook.com/' }]

const REASONS = [
  'Joining the club',
  'Partnering or sponsoring',
  'Speaking at an event',
  'Requesting a workshop',
  'Volunteering',
  'Media or press',
  'Collaborating with another org',
  'Something else',
]

const FIND_US = [
  { label: 'Campus', lines: ['Tarlac State University', 'Romulo Blvd, Tarlac City, Tarlac'] },
  { label: 'Meetups', lines: ['College of Computer Studies', ''] },
]

const fieldClass =
  'type-body w-full border-b border-ink/20 bg-transparent py-3 text-ink placeholder:text-ink/35 transition-colors focus:border-ink focus:outline-none'

// Links in the details columns: no underline; they fade slightly on hover.
const linkClass =
  'rounded-sm transition-opacity duration-300 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'

// Contact page, in three columns on wide screens (stacked on phones):
// - top row: the email on the left, a large "Get in touch" headline with a
//   short line in the middle, and the club emblem on the right;
// - below a hairline: meetup times and socials on the left, the message form
//   in the middle (a list of reasons as round options, then the fields), and
//   where to find the club on the right.
export default function Contact() {
  const root = useRef(null)
  const [sent, setSent] = useState(false)
  useReveal(root)

  const onSubmit = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const subject = `[Genesis] ${data.get('reason')} – ${data.get('name')}`
    const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const columns = 'grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-16'

  return (
    <PageLayout title="Contact">
      <div ref={root} className="px-5 pt-16 pb-24 sm:px-10 sm:pt-24 sm:pb-32 lg:px-16">
        {/* Top row */}
        <div className={`${columns} items-end border-b border-ink/10 pb-14 sm:pb-20`}>
          <div data-reveal className="order-2 lg:order-1">
            <p className="type-label text-ink/55">Email</p>
            {/* Wraps only after the "@" when the column is narrow. */}
            <a href={`mailto:${CONTACT_EMAIL}`} className={`type-h3 mt-3 inline-block ${linkClass}`}>
              {CONTACT_EMAIL.split('@')[0]}@
              <wbr />
              {CONTACT_EMAIL.split('@')[1]}
            </a>
          </div>

          <div data-reveal className="order-1 lg:order-2">
            <h2 className="type-h1">
              Get in <span className="text-genesis-gradient type-accent">touch</span>
            </h2>
            <p className="type-body mt-6 max-w-[44ch] text-ink/60">
              Have a question about the club, an event or working with us? Send a message and an officer will get back
              to you.
            </p>
          </div>

          <div data-reveal className="order-3 hidden justify-end lg:flex">
            <img src={logo} alt="" className="size-40 opacity-90 xl:size-48" />
          </div>
        </div>

        {/* Details and form */}
        <div className={`${columns} pt-14 sm:pt-20`}>
          <aside data-reveal className="order-2 space-y-12 lg:order-1">
            <div>
              <p className="type-label text-ink/55">Meetups</p>
              <p className="type-h3 mt-3">Every other Friday</p>
              <p className="type-body mt-1 text-ink/60">3:00 – 5:00 PM</p>
            </div>
            <div>
              <p className="type-label text-ink/55">Socials</p>
              <ul className="mt-3 space-y-2">
                {SOCIALS.map(social => (
                  <li key={social.label}>
                    <a href={social.href} target="_blank" rel="noreferrer" className={`type-h3 ${linkClass}`}>
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <form data-reveal onSubmit={onSubmit} className="order-1 lg:order-2">
            <h2 className="type-h2">
              Send a <span className="text-genesis-gradient type-accent">message</span>
            </h2>
            <p className="type-body mt-5 max-w-[52ch] text-ink/60">
              Tell us what you’re reaching out about. We usually reply within a few school days.
            </p>

            <fieldset className="mt-12">
              <legend className="type-h3">Reason for reaching out</legend>
              <div className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {REASONS.map((reason, i) => (
                  <label key={reason} className="type-body group flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      defaultChecked={i === 0}
                      className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-ink/35 transition-colors group-hover:border-ink checked:border-ink checked:bg-[radial-gradient(circle,var(--color-ink)_42%,transparent_46%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    />
                    {reason}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-14 grid gap-10 border-t border-ink/10 pt-12 sm:grid-cols-2">
              <label className="block">
                <span className="type-label text-ink/55">Name</span>
                <input name="name" required autoComplete="name" placeholder="Your name" className={fieldClass} />
              </label>
              <label className="block">
                <span className="type-label text-ink/55">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="type-label text-ink/55">Message</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us a little about yourself or your idea"
                  className={`${fieldClass} resize-none`}
                />
              </label>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                type="submit"
                className="type-body group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-paper transition-colors duration-300 hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                Send message
                <ArrowUpRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
              <p role="status" className="type-body text-ink/60">
                {sent ? 'Your email app should open with the message ready to send.' : ''}
              </p>
            </div>
          </form>

          <aside data-reveal className="order-3">
            <h2 className="type-h2">
              Find <span className="text-genesis-gradient type-accent">us</span>
            </h2>
            <dl className="mt-8 border-t border-ink/10">
              {FIND_US.map(place => (
                <div key={place.label} className="border-b border-ink/10 py-8">
                  <dt className="type-label text-ink/55">{place.label}</dt>
                  <dd className="type-h3 mt-3">
                    {place.lines.map(line => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </PageLayout>
  )
}
