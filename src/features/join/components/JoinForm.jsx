import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import TransitionLink from '@/components/common/TransitionLink'
import { cn } from '@/utils/cn'

import { DEPARTMENTS, facebookUrl, validate, YEARS } from '../fields'
import { submitApplication } from '../submitApplication'

// 16px text on purpose: iOS zooms the page when a smaller field is focused.
const FIELD_CLASS =
  'mt-2 block w-full rounded-none border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/55 hover:border-ink/60 focus:border-ink focus:shadow-[0_1px_0_0_var(--color-ink)] aria-invalid:border-red-700'

const BUTTON_CLASS =
  'inline-flex min-h-12 items-center justify-center gap-2 bg-genesis px-6 text-sm font-medium text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-60 disabled:hover:brightness-100'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 text-sm text-red-700">
      {message}
    </p>
  )
}

// One labelled text field. `as="textarea"` makes it a multi-line one.
function Field({ as: Tag = 'input', name, label, error, className, ...props }) {
  const errorId = `join-${name}-error`
  return (
    <div className={className}>
      <label htmlFor={`join-${name}`} className="text-base font-medium">
        {label}
      </label>
      <Tag
        id={`join-${name}`}
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={FIELD_CLASS}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}

// A question answered by picking one of a few options, shown as square chips.
function Choices({ name, label, options, error, className }) {
  const errorId = `join-${name}-error`
  return (
    <fieldset className={cn('min-w-0', className)} aria-describedby={error ? errorId : undefined}>
      <legend className="text-base font-medium">{label}</legend>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {options.map(option => (
          <label
            key={option}
            className={cn(
              'relative inline-flex min-h-11 items-center border px-4 text-sm font-medium transition-colors hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ink',
              error ? 'border-red-700' : 'border-ink/25',
            )}
          >
            <input type="radio" name={name} value={option} required className="absolute inset-0 appearance-none outline-none" />
            {option}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}

// The membership application. Answers go to the club's Google Sheet; once
// saved, a confirmation takes the form's place.
export default function JoinForm() {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'failed' | 'sent'
  const sentRef = useRef(null)
  // Sent along with every attempt, so retrying after a lost connection can't
  // add the same application to the sheet twice.
  const [id] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (status !== 'sent') return
    sentRef.current?.focus({ preventScroll: true })
    sentRef.current?.scrollIntoView({ block: 'center' })
  }, [status])

  const handleSubmit = async event => {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]))
    const found = validate(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      setStatus('idle')
      form.querySelector(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setStatus('sending')
    try {
      await submitApplication({ ...values, facebook: facebookUrl(values.facebook), id })
      setStatus('sent')
    } catch (error) {
      console.error('Application not sent:', error)
      setStatus('failed')
    }
  }

  // Drop a field's error as soon as it is edited.
  const handleChange = event => {
    const { name } = event.target
    setErrors(current => (current[name] ? { ...current, [name]: undefined } : current))
  }

  if (status === 'sent') {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className="outline-none">
        <p className="type-statement">Application sent.</p>
        <p className="type-body mt-6 max-w-[40ch] text-ink/70">Thank you for applying to Genesis.</p>
        <TransitionLink to="/" className={cn(BUTTON_CLASS, 'mt-10')}>
          Back to home <ArrowRight className="size-4" aria-hidden="true" />
        </TransitionLink>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onChange={handleChange}
      className="relative grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-10 sm:grid-cols-2"
    >
      <Field name="name" label="Name" autoComplete="name" maxLength={100} error={errors.name} className="sm:col-span-2" />
      <Field name="college" label="College" maxLength={120} error={errors.college} className="sm:col-span-2" />
      <Choices name="year" label="Year" options={YEARS} error={errors.year} className="sm:col-span-2" />
      <Field name="email" label="Email" type="email" autoComplete="email" maxLength={150} error={errors.email} />
      <Field
        name="facebook"
        label="Facebook link"
        inputMode="url"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={250}
        placeholder="facebook.com/yourname"
        error={errors.facebook}
      />
      <Choices
        name="department"
        label="Department you want to join"
        options={DEPARTMENTS}
        error={errors.department}
        className="sm:col-span-2"
      />
      <Field
        as="textarea"
        name="reason"
        label="Reason to join"
        rows={5}
        maxLength={2000}
        error={errors.reason}
        className="sm:col-span-2"
      />

      {/* Trap for spam bots: people never see or reach this field, and the
          sheet ignores any application that fills it in. */}
      <div aria-hidden="true" className="absolute size-px overflow-hidden [clip-path:inset(50%)]">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'sending'} className={cn(BUTTON_CLASS, 'w-full sm:w-auto')}>
          {status === 'sending' ? 'Submitting…' : 'Submit application'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
        <div role="alert">
          {status === 'failed' && (
            <p className="mt-4 text-sm text-red-700">
              Your application wasn't sent. Your answers are still here, so please try again.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
