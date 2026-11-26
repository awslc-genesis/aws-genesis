import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

import TransitionLink from '@/components/common/TransitionLink'
import { Choices, Field } from '@/features/join'
import { cn } from '@/utils/cn'

import { JOIN_TOPIC, TOPICS, validate } from '../fields'
import { sendMessage } from '../sendMessage'
import './ContactForm.css'

const TODAY = new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())

// The contact note, on the same paper as the Join sheet but compact: no stub,
// only as tall as its fields. Messages are emailed to the club's inbox by
// api/contact.js.
export default function ContactForm() {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'failed'
  const [topic, setTopic] = useState('')

  async function onSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value).trim()]))
    const found = validate(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      form.querySelector(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setStatus('sending')
    try {
      await sendMessage(values)
      form.reset()
      setTopic('')
      setStatus('sent')
    } catch (error) {
      console.error('Message not sent:', error)
      setStatus('failed')
    }
  }

  // Drop a field's error as soon as it is edited.
  const onChange = event => {
    const { name, value } = event.target
    setErrors(current => (current[name] ? { ...current, [name]: undefined } : current))
    if (name === 'topic') setTopic(value)
  }

  return (
    <div className="paper paper-plain max-w-[44rem]">
      <form noValidate onSubmit={onSubmit} onChange={onChange} className="paper-sheet">
        <span aria-hidden="true" className="paper-hole top-[30%]" />
        <span aria-hidden="true" className="paper-hole top-[70%]" />
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div>
            <p className="type-h3">Message to Genesis</p>
            <p className="type-fine mt-1 text-ink/50">Form G-02 · Lines 03 and 05 are optional</p>
          </div>
          <p className="type-fine shrink-0 pt-1 text-right text-ink/50 tabular-nums">{TODAY}</p>
        </div>

        <div className="mt-7 mb-8 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 sm:grid-cols-2">
          <Field form="contact" n={1} name="name" label="Name" autoComplete="name" maxLength={100} error={errors.name} />
          <Field
            form="contact"
            n={2}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            maxLength={150}
            error={errors.email}
          />
          <Field
            form="contact"
            n={3}
            name="organization"
            label="School or organization"
            autoComplete="organization"
            maxLength={120}
            required={false}
            className="sm:col-span-2"
          />
          <Choices
            form="contact"
            n={4}
            name="topic"
            label="What is it about?"
            options={TOPICS}
            error={errors.topic}
            className="sm:col-span-2"
          />
          {/* Picking "Joining Genesis" pins a note pointing to the Join page,
              which takes applications directly. */}
          <div aria-live="polite" className="sm:col-span-2 empty:hidden">
            {topic === JOIN_TOPIC && (
              <div className="contact-note">
                <p className="type-small font-medium">Want to become a member?</p>
                <p className="type-small mt-1 text-ink/70">
                  We have a dedicated page for that. Fill in the membership sheet and we’ll get back to you.
                </p>
                <TransitionLink to="/join" className="btn btn-dark mt-4 h-10 px-4">
                  Go to Join <ArrowRight aria-hidden="true" />
                </TransitionLink>
              </div>
            )}
          </div>
          <Field
            form="contact"
            as="textarea"
            n={5}
            name="message"
            label="Tell us more"
            rows={3}
            maxLength={2000}
            required={false}
            className="sm:col-span-2"
          />
        </div>

        {/* Trap for spam bots: people never see or reach this field, and the
            server drops any message that fills it in. */}
        <div aria-hidden="true" className="absolute size-px overflow-hidden [clip-path:inset(50%)]">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col gap-4 border-t border-dashed border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className={cn('type-small sm:max-w-[34ch]', status === 'failed' ? 'text-red-700' : 'text-ink/60')}>
            {status === 'sent' && 'Message sent. Thank you, we’ll reply to your email soon.'}
            {status === 'failed' && 'Your message wasn’t sent. Your answers are still here, so please try again.'}
            {(status === 'idle' || status === 'sending') && 'Goes straight to the Genesis inbox.'}
          </p>
          <button type="submit" disabled={status === 'sending'} className="btn btn-dark w-full shrink-0 sm:w-auto">
            {status === 'sending' ? 'Sending…' : 'Send message'} <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  )
}
