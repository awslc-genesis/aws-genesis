import { Route, Routes } from 'react-router-dom'

import PageTransition from '@/components/PageTransition'
import ScrollCursor from '@/components/ScrollCursor'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Events from '@/pages/Events'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Resources from '@/pages/Resources'
import Team from '@/pages/Team'

export default function App() {
  return (
    <>
      {/* Loading screen on first visit and the curtain between pages. */}
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events" element={<Events />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
      {/* Custom cursor with a scroll-progress ring; replaces the scrollbar on mouse devices. */}
      <ScrollCursor />
    </>
  )
}
