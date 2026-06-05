'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion, isTouchDevice } from '@/lib/gsap'

interface Phase {
  num:      string
  name:     string
  desc:     string
  duration: string
}

const BONE = '#F5F0E8'
const CYAN = '#00E5FF'

export function ProcesoSection() {
  const t           = useTranslations('process')
  const sectionRef  = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)

  const phases = t.raw('phases') as Phase[]

  useGSAP(() => {
    const section  = sectionRef.current!
    const timeline = timelineRef.current!
    const reduced  = prefersReducedMotion()
    const touch    = isTouchDevice()
    const phaseEls = Array.from(section.querySelectorAll<HTMLElement>('.process-phase'))

    // Estado inicial del badge de duración (visible en touch / reduced)
    phaseEls.forEach(p => {
      const badge = p.querySelector<HTMLElement>('.phase-duration')!
      gsap.set(badge, (reduced || touch) ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 })
    })

    /* prefers-reduced-motion → todo construido y estático */
    if (reduced) {
      gsap.set(lineRef.current, { scaleY: 1 })
      gsap.set(phaseEls, { opacity: 1, x: 0 })
      phaseEls.forEach(p => {
        const dot = p.querySelector<HTMLElement>('.phase-dot')!
        gsap.set(dot, { backgroundColor: CYAN, boxShadow: '0 0 8px rgba(0,229,255,0.5)' })
      })
      return
    }

    /* 1) La línea vertical SE CONSTRUYE con scrub — protagonista de la sección.
          Su borde inferior queda fijado al centro del viewport: la "punta de luz"
          que avanza mientras el usuario scrollea. */
    gsap.fromTo(lineRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top center',
        scrollTrigger: { trigger: timeline, start: 'top center', end: 'bottom center', scrub: true },
      }
    )

    const cleanups: Array<() => void> = []

    phaseEls.forEach(phase => {
      const dot   = phase.querySelector<HTMLElement>('.phase-dot')!
      const name  = phase.querySelector<HTMLElement>('.phase-name')!
      const badge = phase.querySelector<HTMLElement>('.phase-duration')!

      /* 2) Reveal escalonado, sincronizado con el avance del scroll/línea */
      gsap.fromTo(phase,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', immediateRender: false,
          scrollTrigger: { trigger: phase, start: 'top 82%', once: true } }
      )

      /* 3) Glow pulse del dot cuando la punta de la línea lo alcanza (cruza el centro) */
      const st = ScrollTrigger.create({
        trigger: dot,
        start: 'top center',
        onEnter: () => {
          dot.dataset.active = 'true'
          gsap.timeline()
            .to(dot, { scale: 1.9, backgroundColor: CYAN, boxShadow: '0 0 18px rgba(0,229,255,0.85), 0 0 36px rgba(0,229,255,0.4)', duration: 0.3, ease: 'expo.out' })
            .to(dot, { scale: 1, boxShadow: '0 0 8px rgba(0,229,255,0.5)', duration: 0.5, ease: 'power2.out' })
        },
      })
      cleanups.push(() => st.kill())

      /* 5) Hover: dot 2x + glow intenso, título cyan, aparece el badge de duración */
      const onEnter = () => {
        gsap.to(dot,  { scale: 2, backgroundColor: CYAN, boxShadow: '0 0 24px rgba(0,229,255,0.9), 0 0 50px rgba(0,229,255,0.45)', duration: 0.4, ease: 'expo.out' })
        gsap.to(name, { color: CYAN, duration: 0.3 })
        if (!touch) gsap.to(badge, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out' })
      }
      const onLeave = () => {
        const active = dot.dataset.active === 'true'
        gsap.to(dot,  { scale: 1, backgroundColor: active ? CYAN : 'rgba(0,0,0,0)', boxShadow: active ? '0 0 8px rgba(0,229,255,0.5)' : '0 0 0px rgba(0,229,255,0)', duration: 0.4, ease: 'expo.out' })
        gsap.to(name, { color: BONE, duration: 0.3 })
        if (!touch) gsap.to(badge, { opacity: 0, x: -12, duration: 0.3, ease: 'power2.out' })
      }
      phase.addEventListener('mouseenter', onEnter)
      phase.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        phase.removeEventListener('mouseenter', onEnter)
        phase.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach(fn => fn())
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="process"
      data-section="process"
      className="relative py-section overflow-hidden"
      aria-label="Proceso"
    >
      {/* Negro puro (ScrollColorManager) — sin texturas: la línea es el único elemento vivo */}

      <div className="container-site relative z-10 max-w-4xl">
        {/* Header */}
        <div className="mb-20">
          <p className="font-mono text-label uppercase tracking-[0.3em] text-cyan mb-4">
            {t('label')}
          </p>
          <h2 className="font-sans text-display-xl text-bone mb-6">
            {t('headline')}
          </h2>
          <p className="font-mono text-mono-lg text-bone-muted">
            {t('subtitle')}
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="process-timeline relative">
          {/* Línea vertical: track tenue + línea de luz que se construye */}
          <div aria-hidden="true" className="absolute top-0 bottom-0" style={{ left: '24px', width: '1px' }}>
            <div className="absolute inset-0 bg-bone-faint/10" />
            <div
              ref={lineRef}
              className="process-glow-line absolute inset-0 origin-top"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.6) 10%, rgba(0,229,255,0.6) 90%, transparent)',
                boxShadow: '0 0 8px rgba(0,229,255,0.5), 0 0 20px rgba(0,229,255,0.25)',
                transform: 'scaleY(0)',
              }}
            />
          </div>

          {phases.map(phase => (
            <div
              key={phase.num}
              className="process-phase relative grid items-start py-12 cursor-default"
              style={{ gridTemplateColumns: '48px 1fr' }}
            >
              {/* Número gigante decorativo — arquitectura de fondo (opacity 0.03) */}
              <span
                aria-hidden="true"
                className="phase-bignum absolute right-0 top-1/2 -translate-y-1/2 z-0 font-mono font-bold select-none pointer-events-none"
                style={{ fontSize: 'clamp(6rem, 13vw, 12rem)', color: '#FFFFFF', opacity: 0.03, lineHeight: 1 }}
              >
                {phase.num}
              </span>

              {/* Columna del dot — alineada exactamente sobre la línea (centro a 24px) */}
              <div className="relative z-10 flex justify-center pt-1.5">
                <div
                  className="phase-dot w-3 h-3 rounded-full border"
                  style={{ borderColor: CYAN, backgroundColor: 'transparent' }}
                />
              </div>

              {/* Contenido */}
              <div className="relative z-10 pr-2">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="phase-label font-mono text-label uppercase tracking-[0.25em] text-cyan">
                    {phase.num}
                  </span>
                  <span
                    className="phase-duration font-mono text-[11px] uppercase tracking-[0.2em] whitespace-nowrap px-2.5 py-1 border"
                    style={{ color: CYAN, borderColor: 'rgba(0,229,255,0.3)' }}
                  >
                    {phase.duration}
                  </span>
                </div>

                <h3
                  className="phase-name font-sans font-semibold leading-[1.1]"
                  style={{ color: BONE, fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', letterSpacing: '-0.01em' }}
                >
                  {phase.name}
                </h3>

                <p className="phase-desc font-sans text-body-sm text-bone-subtle mt-3 max-w-[46ch] leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes process-line-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(0, 229, 255, 0.35), 0 0 16px rgba(0, 229, 255, 0.15); }
          50%      { box-shadow: 0 0 12px rgba(0, 229, 255, 0.6),  0 0 28px rgba(0, 229, 255, 0.3); }
        }
        .process-glow-line {
          animation: process-line-pulse 3.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .process-glow-line { animation: none !important; }
        }
        /* En dispositivos sin hover, el badge de duración siempre visible */
        @media (hover: none) {
          .phase-duration { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  )
}
