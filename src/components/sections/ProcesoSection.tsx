'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

export function ProcesoSection() {
  const t               = useTranslations('process')
  const sectionRef      = useRef<HTMLElement>(null)
  const verticalLineRef = useRef<HTMLDivElement>(null)
  const horizLineRef    = useRef<HTMLDivElement>(null)

  const phases = t.raw('phases') as Array<{
    num: string; name: string; desc: string; duration: string
  }>

  useGSAP(() => {
    const reduced = prefersReducedMotion()
    const section = sectionRef.current!
    const phaseEls = Array.from(section.querySelectorAll<HTMLElement>('.process-phase'))

    if (reduced) {
      gsap.fromTo(phaseEls,
        { opacity: 0 },
        { opacity: 1, stagger: 0.1, immediateRender: false,
          scrollTrigger: { trigger: section, start: 'top 70%', once: true } }
      )
      return
    }

    // 1) Top horizontal progress line — scrub
    if (horizLineRef.current) {
      gsap.fromTo(horizLineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end:   'bottom 40%',
            scrub: 2,
          },
        }
      )
    }

    // 2) Vertical connector line — draws scaleY 0→1 with scrub
    if (verticalLineRef.current) {
      gsap.fromTo(verticalLineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end:   'bottom 30%',
            scrub: true,
          },
        }
      )
    }

    // 3) Each phase: entrance + hover dot scale 2x + glow pulse
    phaseEls.forEach(phase => {
      const dot   = phase.querySelector<HTMLElement>('.phase-dot')!
      const title = phase.querySelector<HTMLElement>('.phase-name')!

      gsap.fromTo(phase,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', immediateRender: false,
          scrollTrigger: { trigger: phase, start: 'top 85%', once: true },
        }
      )

      phase.addEventListener('mouseenter', () => {
        gsap.to(dot,   { scale: 2, backgroundColor: '#00E5FF', boxShadow: '0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.3)', duration: 0.4, ease: 'expo.out' })
        gsap.to(title, { color: '#00E5FF', duration: 0.3 })
      })
      phase.addEventListener('mouseleave', () => {
        gsap.to(dot,   { scale: 1, backgroundColor: 'transparent', boxShadow: '0 0 0px rgba(0,229,255,0)', duration: 0.4, ease: 'expo.out' })
        gsap.to(title, { color: '#F5F0E8', duration: 0.3 })
      })
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative bg-black py-section overflow-hidden"
      aria-label="Proceso"
    >
      {/* Grain ambient */}
      <SectionBackground variant="process" />

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

        {/* Top horizontal progress */}
        <div className="relative mb-4 h-px">
          <div className="absolute inset-0 bg-bone-faint/20" />
          <div
            ref={horizLineRef}
            aria-hidden="true"
            className="absolute inset-0 bg-cyan origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {/* Phases */}
        <div className="relative">
          {/* Vertical connector with scrub-drawn line + glow pulse */}
          <div
            aria-hidden="true"
            className="absolute left-[5%] top-0 bottom-0 w-px overflow-hidden"
          >
            <div className="absolute inset-0 bg-bone-faint/10" />
            <div
              ref={verticalLineRef}
              className="absolute inset-0 origin-top process-glow-line"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.5) 20%, rgba(0,229,255,0.5) 80%, transparent)',
                transform: 'scaleY(0)',
              }}
            />
          </div>

          {phases.map((phase) => (
            <div
              key={phase.num}
              className="process-phase grid gap-6 py-12 border-b border-bone-faint/[0.06] last:border-b-0 cursor-default"
              style={{ gridTemplateColumns: '10% 64px 1fr 80px' }}
            >
              {/* Dot */}
              <div className="flex justify-center items-center">
                <div className="phase-dot w-3 h-3 rounded-full border-2 border-cyan bg-transparent transition-all" />
              </div>

              {/* Number */}
              <p className="phase-num font-mono text-label font-medium text-cyan self-center">
                {phase.num}
              </p>

              {/* Name + desc */}
              <div>
                <h3 className="phase-name font-sans font-semibold text-[1.5rem] text-bone mb-2 transition-colors">
                  {phase.name}
                </h3>
                <p className="phase-desc font-sans text-body-sm text-bone-subtle">
                  {phase.desc}
                </p>
              </div>

              {/* Duration */}
              <p className="font-mono text-mono-sm text-bone-faint text-right self-center tracking-[0.15em] uppercase">
                {phase.duration}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Local CSS */}
      <style jsx>{`
        @keyframes process-line-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(0,229,255,0.25), 0 0 12px rgba(0,229,255,0.1); }
          50%      { box-shadow: 0 0 12px rgba(0,229,255,0.5), 0 0 24px rgba(0,229,255,0.2); }
        }
        :global(.process-glow-line) {
          animation: process-line-pulse 3.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.process-glow-line) { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
