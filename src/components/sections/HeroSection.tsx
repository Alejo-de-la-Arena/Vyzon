'use client'

import { useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { gsap, useGSAP, prefersReducedMotion, isTouchDevice } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

const HEADLINE_FONT = {
  fontSize:      'clamp(44px, 7.5vw, 108px)',
  lineHeight:    '0.95',
  letterSpacing: '-0.03em',
} as const

const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 768

export function HeroSection() {
  const t          = useTranslations('hero')
  const locale     = useLocale()
  const localePath = locale === 'en' ? '/en' : ''

  const containerRef    = useRef<HTMLElement>(null)
  const starsCanvasRef  = useRef<HTMLCanvasElement>(null)
  const cursorRef       = useRef<HTMLSpanElement>(null)
  const headlineMainRef = useRef<HTMLDivElement>(null)
  const glitch1Ref      = useRef<HTMLDivElement>(null)
  const glitch2Ref      = useRef<HTMLDivElement>(null)
  const eyebrowRef      = useRef<HTMLDivElement>(null)
  const line1Ref        = useRef<HTMLHeadingElement>(null)
  const line2Ref        = useRef<HTMLHeadingElement>(null)
  const glowLineRef     = useRef<HTMLDivElement>(null)
  const subtitleRef     = useRef<HTMLParagraphElement>(null)
  const ctaRef          = useRef<HTMLAnchorElement>(null)
  const metaRef         = useRef<HTMLDivElement>(null)

  /**
   * Canvas de micro-estrellas — 110 puntos que se "encienden" con stagger
   * aleatorio entre t=0.2s y t=2.0s y luego titilan de forma individual.
   * Desactivado en mobile y con prefers-reduced-motion (canvas 2D, no Three.js).
   */
  useEffect(() => {
    const canvas = starsCanvasRef.current
    if (!canvas) return

    if (prefersReducedMotion() || isMobileViewport()) {
      canvas.style.display = 'none'
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Star = { x: number; y: number; r: number; opacity: number; base: number }
    const STAR_COUNT = 110
    const tweens: gsap.core.Tween[] = []
    let raf = 0

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random(),
      y:       Math.random(),
      r:       Math.random() * 1 + 0.5,   // 0.5 – 1.5px
      opacity: 0,
      base:    Math.random() * 0.3 + 0.1, // 0.1 – 0.4
    }))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Pausa el rAF cuando el canvas sale del viewport (scroll lejos del hero)
    let visible = true
    const visObs = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    visObs.observe(canvas)

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!visible) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`
        ctx.fill()
      }
    }

    resize()
    draw()

    // Encendido escalonado → luego twinkle infinito por estrella
    for (const s of stars) {
      const intro = gsap.to(s, {
        opacity:  s.base,
        duration: 0.1,
        delay:    0.2 + Math.random() * 1.8,
        onComplete: () => {
          const twinkle = gsap.to(s, {
            opacity:  Math.random() * 0.3 + 0.1,
            duration: 2 + Math.random() * 6,
            ease:     'sine.inOut',
            repeat:   -1,
            yoyo:     true,
          })
          tweens.push(twinkle)
        },
      })
      tweens.push(intro)
    }

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      tweens.forEach((tw) => tw.kill())
      window.removeEventListener('resize', resize)
      visObs.disconnect()
    }
  }, [])

  /**
   * Timeline maestro de apertura — "COMPILACIÓN" (t = 0 → 4.5s).
   * Cursor terminal → glitch del headline → reveal escalonado del resto.
   */
  useGSAP(() => {
    const reduced = prefersReducedMotion()
    const mobile  = isMobileViewport()

    // Degradación: fade simple, sin cursor ni glitch.
    if (reduced || mobile) {
      if (cursorRef.current) cursorRef.current.style.display = 'none'
      gsap.set(glowLineRef.current, { scaleX: 1, transformOrigin: 'left center' })
      gsap.fromTo(
        [
          eyebrowRef.current,
          headlineMainRef.current,
          subtitleRef.current,
          ctaRef.current,
          metaRef.current,
        ],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, delay: 0.2, ease: 'power3.out' }
      )
      return
    }

    // Estados iniciales — todo oculto hasta su momento en el timeline.
    gsap.set(headlineMainRef.current, { opacity: 0 })
    gsap.set([eyebrowRef.current, subtitleRef.current, ctaRef.current, metaRef.current], { opacity: 0 })
    gsap.set(glowLineRef.current, { scaleX: 0, transformOrigin: 'left center' })

    // Glitch: el headline aparece fragmentado en 2 frames y se estabiliza.
    const buildGlitch = () => {
      const g = gsap.timeline()
      g.set(headlineMainRef.current, { opacity: 1, x: -2, y: 1, skewX: 1.5, filter: 'blur(1px)' })
        .set(glitch1Ref.current, { opacity: 0.8, x: -3, y: 0 })
        .set(glitch2Ref.current, { opacity: 0.9, x: 4, y: -2 })
        // Frame 2 — offset distinto (~80ms después)
        .set(glitch1Ref.current, { x: 5 }, '+=0.08')
        .set(glitch2Ref.current, { x: -3, clipPath: 'polygon(0 40%, 100% 40%, 100% 55%, 0 55%)' }, '<')
        // Estabilización
        .to([glitch1Ref.current, glitch2Ref.current], { opacity: 0, duration: 0.15 }, '+=0.06')
        .to(headlineMainRef.current, { x: 0, y: 0, skewX: 0, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out' }, '<')
        // Flash CRT al asentarse
        .to(headlineMainRef.current, { opacity: 0.85, duration: 0.12 }, '<')
        .to(headlineMainRef.current, { opacity: 1, duration: 0.18 })
      return g
    }

    const tl = gsap.timeline()

    // t = 2.2s — el cursor desaparece
    tl.to(cursorRef.current, {
      opacity:  0,
      duration: 0.2,
      onStart: () => { if (cursorRef.current) cursorRef.current.style.animation = 'none' },
    }, 2.2)

    // t = 2.5s — glitch del headline
    tl.add(buildGlitch(), 2.5)

    // t = 3.0s — eyebrow
    tl.fromTo(eyebrowRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 3.0)

    // t = 3.3s — línea glow bajo "ingeniería"
    tl.to(glowLineRef.current, { scaleX: 1, duration: 0.8, ease: 'expo.out' }, 3.3)

    // t = 3.7s — subtítulo (clip-path reveal izquierda → derecha)
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 12, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'expo.out' }, 3.7)

    // t = 4.2s — CTA
    // Emil: no back.out (overshoot/bounce) — power4.out para entrance decisiva
    tl.fromTo(ctaRef.current,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.55, ease: 'power4.out' }, 4.2)

    // t = 4.5s — metadata inferior
    tl.fromTo(metaRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }, 4.5)
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
    const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'expo.out' })

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
      data-section="hero"
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '100svh',
        padding:   '120px 0 80px',
      }}
    >
      {/* Ambient background */}
      <SectionBackground variant="hero" />

      {/* Cosmos — micro-estrellas en canvas 2D */}
      <canvas
        ref={starsCanvasRef}
        aria-hidden="true"
        className="hero-stars-canvas absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Content — usa container-site (mismo padding que el nav) */}
      <div className="container-site relative z-10 w-full">
        <div
          className="hero-content relative flex flex-col items-center text-center md:items-start md:text-left mx-auto md:mx-0"
          style={{
            gap:        'clamp(20px, 3vh, 40px)',
            maxWidth:   '1100px',
          }}
        >
          {/* Cursor terminal — parpadea hasta t=2.2s */}
          <span
            ref={cursorRef}
            aria-hidden="true"
            className="hero-terminal-cursor absolute left-0 -translate-y-1/2 pointer-events-none"
            style={{ top: '50%' }}
          />

          {/* Eyebrow with sonar dot */}
          <div ref={eyebrowRef} className="flex items-center gap-3">
            <span aria-hidden="true" className="relative inline-flex items-center justify-center w-3 h-3 flex-shrink-0">
              <span className="absolute inset-0 rounded-full border border-cyan/50 sonar-ring" />
              <span className="relative inline-block w-2 h-2 rounded-full bg-cyan animate-pulse-dot" />
            </span>
            <span className="font-mono text-label uppercase tracking-[0.3em] text-cyan">
              {t('eyebrow')}
            </span>
          </div>

          {/* Headline — 3 capas: principal + 2 clones de glitch */}
          <div className="hero-headline relative">
            {/* Capa principal */}
            <div ref={headlineMainRef} className="hero-headline-layer">
              <h1
                ref={line1Ref}
                className="font-sans font-bold text-bone"
                style={HEADLINE_FONT}
              >
                {t('tagline1')}
              </h1>
              <div className="relative inline-block">
                <h1
                  ref={line2Ref}
                  className="font-sans font-bold italic text-cyan hero-headline-line2"
                  style={HEADLINE_FONT}
                >
                  {t('tagline2')}
                </h1>
                {/* Línea glow bajo "ingeniería." */}
                <div ref={glowLineRef} aria-hidden="true" className="hero-glow-line" />
              </div>
            </div>

            {/* Clon 1 — aberración cromática cyan */}
            <div ref={glitch1Ref} aria-hidden="true" className="hero-headline-layer hero-glitch hero-glitch--1">
              <h1 className="font-sans font-bold" style={HEADLINE_FONT}>{t('tagline1')}</h1>
              <h1 className="font-sans font-bold italic" style={HEADLINE_FONT}>{t('tagline2')}</h1>
            </div>

            {/* Clon 2 — offset bone */}
            <div ref={glitch2Ref} aria-hidden="true" className="hero-headline-layer hero-glitch hero-glitch--2">
              <h1 className="font-sans font-bold" style={HEADLINE_FONT}>{t('tagline1')}</h1>
              <h1 className="font-sans font-bold italic" style={HEADLINE_FONT}>{t('tagline2')}</h1>
            </div>
          </div>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="font-sans text-bone/60"
            style={{
              fontSize:  'clamp(15px, 1.3vw, 19px)',
              lineHeight: 1.55,
              maxWidth:  '540px',
            }}
          >
            {t('description')}
          </p>

          {/* CTA */}
          <a
            ref={ctaRef}
            href={`${localePath}/#briefing`}
            data-cursor="cta"
            data-cursor-label="Click"
            className="
              cta-fill inline-flex items-center justify-center gap-2
              font-mono text-label uppercase tracking-widest
              px-8 py-4 border border-cyan text-cyan relative overflow-hidden
              w-full max-w-[320px] md:w-auto md:max-w-none
            "
          >
            <span className="relative z-10">{t('cta')} →</span>
          </a>
        </div>
      </div>

      {/* Minimal scroll indicator — purely visual, no text (scroll cues banned).
          A single 32px cyan line that pulses once then holds. */}
      <div
        ref={metaRef}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 pointer-events-none"
      >
        <div className="w-px h-8 bg-gradient-to-b from-cyan/60 to-transparent animate-scroll-hint" />
      </div>

      {/* Tablet headline cap + sonar + cta fill + cursor + glitch */}
      <style jsx>{`
        @media (min-width: 768px) and (max-width: 1024px) {
          :global(.hero-headline h1) {
            font-size: clamp(44px, 6.5vw, 72px) !important;
          }
        }

        /* Cursor terminal I-beam */
        :global(.hero-terminal-cursor) {
          width: 14px;
          height: clamp(44px, 7.5vw, 96px);
          background: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.6);
          animation: cursor-blink 1s step-end infinite;
        }
        @keyframes cursor-blink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        /* Glow text de la segunda línea — emite luz propia */
        :global(.hero-headline-line2) {
          text-shadow:
            0 0 40px rgba(0, 229, 255, 0.4),
            0 0 80px rgba(0, 229, 255, 0.15);
        }

        /* Línea glow bajo "ingeniería." */
        :global(.hero-glow-line) {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
          transform: scaleX(0);
          transform-origin: left center;
        }

        /* Clones del glitch — ocultos por defecto */
        :global(.hero-glitch) {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
        }
        :global(.hero-glitch--1) {
          color: #00e5ff;
          mix-blend-mode: screen;
          clip-path: polygon(0 20%, 100% 20%, 100% 45%, 0 45%);
        }
        :global(.hero-glitch--2) {
          color: #f5f0e8;
          filter: blur(0.5px);
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        }

        @keyframes sonar {
          0%   { transform: scale(0.9); opacity: 0.6; }
          80%  { transform: scale(2.3); opacity: 0;   }
          100% { transform: scale(2.3); opacity: 0;   }
        }
        :global(.sonar-ring) { animation: sonar 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite; }

        @media (prefers-reduced-motion: reduce) {
          :global(.sonar-ring) { animation: none; }
          :global(.hero-terminal-cursor) { display: none; }
          :global(.hero-stars-canvas) { display: none; }
          :global(.hero-glitch) { display: none; }
        }

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
