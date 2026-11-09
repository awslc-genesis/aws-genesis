import { Route, Routes } from 'react-router-dom'

import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Events from '@/pages/Events'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Resources from '@/pages/Resources'
import Team from '@/pages/Team'

// Every page of the site and its URL. Add a page by creating it under
// src/pages and adding its <Route> here.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/team" element={<Team />} />
      <Route path="/events" element={<Events />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
