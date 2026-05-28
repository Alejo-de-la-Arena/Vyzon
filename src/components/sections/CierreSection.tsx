'use client'

import { useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, useGSAP, EASE, DURATION, prefersReducedMotion, isTouchDevice } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

export function CierreSection() {
  const t          = useTranslations('closing')
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef     = useRef<HTMLAnchorElement>(null)

  // Entrance animation
  useGSAP(() => {
    if (prefersReducedMotion()) return

    const section = sectionRef.current!
    const line1   = section.querySelector<HTMLElement>('.cierre-line1')!
    const line2   = section.querySelector<HTMLElement>('.cierre-line2')!
    const sub     = section.querySelector<HTMLElement>('.cierre-sub')!
    const cta     = section.querySelector<HTMLElement>('.cierre-cta')!

    // Estado inicial visible (CSS-natural). El timeline anima de "from" a "to"
    // SOLO cuando el ScrollTrigger dispara. Si nunca dispara → elementos visibles.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        once: true,
      },
    })

    tl.fromTo(line1, { opacity: 0, y: 40 },     { opacity: 1, y: 0,     duration: DURATION.slow, ease: EASE.expo, immediateRender: false })
      .fromTo(line2, { opacity: 0, y: 40 },     { opacity: 1, y: 0,     duration: DURATION.slow, ease: EASE.expo, immediateRender: false }, '-=0.5')
      .fromTo(sub,   { opacity: 0, y: 20 },     { opacity: 1, y: 0,     duration: DURATION.mid,  ease: EASE.expo, immediateRender: false }, '-=0.3')
      .fromTo(cta,   { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: DURATION.mid,  ease: EASE.back, immediateRender: false }, '-=0.2')
  }, { scope: sectionRef })

  // Magnetic CTA
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return
    const btn = ctaRef.current
    if (!btn) return

    const MAGNETIC_RADIUS = 80
    const MAX_X = 14
    const MAX_Y = 8

    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MAGNETIC_RADIUS) {
        const s = 1 - dist / MAGNETIC_RADIUS
        gsap.to(btn, {
          x: dx * s * (MAX_X / rect.width * 2),
          y: dy * s * (MAX_Y / rect.height * 2),
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }
    const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: EASE.expo })

    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    return () => {
      btn.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative bg-black border-t border-bone-faint/[0.08] py-section overflow-hidden"
      aria-label="Contacto"
    >
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(600px circle at 50% 50%, rgba(0,229,255,0.06), transparent 70%)',
        }}
      />

      {/* Particle vortex */}
      <SectionBackground variant="cierre" />

      <div className="container-site relative z-10 flex flex-col items-center text-center">
        {/* Headline */}
        <div className="overflow-hidden">
          <h2
            className="cierre-line1 font-sans text-display-xl text-bone"
            style={{ lineHeight: '0.95' }}
          >
            {t('line1')}
          </h2>
        </div>
        <div className="overflow-hidden mt-4">
          <p
            className="cierre-line2 font-sans text-display-xl font-light italic text-cyan"
            style={{ lineHeight: '0.95' }}
          >
            {t('line2')}
          </p>
        </div>

        {/* Subtitle */}
        <p className="cierre-sub font-sans text-body-lg text-bone-muted max-w-[45ch] mt-12 leading-relaxed">
          {t('subtitle')}
        </p>

        {/* CTA */}
        <a
          ref={ctaRef}
          href="mailto:hola@vyzon.dev"
          data-cursor="cta"
          className="
            cierre-cta
            inline-flex items-center gap-2
            font-mono text-label uppercase tracking-widest
            bg-transparent text-bone border border-cyan/60
            px-12 py-6 mt-20
            transition-all duration-350
            hover:bg-cyan/10 hover:border-cyan
          "
        >
          {t('cta')} →
        </a>
      </div>
    </section>
  )
}
