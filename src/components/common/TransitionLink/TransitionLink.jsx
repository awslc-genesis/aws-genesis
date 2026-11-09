import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

import { usePageTransition } from '@/components/PageTransition'

// A router Link that plays the page transition: a normal click covers the page
// with the curtain, changes route behind it and reveals the new page. Clicks
// that open a new tab or window (modifier keys, middle click) behave as usual,
// and an onClick handler can still cancel the navigation with preventDefault.
const TransitionLink = forwardRef(function TransitionLink({ to, onClick, ...props }, ref) {
  const { go } = usePageTransition()

  return (
    <Link
      ref={ref}
      to={to}
      {...props}
      onClick={event => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (props.target && props.target !== '_self') return
        event.preventDefault()
        go(typeof to === 'string' ? to : to.pathname)
      }}
    />
  )
})

export default TransitionLink
