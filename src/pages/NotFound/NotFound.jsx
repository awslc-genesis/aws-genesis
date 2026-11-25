import TransitionLink from '@/components/common/TransitionLink'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper px-4 text-center text-ink">
      <h1 className="type-h1">
        <span className="text-genesis-gradient type-accent">404</span>
      </h1>
      <p className="type-body text-ink/70">This page doesn’t exist.</p>
      <TransitionLink
        to="/"
        className="mt-2 inline-flex min-h-11 items-center justify-center bg-genesis px-4 text-sm font-medium text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        Back home
      </TransitionLink>
    </main>
  )
}
