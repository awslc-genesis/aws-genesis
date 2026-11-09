// Renders text as individually animatable words while keeping one readable
// accessible name. Words sit in an overflow-hidden mask so they can rise in.
// maskClassName adds room inside the mask, e.g. right padding so italic
// overhangs are not clipped.
export default function SplitWords({ text, className = '', wordClassName = '', maskClassName = '' }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={className}>
        {words.map((word, i) => (
          <span key={i} className={`inline-block overflow-hidden pb-[0.08em] align-bottom ${maskClassName}`}>
            <span data-word className={`inline-block will-change-transform ${wordClassName}`}>
              {word}
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </>
  )
}
