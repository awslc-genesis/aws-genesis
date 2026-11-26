import { cn } from '@/utils/cn'

import './PaperForm.css'

// The fields written on a paper sheet, shared by the Join and Contact forms.
// `form` prefixes every id (e.g. "join" → "join-name"), so two sheets never clash.

// 16px text on purpose: iOS zooms the page when a smaller field is focused.
const FIELD_CLASS =
  'mt-1 block w-full rounded-none border-0 border-b border-ink/20 bg-transparent px-0 py-2.5 text-base paper-ink caret-[#1f2d5c] outline-none transition-colors placeholder:text-ink/35 hover:border-ink/50 focus:border-ink aria-invalid:border-red-700'

export function FieldError({ id, message }) {
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
export function Field({ form, as: Tag = 'input', n, name, label, error, className, required = true, ...props }) {
  const errorId = `${form}-${name}-error`
  const lined = Tag === 'textarea'
  return (
    <div className={className}>
      <label htmlFor={`${form}-${name}`} className="type-small font-medium">
        <Num n={n} />
        {label}
      </label>
      <Tag
        id={`${form}-${name}`}
        name={name}
        required={required}
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
export function Choices({ form, n, name, label, options, error, className }) {
  const errorId = `${form}-${name}-error`
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
