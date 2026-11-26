import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import TransitionLink from '@/components/common/TransitionLink'
import { cn } from '@/utils/cn'

import { DEPARTMENTS, facebookUrl, validate, YEARS } from '../fields'
import { createRipAudio, playRip } from '../ripSound'
import { submitApplication } from '../submitApplication'
import './PaperForm.css'

// 16px text on purpose: iOS zooms the page when a smaller field is focused.
const FIELD_CLASS =
  'mt-1 block w-full rounded-none border-0 border-b border-ink/20 bg-transparent px-0 py-2.5 text-base paper-ink caret-[#1f2d5c] outline-none transition-colors placeholder:text-ink/35 hover:border-ink/50 focus:border-ink aria-invalid:border-red-700'

// How long the Received stamp sits on the sheet before the stub is torn off,
// and how long the rip takes (matches paper-rip in PaperForm.css).
const STAMP_MS = 1100
const TEAR_MS = 950

const TODAY = new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="type-small mt-2 text-red-700">
      {message}
    </p>
  )
}

// The small question number in front of each label: 01, 02, …
function Num({ n }) {
  return (
    <span aria-hidden="true" className="type-fine mr-2 tabular-nums text-ink/35">
      {String(n).padStart(2, '0')}
    </span>
  )
}

// One labelled line to write on. `as="textarea"` makes it a ruled multi-line one.
function Field({ as: Tag = 'input', n, name, label, error, className, ...props }) {
  const errorId = `join-${name}-error`
  const lined = Tag === 'textarea'
  return (
    <div className={className}>
      <label htmlFor={`join-${name}`} className="type-small font-medium">
        <Num n={n} />
        {label}
      </label>
      <Tag
        id={`join-${name}`}
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(FIELD_CLASS, lined && 'paper-lined mt-2 border-b-0 py-0')}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}

// A question answered by circling one of a few options in pen.
function Choices({ n, name, label, options, error, className }) {
  const errorId = `join-${name}-error`
  return (
    <fieldset className={cn('min-w-0', className)} aria-describedby={error ? errorId : undefined}>
      <legend className="type-small font-medium">
        <Num n={n} />
        {label}
      </legend>
      <div className="-mx-3 mt-2 flex flex-wrap gap-x-1">
        {options.map(option => (
          <label
            key={option}
            className="paper-choice relative inline-flex min-h-11 cursor-pointer items-center rounded-full px-3 type-small text-ink/60 transition-colors hover:text-ink has-checked:font-medium has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
          >
            <input type="radio" name={name} value={option} required className="absolute inset-0 cursor-pointer appearance-none outline-none" />
            {option}
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M55 4C82 3 97 10 96 21C95 33 72 38 47 37C21 36 3 30 4 19C5 9 27 3 61 6"
                pathLength="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}

// Decorative barcode, drawn from the application number so each one differs.
function Barcode({ seed }) {
  const bars = [...`${seed}${seed}`].map((digit, i) => ((Number(digit) + i) % 3) + 1)
  return (
    <div className="paper-barcode" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} style={{ '--w': `${w}px` }} />
      ))}
    </div>
  )
}

// The ticket stub. It echoes the answers as they are written, and is the
// keepsake that tears off once the application is sent.
function Stub({ number, name, year, department, ...props }) {
  const blank = 'text-white/30'
  return (
    <div className="paper-stub" {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="type-fine text-white/55">AWS Learning Club – Genesis</p>
          <p className="type-fine text-white/55">Member pass · admit one</p>
        </div>
        <Barcode seed={number} />
      </div>

      <p className={cn('mt-4 truncate text-[clamp(24px,3vw,30px)] leading-tight font-semibold tracking-[-0.03em]', !name && blank)}>
        {name || 'Your name'}
      </p>

      <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-4 border-t border-white/10 pt-4">
        <div className="min-w-0">
          <dt className="type-fine text-white/45">Year</dt>
          <dd className={cn('type-caption truncate', !year && blank)}>{year || '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="type-fine text-white/45">Department</dt>
          <dd className={cn('type-caption truncate', !department && blank)}>{department || '—'}</dd>
        </div>
        <div>
          <dt className="type-fine text-white/45">No.</dt>
          <dd className="type-caption tabular-nums">{number}</dd>
        </div>
      </dl>
    </div>
  )
}

function Stamp({ className }) {
  return (
    <div className={cn('paper-stamp', className)} aria-hidden="true">
      {/* Ink texture: roughened edges, plus speckles where the ink didn't take. */}
      <svg width="0" height="0" className="absolute">
        <filter id="paper-stamp-ink" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 2" result="speckle" />
          <feComposite in="rough" in2="speckle" operator="in" />
        </filter>
      </svg>
      <div className="paper-stamp-inner">
        <span className="paper-stamp-top">Genesis · TSU</span>
        <span className="paper-stamp-main">Received</span>
        <span className="paper-stamp-date">{TODAY}</span>
      </div>
    </div>
  )
}

// The membership application, filled in on a paper sheet. Answers go to the
// club's Google Sheet; once saved, the stub tears off as the confirmation.
export default function JoinForm() {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'failed' | 'stamped' | 'tearing' | 'sent'
  const [draft, setDraft] = useState({ name: '', year: '', department: '' })
  const sentRef = useRef(null)
  const stubRef = useRef(null)
  const receiptRef = useRef(null)
  // Where the stub was on screen when it came off, so the receipt can take its place.
  const stubTop = useRef(null)
  const audio = useRef(null)
  // Sent along with every attempt, so retrying after a lost connection can't
  // add the same application to the sheet twice.
  const [id] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const [number] = useState(() => String(Math.floor(Math.random() * 9000) + 1000))

  useEffect(() => {
    if (status === 'stamped') {
      const timer = setTimeout(() => setStatus('tearing'), STAMP_MS)
      return () => clearTimeout(timer)
    }
    if (status === 'tearing') {
      playRip(audio.current)
      const timer = setTimeout(() => {
        stubTop.current = stubRef.current?.getBoundingClientRect().top ?? null
        setStatus('sent')
      }, TEAR_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [status])

  // The sheet is gone once the stub is off, so the page gets shorter. Before
  // the browser paints, scroll by the difference so the receipt sits where
  // the torn stub came to rest. When the page is too short to scroll that
  // far, start the receipt where the stub was and let it glide up into place.
  useLayoutEffect(() => {
    if (status !== 'sent') return
    const receipt = receiptRef.current
    if (receipt && stubTop.current != null) {
      window.scrollBy({ top: receipt.getBoundingClientRect().top - stubTop.current, behavior: 'instant' })
      const gap = stubTop.current - receipt.getBoundingClientRect().top
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (Math.abs(gap) > 1 && !still) {
        receipt.parentElement?.animate([{ translate: `0 ${gap}px` }, { translate: '0 0' }], {
          duration: 750,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        })
      }
    }
    sentRef.current?.focus({ preventScroll: true })
  }, [status])

  const handleSubmit = async event => {
    event.preventDefault()
    if (status === 'sending' || status === 'stamped' || status === 'tearing') return
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

    // Set up the rip sound now, while this counts as the click that allows it.
    audio.current ??= createRipAudio()
    setStatus('sending')
    try {
      await submitApplication({ ...values, facebook: facebookUrl(values.facebook), id })
      setStatus('stamped')
    } catch (error) {
      console.error('Application not sent:', error)
      setStatus('failed')
    }
  }

  // Drop a field's error as soon as it is edited, and copy the answers the
  // stub shows onto it.
  const handleChange = event => {
    const { name, value } = event.target
    setErrors(current => (current[name] ? { ...current, [name]: undefined } : current))
    if (name in draft) setDraft(current => ({ ...current, [name]: value.trim() }))
  }

  if (status === 'sent') {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className="mx-auto w-full max-w-[210mm] outline-none">
        <div className="paper-receipt">
          <Stub ref={receiptRef} number={number} {...draft} />
        </div>
        <div className="paper-sent-note">
          <p className="type-h3 mt-12">Application sent.</p>
          <p className="type-body mt-3 max-w-[40ch] text-ink/70">
            Thank you for applying to Genesis. Your stub is number {number}.
          </p>
          <TransitionLink to="/" className="btn btn-dark mt-8">
            Back to home <ArrowRight aria-hidden="true" />
          </TransitionLink>
        </div>
      </div>
    )
  }

  const busy = status === 'sending' || status === 'stamped' || status === 'tearing'

  return (
    <div className={cn('paper', status === 'tearing' && 'is-tearing')}>
      <form noValidate onSubmit={handleSubmit} onChange={handleChange} className="paper-sheet">
        <span aria-hidden="true" className="paper-hole top-[26%]" />
        <span aria-hidden="true" className="paper-hole top-[60%]" />
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div>
            <p className="type-h3">Membership application</p>
            <p className="type-fine mt-1 text-ink/50">Form G-01 · Fill in every line</p>
          </div>
          <p className="type-fine shrink-0 pt-1 text-right text-ink/50 tabular-nums">{TODAY}</p>
        </div>

        <div className="mt-7 mb-8 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 sm:grid-cols-2">
          <Field n={1} name="name" label="Name" autoComplete="name" maxLength={100} error={errors.name} />
          <Field n={2} name="college" label="College" maxLength={120} error={errors.college} />
          <Choices n={3} name="year" label="Year" options={YEARS} error={errors.year} className="sm:col-span-2" />
          <Field n={4} name="email" label="Email" type="email" autoComplete="email" maxLength={150} error={errors.email} />
          <Field
            n={5}
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
            n={6}
            name="department"
            label="Department you want to join"
            options={DEPARTMENTS}
            error={errors.department}
            className="sm:col-span-2"
          />
          <Field
            as="textarea"
            n={7}
            name="reason"
            label="Reason to join"
            rows={4}
            maxLength={2000}
            error={errors.reason}
            className="sm:col-span-2"
          />
        </div>

        {/* Trap for spam bots: people never see or reach this field, and the
            sheet ignores any application that fills it in. */}
        <div aria-hidden="true" className="absolute size-px overflow-hidden [clip-path:inset(50%)]">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Pinned to the foot of the page, like the signature block on a printed form. */}
        <div className="relative mt-auto flex flex-col gap-6 border-t border-dashed border-ink/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
          {/* The name, signed back at the foot of the sheet. */}
          <div aria-hidden="true" className="min-w-0 sm:w-1/2">
            <p className="paper-ink truncate border-b border-ink/30 pb-1 text-[22px] font-semibold tracking-[-0.03em] min-h-9">
              {draft.name}
            </p>
            <p className="type-fine mt-1.5 text-ink/45">Applicant</p>
          </div>
          <button type="submit" disabled={busy} className="btn btn-dark w-full sm:w-auto">
            {status === 'sending' ? 'Submitting…' : 'Submit application'}
            <ArrowRight aria-hidden="true" />
          </button>
          {(status === 'stamped' || status === 'tearing') && <Stamp className="right-[6%] -top-6 sm:right-[30%]" />}
        </div>

        <div role="alert">
          {status === 'failed' && (
            <p className="type-small mt-4 text-red-700">
              Your application wasn't sent. Your answers are still here, so please try again.
            </p>
          )}
        </div>

        <p className="type-fine mt-6 flex justify-between gap-4 text-ink/35">
          <span>AWS Learning Club – Genesis · Tarlac State University</span>
          <span className="shrink-0">Page 1 of 1</span>
        </p>
      </form>

      {/* The tear-off slip at the foot of the page. */}
      <div className="paper-perf" aria-hidden="true" />
      <Stub ref={stubRef} number={number} {...draft} aria-hidden="true" />
    </div>
  )
}
