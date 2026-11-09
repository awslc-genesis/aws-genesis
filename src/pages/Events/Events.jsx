import PageLayout from '@/components/layout/PageLayout'

// Events page: intentionally empty for now, waiting on a new design. The
// route, menu bar, screen-reader title and footer still work, so links to
// /events keep landing here. The blank area keeps the page a screen tall.
// (The home page's Latest Events strip lives in features/events.)
export default function Events() {
  return (
    <PageLayout title="Events">
      <div className="min-h-[60svh]" />
    </PageLayout>
  )
}
