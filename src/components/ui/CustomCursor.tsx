'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * CustomCursor — VYZON crosshair edition.
 *
 *   Crosshair (16px, white + mix-blend-mode:difference) → tracks mouse 1:1
 *   Square    (36px, cyan outline)                       → follows with lerp (delay)
 *   Label     (cyan chip)                                → shows data-cursor-label on hover
 *
 * Hover:
 *   - Square: scale 1.8 + rotate 45° → diamond
 *   - Crosshair: scale 0.6 + rotate 90°
 *   - Label: fades in with the data-cursor-label text
 *
 * Off on touch / no-fine-pointer / reduced-motion.
 */
export function CustomCursor() {
  const crosshairRef = useRef<HTMLDivElement>(null)
  const squareRef    = useRef<HTMLDivElement>(null)
  const labelRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cross = crosshairRef.current
    const sq    = squareRef.current
    const lb    = labelRef.current
    if (!cross || !sq || !lb) return

    // Hide native cursor everywhere
    const styleEl = document.createElement('style')
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }`
    document.head.appendChild(styleEl)

    // Initial hidden — appear on first move
    gsap.set([cross, sq, lb], { opacity: 0 })

    // Square eased follow
    const sqXTo = gsap.quickTo(sq, 'x', { duration: 0.5, ease: 'power3' })
    const sqYTo = gsap.quickTo(sq, 'y', { duration: 0.5, ease: 'power3' })

    // Label follows with shorter delay
    const lbXTo = gsap.quickTo(lb, 'x', { duration: 0.3, ease: 'power2' })
    const lbYTo = gsap.quickTo(lb, 'y', { duration: 0.3, ease: 'power2' })

    let firstMove = true
    const onMove = (e: MouseEvent) => {
      gsap.set(cross, { x: e.clientX, y: e.clientY })
      sqXTo(e.clientX)
      sqYTo(e.clientY)
      lbXTo(e.clientX)
      lbYTo(e.clientY)
      if (firstMove) {
        gsap.to([cross, sq], { opacity: 1, duration: 0.3 })
        firstMove = false
      }
    }

    // Emil: no back.out (bounce). power4.out da el snap-back decisivo sin overshoot.
    const onDown = () => gsap.to(sq, { scale: 0.85, duration: 0.12, ease: 'power2.out' })
    const onUp   = () => gsap.to(sq, { scale: 1,    duration: 0.3,  ease: 'power4.out' })

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)

    function applyHoverState(target: HTMLElement) {
      const text = target.getAttribute('data-cursor-label') || ''
      gsap.to(sq, {
        scale: 1.8, rotation: 45,
        borderColor: '#00E5FF',
        duration: 0.4, ease: 'power2.out',
      })
      gsap.to(cross, {
        scale: 0.6, rotation: 90,
        duration: 0.3,
      })
      if (text) {
        lb!.textContent = text
        gsap.to(lb, { opacity: 1, duration: 0.2 })
      }
    }
    function resetHoverState() {
      gsap.to(sq, {
        scale: 1, rotation: 0,
        borderColor: 'rgba(0, 229, 255, 0.4)',
        duration: 0.4, ease: 'power2.out',
      })
      gsap.to(cross, {
        scale: 1, rotation: 0,
        duration: 0.3,
      })
      gsap.to(lb, { opacity: 0, duration: 0.15 })
    }

    function setupHoverTargets() {
      const targets = document.querySelectorAll<HTMLElement>('a, button, [role="button"], [data-cursor], [data-cursor-label]')
      targets.forEach(el => {
        if (el.dataset.cursorBound === '1') return
        el.dataset.cursorBound = '1'
        el.addEventListener('mouseenter', () => applyHoverState(el))
        el.addEventListener('mouseleave', resetHoverState)
      })
    }
    setupHoverTargets()
    const observer = new MutationObserver(setupHoverTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.head.removeChild(styleEl)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Crosshair — sigue al mouse 1:1, mix-blend-mode difference */}
      <div
        ref={crosshairRef}
        aria-hidden="true"
        className="vyzon-cursor-cross fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width:        16,
          height:       16,
          transform:    'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      >
        {/* horizontal line */}
        <span
          className="absolute top-1/2 left-0 w-full bg-white"
          style={{ height: 1, transform: 'translateY(-50%)' }}
        />
        {/* vertical line */}
        <span
          className="absolute left-1/2 top-0 h-full bg-white"
          style={{ width: 1, transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Square outline — sigue con delay */}
      <div
        ref={squareRef}
        aria-hidden="true"
        className="vyzon-cursor-sq fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width:        36,
          height:       36,
          border:       '1px solid rgba(0, 229, 255, 0.4)',
          transform:    'translate(-50%, -50%)',
        }}
      />

      {/* Label chip — contextual */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="vyzon-cursor-label fixed top-0 left-0 pointer-events-none z-[9997] font-mono opacity-0"
        style={{
          padding:      '4px 8px',
          background:   '#00E5FF',
          color:        '#000',
          fontSize:     10,
          letterSpacing:'0.15em',
          textTransform:'uppercase',
          translate:    '20px 20px',
        }}
      />

      {/* Hide on touch / coarse pointer / reduced motion */}
      <style jsx>{`
        @media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
          :global(.vyzon-cursor-cross),
          :global(.vyzon-cursor-sq),
          :global(.vyzon-cursor-label) {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
