import PageLayout from '@/components/PageLayout'

// Contact page: intentionally empty for now, waiting on a new design. The
// route, menu bar, screen-reader title and footer still work, so links to
// /contact keep landing here. The blank area keeps the page a screen tall.
export default function Contact() {
  return (
    <PageLayout title="Contact">
      <div className="min-h-[60svh]" />
    </PageLayout>
  )
}
