import PageTransition from '@/components/layout/PageTransition'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  return (
    <>
      {/* Loading screen on first visit and the curtain between pages. */}
      <PageTransition>
        <AppRoutes />
      </PageTransition>
    </>
  )
}
