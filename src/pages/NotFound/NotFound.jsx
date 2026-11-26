import { ArrowRight } from 'lucide-react'

import TransitionLink from '@/components/common/TransitionLink'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper px-4 text-center text-ink">
      <h1 className="type-h1">
        <span className="text-genesis-gradient type-accent">404</span>
      </h1>
      <p className="type-lede text-ink/70">This page doesn’t exist.</p>
      <TransitionLink to="/" className="btn btn-dark mt-2">
        Back home <ArrowRight aria-hidden="true" />
      </TransitionLink>
    </main>
  )
}
