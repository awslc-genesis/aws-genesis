import PageLayout from '@/components/layout/PageLayout'
import { JoinForm } from '@/features/join'

// Join page: the membership application, opened from Join Us in the hero and
// the spinning Become a Member button on the home page.
export default function Join() {
  return (
    <PageLayout title="Join Genesis">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 px-4 pt-16 pb-24 sm:px-10 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)] lg:gap-20 lg:px-16 lg:pb-36">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="type-h2 pb-[0.1em]">
            Become a <span className="text-genesis-gradient type-accent">Member</span>
          </h2>
          <p className="type-body mt-6 max-w-[36ch] text-ink/70">
            Tell us about yourself and the department you want to join. Every field is required.
          </p>
        </div>
        <JoinForm />
      </div>
    </PageLayout>
  )
}
