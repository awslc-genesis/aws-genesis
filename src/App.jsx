import PageTransition from '@/components/layout/PageTransition'
import ScrollCursor from '@/components/layout/ScrollCursor'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  return (
    <>
      {/* Loading screen on first visit and the curtain between pages. */}
      <PageTransition>
        <AppRoutes />
      </PageTransition>
      {/* Custom cursor with a scroll-progress ring; replaces the scrollbar on mouse devices. */}
      <ScrollCursor />
    </>
  )
}
