import PageLayout from '@/components/PageLayout'

// Team page: intentionally empty for now, waiting on a new design. The route,
// menu bar, screen-reader title and footer still work, so links to /team keep
// landing here. The blank area keeps the page a screen tall.
// (The home page's Meet the Team rows live in components/TeamSection.)
export default function Team() {
  return (
    <PageLayout title="Meet the Team">
      <div className="min-h-[60svh]" />
    </PageLayout>
  )
}
