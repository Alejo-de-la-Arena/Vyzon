'use client'

import { useEffect, useRef } from 'react'
import { gsap, isTouchDevice } from '@/lib/gsap'

/**
 * CustomCursor — cursor personalizado VYZON.
 * Dot interno (6px cyan, mix-blend-mode: difference) +
 * Ring exterior (32px con lag lerp 0.12).
 *
 * Se desactiva automáticamente en:
 *  - Dispositivos touch (pointer: coarse)
 *  - prefers-reduced-motion
 *
 * Modos según data-cursor attribute:
 *  - default: ring 32px
 *  - [data-cursor="cta"]: ring 50px + label "→"
 *  - [data-cursor="view"]: ring 70px + bg cyan + label "VER"
 */
export function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Skip on touch and reduced motion
    if (isTouchDevice()) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dot   = dotRef.current!
    const ring  = ringRef.current!
    const label = labelRef.current!

    let mouseX = 0, mouseY = 0
    let ringX  = 0, ringY  = 0
    const LAG  = 0.12

    // Mostrar cursores al primer movimiento
    gsap.set([dot, ring], { opacity: 0 })

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      gsap.set(dot, { x: mouseX - 3, y: mouseY - 3, opacity: 1 })
      gsap.set(ring, { opacity: 1 })
    }

    document.addEventListener('mousemove', onMouseMove)

    // Ring lag loop
    const tickerId = gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * LAG
      ringY += (mouseY - ringY) * LAG
      gsap.set(ring, { x: ringX - 16, y: ringY - 16 })
    })

    // Click feedback
    const onMouseDown = () => gsap.to(ring, { scale: 0.7, duration: 0.1 })
    const onMouseUp   = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' })
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)

    // Reset helper
    function resetCursor() {
      gsap.to(ring, {
        width: 32, height: 32,
        backgroundColor: 'transparent',
        borderColor: 'rgba(0, 229, 255, 0.5)',
        duration: 0.4, ease: 'expo.out',
      })
      label.textContent = ''
      label.style.color = ''
    }

    // Hover: links y botones genéricos
    function setupHoverTargets() {
      // Generic interactive elements
      document.querySelectorAll<HTMLElement>('a, button, [role="button"]').forEach(el => {
        if (el.dataset.cursorSetup) return
        el.dataset.cursorSetup = '1'

        el.addEventListener('mouseenter', () => {
          const mode = el.dataset.cursor

          if (mode === 'cta') {
            // Ring fills 20% cyan + grows + arrow label
            gsap.to(ring, {
              width: 50, height: 50,
              backgroundColor: 'rgba(0, 229, 255, 0.2)',
              borderColor: '#00E5FF',
              duration: 0.3, ease: 'expo.out',
            })
            label.textContent = '→'
            label.style.color = '#00E5FF'
          } else if (mode === 'view') {
            // Project visuals: large ring with center dot
            gsap.to(ring, {
              width: 70, height: 70,
              backgroundColor: 'rgba(0, 229, 255, 0.08)',
              borderColor: '#00E5FF',
              duration: 0.3, ease: 'expo.out',
            })
            label.textContent = '●'
            label.style.color = '#00E5FF'
          } else {
            gsap.to(ring, { width: 30, height: 30, borderColor: 'rgba(0, 229, 255, 0.8)', duration: 0.3 })
          }
        })

        el.addEventListener('mouseleave', resetCursor)
      })
    }

    // Setup inicial + observer para elementos dinámicos
    setupHoverTargets()

    const mutationObserver = new MutationObserver(() => setupHoverTargets())
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      gsap.ticker.remove(tickerId)
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot interno */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-[6px] h-[6px] rounded-full bg-cyan"
        style={{ mixBlendMode: 'difference' }}
      />

      {/* Ring exterior con lag */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border border-cyan/50 flex items-center justify-center"
        style={{ transition: 'width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s' }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[10px] font-medium select-none"
        />
      </div>
    </>
  )
}
