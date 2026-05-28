'use client'

import { useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import SplitType from 'split-type'
import { gsap, useGSAP, EASE, DURATION, STAGGER, prefersReducedMotion, isTouchDevice } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

export function HeroSection() {
  const t          = useTranslations('hero')
  const locale     = useLocale()
  const localePath = locale === 'en' ? '/en' : ''

  const containerRef    = useRef<HTMLElement>(null)
  const eyebrowRef      = useRef<HTMLDivElement>(null)
  const line1Ref        = useRef<HTMLHeadingElement>(null)
  const line2Ref        = useRef<HTMLHeadingElement>(null)
  const subtitleRef     = useRef<HTMLParagraphElement>(null)
  const ctaRef          = useRef<HTMLAnchorElement>(null)
  const metaLeftRef     = useRef<HTMLDivElement>(null)
  const metaRightRef    = useRef<HTMLDivElement>(null)
  const scrollHintRef   = useRef<HTMLDivElement>(null)

  // Entrance
  useGSAP(() => {
    const reduced = prefersReducedMotion()

    if (reduced) {
      gsap.from(
        [eyebrowRef.current, line1Ref.current, line2Ref.current, subtitleRef.current, ctaRef.current, metaLeftRef.current, metaRightRef.current, scrollHintRef.current],
        { opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.2 }
      )
      return
    }

    const split1 = new SplitType(line1Ref.current!, { types: 'chars' })
    const split2 = new SplitType(line2Ref.current!, { types: 'chars' })

    const tl = gsap.timeline({ delay: 0.15 })

    tl.from(eyebrowRef.current, { opacity: 0, y: -20, duration: DURATION.mid, ease: EASE.expo })
      .from(split1.chars, { opacity: 0, y: 60, duration: DURATION.slower, stagger: STAGGER.tight, ease: EASE.power3 }, '-=0.3')
      .from(split2.chars, { opacity: 0, y: 60, duration: DURATION.slower, stagger: STAGGER.tight, ease: EASE.power3 }, '-=1.0')
      .from(subtitleRef.current,  { opacity: 0, y: 20, duration: DURATION.slow, ease: EASE.expo }, '-=0.5')
      .from(ctaRef.current,       { opacity: 0, scale: 0.88, duration: DURATION.mid, ease: EASE.back }, '-=0.4')
      .from(
        [metaLeftRef.current, metaRightRef.current, scrollHintRef.current],
        { opacity: 0, y: 12, duration: DURATION.mid, stagger: 0.08, ease: EASE.expo },
        '-=0.3'
      )

    return () => {
      split1.revert()
      split2.revert()
    }
  }, { scope: containerRef })

  // Magnetic CTA
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return
    const btn = ctaRef.current
    if (!btn) return

    const MAGNETIC_RADIUS = 80
    const MAX_X = 12
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
      ref={containerRef}
      className="relative bg-black overflow-hidden flex flex-col"
      style={{
        minHeight: '100svh',
        paddingTop:    'clamp(72px, 9vh, 100px)',
        paddingBottom: 'clamp(24px, 4vh, 48px)',
      }}
    >
      {/* Ambient background */}
      <SectionBackground variant="hero" />

      {/* Main content — uses container-site so it aligns with nav */}
      <div className="container-site relative z-10 flex-1 flex flex-col items-center text-center md:items-start md:text-left">
        {/* Eyebrow with sonar dot */}
        <div ref={eyebrowRef} className="hero-eyebrow flex items-center gap-3">
          <span aria-hidden="true" className="relative inline-flex items-center justify-center w-3 h-3 flex-shrink-0">
            <span className="absolute inset-0 rounded-full border border-cyan/50 sonar-ring" />
            <span className="relative inline-block w-2 h-2 rounded-full bg-cyan animate-pulse-dot" />
          </span>
          <span className="font-mono text-label uppercase tracking-[0.3em] text-cyan">
            {t('eyebrow')}
          </span>
        </div>

        {/* Headline */}
        <div className="hero-headline">
          <div className="overflow-hidden">
            <h1
              ref={line1Ref}
              className="font-sans font-bold text-bone"
              style={{
                fontSize: 'clamp(44px, 7.5vw, 108px)',
                lineHeight: '0.95',
                letterSpacing: '-0.03em',
              }}
            >
              {t('tagline1')}
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1
              ref={line2Ref}
              className="font-sans font-bold italic text-cyan"
              style={{
                fontSize: 'clamp(44px, 7.5vw, 108px)',
                lineHeight: '0.95',
                letterSpacing: '-0.03em',
              }}
            >
              {t('tagline2')}
            </h1>
          </div>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="hero-subtitle font-sans text-bone/60 mx-auto md:mx-0"
          style={{
            fontSize: 'clamp(15px, 1.3vw, 19px)',
            lineHeight: 1.55,
            maxWidth: '540px',
          }}
        >
          {t('description')}
        </p>

        {/* CTA */}
        <a
          ref={ctaRef}
          href={`${localePath}/#briefing`}
          data-cursor="cta"
          className="
            cta-fill hero-cta inline-flex items-center justify-center gap-2
            font-mono text-label uppercase tracking-widest
            px-8 py-4
            border border-cyan text-cyan
            relative overflow-hidden
            w-full max-w-[320px] md:w-auto md:max-w-none
          "
        >
          <span className="relative z-10">{t('cta')} →</span>
        </a>
      </div>

      {/* Bottom meta — container-site for nav alignment */}
      <div className="container-site relative z-10 grid grid-cols-3 items-end pt-6">
        {/* Left meta (hidden on mobile) */}
        <div
          ref={metaLeftRef}
          className="hidden md:block font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint leading-relaxed"
        >
          <p>{t('locationLine1')}</p>
          <p>{t('locationLine2')}</p>
        </div>

        {/* Scroll indicator — always centered */}
        <div
          ref={scrollHintRef}
          className="flex flex-col items-center gap-2 justify-self-center col-start-1 col-span-3 md:col-start-2 md:col-span-1"
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-subtle"
            style={{ writingMode: 'vertical-rl' }}
          >
            {t('scrollLabel')}
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-cyan to-transparent animate-scroll-hint" />
        </div>

        {/* Right meta (hidden on mobile) */}
        <div
          ref={metaRightRef}
          className="hidden md:block font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint text-right justify-self-end"
        >
          <p>MMXXVI</p>
          <p>{t('studio')}</p>
        </div>
      </div>

      {/* Responsive spacing + sonar + cta fill */}
      <style jsx>{`
        /* Tablet base spacing (640px+) — 70% of desktop */
        .hero-headline   { margin-top: 24px; }
        .hero-subtitle   { margin-top: 28px; }
        .hero-cta        { margin-top: 28px; }
        @media (min-width: 768px) {
          .hero-headline { margin-top: clamp(22px, 2.2vh, 32px); }
          .hero-subtitle { margin-top: clamp(28px, 2.8vh, 40px); }
          .hero-cta      { margin-top: clamp(28px, 2.8vh, 40px); }
        }
        /* Tablet-specific headline cap */
        @media (min-width: 768px) and (max-width: 1024px) {
          :global(.hero-headline h1) {
            font-size: clamp(44px, 6.5vw, 72px) !important;
          }
        }

        /* Sonar ring */
        @keyframes sonar {
          0%   { transform: scale(0.9); opacity: 0.6; }
          80%  { transform: scale(2.3); opacity: 0;   }
          100% { transform: scale(2.3); opacity: 0;   }
        }
        :global(.sonar-ring) { animation: sonar 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          :global(.sonar-ring) { animation: none; }
        }

        /* CTA fill on hover */
        :global(.cta-fill::before) {
          content: '';
          position: absolute;
          inset: 0;
          background: #00E5FF;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.45s cubic-bezier(0.76, 0, 0.24, 1);
          z-index: 0;
        }
        :global(.cta-fill:hover::before) { transform: scaleX(1); }
        :global(.cta-fill) { transition: color 0.3s cubic-bezier(0.76, 0, 0.24, 1); }
        :global(.cta-fill:hover) { color: #000; }
      `}</style>
    </section>
  )
}
