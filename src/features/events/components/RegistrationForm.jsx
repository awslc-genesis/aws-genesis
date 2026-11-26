import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, User } from 'lucide-react'

import '@/features/join/components/PaperForm.css'
import { cn } from '@/utils/cn'

import {
  memberCount,
  memberFields,
  submitRegistration,
  toRows,
  validateStep,
  visibleFields,
} from '../registration'

// 16px text on purpose: iOS zooms the page when a smaller field is focused.
// Same underlined line as the Join and Contact sheets.
const LINE =
  'mt-1 block w-full rounded-none border-0 border-b border-ink/20 bg-transparent px-0 py-2.5 text-base paper-ink caret-[#1f2d5c] outline-none transition-colors placeholder:text-ink/35 hover:border-ink/50 focus:border-ink aria-invalid:border-red-700'

const optionValue = option => option.value ?? option

function ErrorLine({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="type-small mt-2 text-red-700">
      {message}
    </p>
  )
}

// One question, whatever its type. `name` is the input's full name
// ("email", "members.0.email"); `value`/`onValue` hold its answer.
function Question({ field, name, value, onValue, error, values, formId }) {
  const id = `${formId}-${name.replaceAll('.', '-')}`
  const errorId = `${id}-error`
  const described = error ? errorId : field.hint ? `${id}-hint` : undefined
  const hint = field.hint && (
    <p id={`${id}-hint`} className="type-fine mt-1 text-ink/45">
      {field.hint}
    </p>
  )
  const span = field.wide && 'sm:col-span-2'

  if (field.type === 'note') {
    const text = typeof field.text === 'function' ? field.text(values) : field.text
    return <p className={cn('type-body rounded-sm border border-ink/10 bg-white/60 p-5 text-ink/75', span)}>{text}</p>
  }

  if (field.type === 'check') {
    return (
      <div className={span}>
        <label className="group flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name={name}
            checked={Boolean(value)}
            onChange={event => onValue(event.target.checked)}
            aria-invalid={Boolean(error)}
            aria-describedby={described}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[3px] border border-ink/30 transition-colors group-hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
          >
            {value && <Check className="size-3.5" strokeWidth={2.5} />}
          </span>
          <span className="type-body text-ink/80">{field.label}</span>
        </label>
        <ErrorLine id={errorId} message={error} />
      </div>
    )
  }

  if (field.type === 'choice' || field.type === 'cards') {
    const cards = field.type === 'cards'
    return (
      <fieldset className={cn('min-w-0', span)} aria-describedby={described}>
        <legend className="type-small font-medium">{field.label}</legend>
        {hint}
        <div
          className={cn(
            cards ? 'mt-3 grid grid-cols-2 gap-2 lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]' : '-mx-3 mt-2 flex flex-wrap gap-x-1',
          )}
        >
          {field.options.map(option => {
            const optValue = optionValue(option)
            const checked = value === optValue
            const radio = (
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={checked}
                onChange={() => onValue(optValue)}
                className="absolute inset-0 cursor-pointer appearance-none outline-none"
              />
            )
            if (!cards) {
              return (
                <label
                  key={optValue}
                  className="paper-choice relative inline-flex min-h-11 cursor-pointer items-center rounded-full px-3 type-small text-ink/60 transition-colors hover:text-ink has-checked:font-medium has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                >
                  {radio}
                  {optValue}
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
              )
            }
            return (
              <label
                key={optValue}
                className={cn(
                  'relative flex min-h-28 cursor-pointer flex-col justify-between gap-4 rounded-sm border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink',
                  checked ? 'border-ink bg-ink text-paper' : 'border-ink/15 bg-white/50 hover:border-ink/50',
                )}
              >
                {radio}
                {option.size ? (
                  <span aria-hidden="true" className="flex gap-1">
                    {Array.from({ length: option.size }, (_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'flex size-6 items-center justify-center rounded-[3px] border',
                          checked ? 'border-paper/30' : 'border-ink/15',
                        )}
                      >
                        <User className="size-3.5" strokeWidth={1.75} />
                      </span>
                    ))}
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full border',
                      checked ? 'border-paper bg-paper text-ink' : 'border-ink/25',
                    )}
                  >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                )}
                <span>
                  <span className="type-small block font-medium">{optValue}</span>
                  {option.hint && (
                    <span className={cn('type-fine mt-0.5 block', checked ? 'text-paper/60' : 'text-ink/50')}>
                      {option.hint}
                    </span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
        <ErrorLine id={errorId} message={error} />
      </fieldset>
    )
  }

  const Tag = field.type === 'textarea' ? 'textarea' : 'input'
  return (
    <div className={span}>
      <label htmlFor={id} className="type-small font-medium">
        {field.label}
        {field.required === false && <span className="font-normal text-ink/40"> · optional</span>}
      </label>
      <Tag
        id={id}
        name={name}
        type={Tag === 'input' ? field.type : undefined}
        rows={Tag === 'textarea' ? 3 : undefined}
        value={value ?? ''}
        onChange={event => onValue(event.target.value)}
        autoComplete={field.autoComplete}
        maxLength={Tag === 'textarea' ? 2000 : 200}
        aria-invalid={Boolean(error)}
        aria-describedby={described}
        className={cn(LINE, Tag === 'textarea' && 'paper-lined mt-2 border-b-0 py-0')}
      />
      {hint}
      <ErrorLine id={errorId} message={error} />
    </div>
  )
}

// The registration sheet: tabs along the top, one step at a time, a Review
// step at the end, then it's sent to the event's tab in Google Sheets.
export default function RegistrationForm({ event }) {
  const form = event.registration.form
  const steps = useMemo(() => [...form, { title: 'Review', review: true, fields: [] }], [form])
  const formId = `reg-${event.slug}`

  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [current, setCurrent] = useState(0)
  // The furthest step reached, so the tabs can jump back (never ahead).
  const [reached, setReached] = useState(0)
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'failed' | 'limited'
  const [id] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const sheet = useRef(null)
  const trap = useRef(null)

  const step = steps[current]
  const last = current === steps.length - 1

  const setValue = (name, value) => {
    setValues(previous => {
      const [root, index, key] = name.split('.')
      if (!key) return { ...previous, [root]: value }
      const list = [...(previous[root] ?? [])]
      list[index] = { ...list[index], [key]: value }
      return { ...previous, [root]: list }
    })
    setErrors(previous => (previous[name] ? { ...previous, [name]: undefined } : previous))
  }

  const scrollToSheet = () => sheet.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const goTo = index => {
    setCurrent(index)
    setReached(r => Math.max(r, index))
    setErrors({})
    scrollToSheet()
  }

  // Checks every step up to `upTo`; stops on the first one with a problem.
  const firstInvalidStep = upTo => {
    for (let i = 0; i <= upTo; i++) {
      if (steps[i].review) continue
      const found = validateStep(steps[i], form, values)
      if (Object.keys(found).length) return { index: i, found }
    }
    return null
  }

  const showErrors = ({ index, found }) => {
    setCurrent(index)
    setErrors(found)
    requestAnimationFrame(() => {
      const name = Object.keys(found)[0]
      sheet.current?.querySelector(`[name="${CSS.escape(name)}"]`)?.focus({ preventScroll: true })
      scrollToSheet()
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!last) {
      const problem = firstInvalidStep(current)
      if (problem) return showErrors(problem)
      return goTo(current + 1)
    }
    if (status === 'sending') return
    const problem = firstInvalidStep(steps.length - 1)
    if (problem) return showErrors(problem)

    setStatus('sending')
    try {
      await submitRegistration({ event, form, values, id, website: trap.current?.value })
      setStatus('sent')
      scrollToSheet()
    } catch (error) {
      console.error('Registration not sent:', error)
      setStatus(error.message === 'rate_limited' ? 'limited' : 'failed')
    }
  }

  if (status === 'sent') {
    return (
      <div ref={sheet} className="paper paper-plain max-w-none! scroll-mt-28">
        <div className="paper-sheet items-start gap-5 py-14">
          <span className="flex size-12 items-center justify-center rounded-full bg-ink text-paper">
            <Check className="size-5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <p className="type-h3">You’re registered for {event.title}.</p>
          <p className="type-body max-w-[48ch] text-ink/70">
            We saved your registration. Watch your email: Genesis will send the confirmation and event details there.
          </p>
          <p className="type-fine text-ink/45 tabular-nums">Reference {id.split('-')[0]}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={sheet} className="scroll-mt-28">
      {/* Step tabs: done steps can be revisited, later ones unlock in order. */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]">
        {steps.map((s, i) => {
          const active = i === current
          const done = i <= reached && !active
          return (
            <li key={s.title}>
              <button
                type="button"
                disabled={i > reached}
                aria-current={active ? 'step' : undefined}
                onClick={() => {
                  if (i <= current) return goTo(i)
                  const problem = firstInvalidStep(i - 1)
                  if (problem) showErrors(problem)
                  else goTo(i)
                }}
                className={cn(
                  'flex h-12 w-full items-center gap-3 rounded-sm border px-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  active
                    ? 'border-ink bg-ink text-paper'
                    : done
                      ? 'border-ink/20 text-ink hover:border-ink/60'
                      : 'border-ink/10 text-ink/35',
                )}
              >
                <span className={cn('type-fine tabular-nums', active ? 'text-paper/55' : 'text-ink/40')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="type-small truncate font-medium">{s.title}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="paper paper-plain mt-6 max-w-none! lg:rotate-0!">
        <form noValidate onSubmit={onSubmit} className="paper-sheet">
          <span aria-hidden="true" className="paper-hole top-[30%]" />
          <span aria-hidden="true" className="paper-hole top-[70%]" />

          <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
            <div>
              <p className="type-h3">{step.title}</p>
              {(step.intro || step.review) && (
                <p className="type-small mt-1 max-w-[52ch] text-ink/55">
                  {step.review ? 'Check your answers, then send. Use the tabs above to change anything.' : step.intro}
                </p>
              )}
            </div>
            <p className="type-fine shrink-0 pt-1 text-ink/45 tabular-nums">
              Step {current + 1} of {steps.length}
            </p>
          </div>

          {step.review ? (
            <dl className="mt-7 mb-8 grid gap-x-10 sm:grid-cols-2">
              {toRows(form, values).map(([label, answer]) => (
                <div key={label} className="border-b border-ink/10 py-3">
                  <dt className="type-fine text-ink/45">{label}</dt>
                  <dd className={cn('type-small mt-0.5 break-words', !answer && 'text-ink/35')}>{answer || '—'}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-7 mb-8 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-7 sm:grid-cols-2">
              {visibleFields(step, values).map(field =>
                field.type === 'members' ? (
                  Array.from({ length: memberCount(field, form, values) }, (_, i) => (
                    <fieldset key={`${field.name}-${i}`} className="min-w-0 sm:col-span-2">
                      <legend className="type-label flex w-full items-center gap-3 text-ink/55">
                        Member {i + 1}
                        {i === 0 && memberCount(field, form, values) > 1 && ' · Team leader'}
                        <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
                      </legend>
                      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 sm:grid-cols-2">
                        {memberFields(field, i).map(sub => {
                          const name = `${field.name}.${i}.${sub.name}`
                          return (
                            <Question
                              key={name}
                              field={sub}
                              name={name}
                              value={values[field.name]?.[i]?.[sub.name]}
                              onValue={value => setValue(name, value)}
                              error={errors[name]}
                              values={values}
                              formId={formId}
                            />
                          )
                        })}
                      </div>
                    </fieldset>
                  ))
                ) : (
                  <Question
                    key={field.name}
                    field={field}
                    name={field.name}
                    value={values[field.name]}
                    onValue={value => setValue(field.name, value)}
                    error={errors[field.name]}
                    values={values}
                    formId={formId}
                  />
                ),
              )}
            </div>
          )}

          {/* Trap for spam bots: people never see or reach this field. */}
          <div aria-hidden="true" className="absolute size-px overflow-hidden [clip-path:inset(50%)]">
            <input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="mt-auto flex flex-col-reverse gap-3 border-t border-dashed border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {current > 0 ? (
              <button type="button" onClick={() => goTo(current - 1)} className="btn btn-quiet -ml-3 self-start">
                <ArrowLeft aria-hidden="true" /> Back
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <p
                role="status"
                className={cn('type-small sm:max-w-[30ch] sm:text-right', status === 'idle' || status === 'sending' ? 'sr-only' : 'text-red-700')}
              >
                {status === 'failed' && 'Your registration wasn’t sent. Your answers are still here, so please try again.'}
                {status === 'limited' && 'Too many registrations from this email for now. Please try again later.'}
                {status === 'sending' && 'Sending…'}
              </p>
              <button type="submit" disabled={status === 'sending'} className="btn btn-dark w-full sm:w-auto">
                {last ? (status === 'sending' ? 'Sending…' : 'Send registration') : `Next: ${steps[current + 1].title}`}
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

