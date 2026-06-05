'use client'

import { useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, useGSAP, EASE, DURATION, prefersReducedMotion, isTouchDevice } from '@/lib/gsap'

const EMAIL = 'hola@vyzon.dev'

/* ─────────────── Vórtice de partículas — 60 puntos cyan orbitando ───────────────
 * Radio creciente (flujo hacia afuera) + rotación suave (más rápida al centro).
 * Canvas 2D, detrás del texto. Desactivado con prefers-reduced-motion.
 */
function CierreVortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (prefersReducedMotion()) { canvas.style.display = 'none'; return }
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr  = Math.min(window.devicePixelRatio || 1, 2)
    const rMin = 24
    let w = 0, h = 0, cx = 0, cy = 0, rMax = 0
    let raf = 0

    interface P { angle: number; radius: number; speed: number; growth: number; size: number; opacity: number }
    const COUNT = 60

    const make = (): P => ({
      angle:   Math.random() * Math.PI * 2,
      radius:  rMin,
      speed:   0.0006 + Math.random() * 0.0010,   // velocidad angular (rad/frame)
      growth:  0.06   + Math.random() * 0.14,     // crecimiento de radio (px/frame)
      size:    0.8    + Math.random() * 1.6,
      opacity: 0.1    + Math.random() * 0.2,       // 0.1 – 0.3
    })

    let particles: P[] = []

    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight
      cx = w / 2; cy = h / 2
      rMax = Math.hypot(w, h) / 2
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    particles = Array.from({ length: COUNT }, () => {
      const p = make()
      p.radius = rMin + Math.random() * (rMax - rMin)  // campo lleno desde el inicio
      return p
    })

    // Pausa el rAF cuando el usuario no ha llegado aún al cierre
    let visible = true
    const visObs = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    visObs.observe(canvas)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        const tnorm = (p.radius - rMin) / (rMax - rMin)
        p.angle  += p.speed * (1 + (1 - tnorm) * 1.2)   // más veloz cerca del centro
        p.radius += p.growth
        if (p.radius > rMax) { p.radius = rMin; p.angle = Math.random() * Math.PI * 2 }

        let fade = 1
        if (tnorm < 0.06)      fade = tnorm / 0.06
        else if (tnorm > 0.7)  fade = Math.max(0, (1 - tnorm) / 0.3)

        const x = cx + Math.cos(p.angle) * p.radius
        const y = cy + Math.sin(p.angle) * p.radius
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity * fade})`
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      visObs.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

export function CierreSection() {
  const t          = useTranslations('closing')
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef     = useRef<HTMLAnchorElement>(null)

  /* Entrada — materialización (opacity 0 + scale 0.97→1); "Se construye." después */
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const section = sectionRef.current!

    gsap.set('.cierre-line2', { opacity: 0 }) // evita flash durante la materialización

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 72%', once: true },
    })

    tl.fromTo('.cierre-headline', { scale: 0.97 },          { scale: 1,            duration: DURATION.slow, ease: EASE.expo,    immediateRender: false })
      .fromTo('.cierre-line1',    { opacity: 0, y: 24 },     { opacity: 1, y: 0,    duration: DURATION.slow, ease: EASE.expo,    immediateRender: false }, '<')
      // "Se construye." — la conclusión inevitable, tras un beat
      .fromTo('.cierre-line2',    { opacity: 0, y: 22, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: DURATION.slow, ease: 'power4.out', immediateRender: false }, '+=0.3')
      // Emil: no back.out (bounce) — power4.out para entrance decisiva sin overshoot
      .fromTo('.cierre-cta',      { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: DURATION.mid, ease: 'power4.out', immediateRender: false }, '-=0.15')
      .fromTo('.cierre-email',    { opacity: 0 },            { opacity: 0.4,        duration: DURATION.mid,  ease: 'power2.out', immediateRender: false }, '-=0.2')
  }, { scope: sectionRef })

  /* Magnetic CTA */
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return
    const btn = ctaRef.current
    if (!btn) return

    const MAGNETIC_RADIUS = 90
    const MAX_X = 16
    const MAX_Y = 10

    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MAGNETIC_RADIUS) {
        const s = 1 - dist / MAGNETIC_RADIUS
        gsap.to(btn, { x: dx * s * (MAX_X / rect.width * 2), y: dy * s * (MAX_Y / rect.height * 2), duration: 0.3, ease: 'power2.out' })
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
      data-section="cierre"
      className="relative overflow-hidden min-h-[100dvh] flex items-center"
      aria-label="Contacto"
    >
      {/* Glow radial central — el único elemento decorativo (la pantalla "respira") */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(600px circle at 50% 50%, rgba(0,229,255,0.05), transparent 60%)', zIndex: 0 }}
      />

      {/* Vórtice de partículas — detrás del texto */}
      <CierreVortex />

      <div className="container-site relative z-10 flex flex-col items-center text-center w-full">
        {/* Headline — tipografía como arquitectura, máximo espacio */}
        {/* Headline — capped at 6rem (96px) per typography ceiling rule.
            At 96px it still dominates the viewport; 160px was overshooting. */}
        <div className="cierre-headline" style={{ willChange: 'transform' }}>
          <h2
            className="cierre-line1 font-sans font-bold text-bone"
            style={{ fontSize: 'clamp(36px, 8vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
          >
            {t('line1')}
          </h2>
          <p
            className="cierre-line2 font-sans font-semibold italic text-cyan mt-2 md:mt-3"
            style={{
              fontSize: 'clamp(36px, 8vw, 96px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textShadow: '0 0 50px rgba(0,229,255,0.35), 0 0 100px rgba(0,229,255,0.15)',
            }}
          >
            {t('line2')}
          </p>
        </div>

        {/* CTA — fill cyan izquierda→derecha al hover, generoso */}
        <a
          ref={ctaRef}
          href={`mailto:${EMAIL}`}
          data-cursor="cta"
          data-cursor-label="Hablemos"
          className="cierre-cta cierre-cta-fill relative inline-flex items-center overflow-hidden font-mono uppercase tracking-[0.25em] text-[13px] text-bone border border-cyan/70 px-14 py-7 mt-20 md:mt-28"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="relative z-10">{t('cta')} →</span>
        </a>

        {/* Email — mono pequeño, opacity 0.4, underline animado al hover */}
        <a
          href={`mailto:${EMAIL}`}
          className="cierre-email relative font-mono text-[12px] tracking-[0.15em] text-bone mt-8"
          style={{ opacity: 0.4 }}
        >
          {EMAIL}
        </a>
      </div>

      <style jsx global>{`
        /* CTA — fill cyan izquierda→derecha */
        .cierre-cta-fill {
          transition: color 0.4s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .cierre-cta-fill::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #00e5ff;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.45s cubic-bezier(0.76, 0, 0.24, 1);
          z-index: 0;
        }
        .cierre-cta-fill:hover::before { transform: scaleX(1); }
        .cierre-cta-fill:hover { color: #000; }

        /* Email — underline animado */
        .cierre-email::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 100%;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.35s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .cierre-email:hover::after { transform: scaleX(1); }
        .cierre-email:hover { opacity: 0.85 !important; }
      `}</style>
    </section>
  )
}
