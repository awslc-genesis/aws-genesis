import TransitionLink from '@/components/TransitionLink'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper px-4 text-center text-ink">
      <h1 className="type-h2">404</h1>
      <p className="type-body text-ink/60">This page doesn't exist.</p>
      <Button asChild>
        <TransitionLink to="/">Back home</TransitionLink>
      </Button>
    </main>
  )
}
