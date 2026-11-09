import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'

// Shared frame for the inner pages: the menu bar (dark text, since these pages
// start on cream), the page's own content on a cream panel whose rounded
// bottom tucks over the dark footer, and the footer. `title` names the page
// for screen readers and search engines; the page's visible headings come from
// its own content.
export default function PageLayout({ title, children }) {
  return (
    <div className="relative bg-ink">
      <Navbar tone="dark" />
      <main className="relative z-10 rounded-b-[2.5rem] bg-paper pt-20 text-ink sm:rounded-b-[4rem] sm:pt-24">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
      <Footer tone="dark" />
    </div>
  )
}
