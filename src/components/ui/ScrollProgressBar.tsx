'use client'

/**
 * ScrollProgressBar — VYZON Portfolio
 *
 * A 2px vertical line on the right edge of the viewport that fills
 * with #00E5FF as the user scrolls down the page. Implemented via
 * GSAP ScrollTrigger scrub so it stays perfectly in sync with scroll.
 *
 * Automatically hidden via CSS when prefers-reduced-motion is set
 * (see globals.css .scroll-progress-track / .scroll-progress-line).
 */

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

export function ScrollProgressBar() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (prefersReducedMotion()) return
    const line = lineRef.current
    if (!line) return

    const st = ScrollTrigger.create({
      trigger:    document.documentElement,
      start:      'top top',
      end:        'bottom bottom',
      scrub:      0.4,
      onUpdate:   self => {
        gsap.set(line, { scaleY: self.progress })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <div aria-hidden="true" className="scroll-progress-track">
      <div ref={lineRef} className="scroll-progress-line" />
    </div>
  )
}
