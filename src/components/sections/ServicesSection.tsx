'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, useGSAP, EASE, DURATION, STAGGER, prefersReducedMotion } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

const NUM_IDLE = '#1A1A1A'   // apenas más claro que el fondo #0A0A0A
const CYAN      = '#00E5FF'

export function ServicesSection() {
  const t          = useTranslations('services')
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef    = useRef<HTMLDivElement>(null)

  const services = [
    { num: '01', name: t('s1Name'), desc: t('s1Desc'), price: t('s1Price') },
    { num: '02', name: t('s2Name'), desc: t('s2Desc'), price: t('s2Price') },
    { num: '03', name: t('s3Name'), desc: t('s3Desc'), price: t('s3Price') },
    { num: '04', name: t('s4Name'), desc: t('s4Desc'), price: t('s4Price') },
  ]

  useGSAP(() => {
    const reduced = prefersReducedMotion()
    const grid    = gridRef.current
    if (!grid) return

    /* Las líneas del grid se DIBUJAN en secuencia (scaleX/scaleY 0→1):
       sensación de construcción progresiva al entrar al viewport. */
    const lines = grid.querySelectorAll<HTMLElement>('.gline')
    if (lines.length) {
      if (reduced) {
        gsap.set(lines, { scaleX: 1, scaleY: 1 })
      } else {
        gsap.to(lines, {
          scaleX: 1, scaleY: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
        })
      }
    }

    /* Contenido de las celdas — fade-in sutil, después de que empiezan las líneas */
    const bodies = grid.querySelectorAll<HTMLElement>('.service-body')
    if (bodies.length) {
      if (reduced) {
        gsap.set(bodies, { opacity: 1, y: 0 })
      } else {
        gsap.fromTo(bodies,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: DURATION.slow, ease: EASE.expo, stagger: STAGGER.normal,
            immediateRender: false,
            scrollTrigger: { trigger: grid, start: 'top 72%', once: true } }
        )
      }
    }

    /* Hover por celda: bg tint + frame cyan + radial iluminado + número scale/cyan + link slide */
    const cleanups: Array<() => void> = []
    const cards = grid.querySelectorAll<HTMLElement>('.service-cell')

    cards.forEach(card => {
      const num  = card.querySelector<HTMLElement>('.service-num')!
      const link = card.querySelector<HTMLElement>('.service-link')!

      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width)  * 100}%`)
        card.style.setProperty('--mouse-y', `${((e.clientY - r.top)  / r.height) * 100}%`)
      }
      const onEnter = () => {
        gsap.to(card, {
          backgroundColor: 'rgba(0,229,255,0.02)',
          boxShadow: 'inset 0 0 0 1px rgba(0,229,255,0.45)',
          duration: DURATION.fast, ease: 'power2.out',
        })
        gsap.to(num, { scale: 1.4, color: CYAN, opacity: 0.5, duration: 0.4, ease: EASE.expo })
        gsap.fromTo(link, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: EASE.expo })
      }
      const onLeave = () => {
        gsap.to(card, {
          backgroundColor: 'rgba(0,0,0,0)',
          boxShadow: 'inset 0 0 0 1px rgba(0,229,255,0)',
          duration: DURATION.fast, ease: 'power2.out',
        })
        gsap.to(num, { scale: 1, color: NUM_IDLE, opacity: 1, duration: 0.4, ease: EASE.expo })
        gsap.to(link, { x: -20, opacity: 0, duration: 0.3, ease: EASE.expo })
      }

      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseenter', onEnter)
      card.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseenter', onEnter)
        card.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => { cleanups.forEach(fn => fn()) }
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="services"
      data-section="services"
      className="relative py-section overflow-hidden"
      aria-label="Servicios"
    >
      {/* Grid estructural 60px (#0A0A0A lo setea ScrollColorManager) */}
      <SectionBackground variant="services" />

      <div className="container-site relative z-10">
        {/* Header — sin eyebrow (eyebrow count ya en el máximo de 3/7) */}
        <div className="mb-16">
          <h2 className="font-sans text-display-xl text-bone">
            {t('headline')}
          </h2>
        </div>

        {/* Grid brutalista 2×2 — bordes que se construyen */}
        <div ref={gridRef} className="services-grid relative grid grid-cols-1 sm:grid-cols-2">
          {/* Frame del contenedor: top + left */}
          <span aria-hidden="true" className="gline gline-h" style={{ top: 0, left: 0 }} />
          <span aria-hidden="true" className="gline gline-v" style={{ top: 0, left: 0 }} />

          {services.map(s => (
            <div
              key={s.num}
              className="service-cell relative flex flex-col justify-between min-h-[300px] p-10"
            >
              {/* Líneas propias de la celda: derecha + inferior */}
              <span aria-hidden="true" className="gline gline-v" style={{ top: 0, right: 0 }} />
              <span aria-hidden="true" className="gline gline-h" style={{ bottom: 0, left: 0 }} />

              {/* Número decorativo, arriba a la derecha */}
              <span
                aria-hidden="true"
                className="service-num absolute top-8 right-8 z-10 font-mono font-bold select-none pointer-events-none"
                style={{
                  fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
                  color: NUM_IDLE,
                  lineHeight: 1,
                  transformOrigin: 'top right',
                }}
              >
                {s.num}
              </span>

              {/* Contenido */}
              <div className="service-body relative z-10">
                <h3 className="font-sans font-semibold text-bone text-[28px] tracking-[-0.01em] leading-[1.1] mb-4">
                  {s.name}
                </h3>
                <p className="font-sans text-[15px] text-bone/55 leading-[1.7] max-w-[32ch]">
                  {s.desc}
                </p>
              </div>

              {/* Footer: precio + link que aparece en hover */}
              <div className="service-body relative z-10 mt-8">
                <p className="font-mono text-body-md text-bone-subtle mb-3">
                  {s.price}
                </p>
                <span
                  className="service-link inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-cyan opacity-0"
                  style={{ transform: 'translateX(-20px)' }}
                >
                  → {t('learnMore')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        /* Líneas del grid — se dibujan con scaleX / scaleY */
        .services-grid .gline {
          position: absolute;
          display: block;
          background: rgba(245, 240, 232, 0.08);
          pointer-events: none;
          z-index: 1;
        }
        .services-grid .gline-h {
          width: 100%;
          height: 1px;
          transform: scaleX(0);
          transform-origin: left center;
        }
        .services-grid .gline-v {
          width: 1px;
          height: 100%;
          transform: scaleY(0);
          transform-origin: top center;
        }

        /* Iluminación radial que sigue al mouse (Linear-style) */
        .service-cell::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(0, 229, 255, 0.06) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }
        .service-cell:hover::before { opacity: 1; }

        @media (prefers-reduced-motion: reduce) {
          .services-grid .gline { transform: none !important; }
          .service-cell::before { display: none; }
        }
      `}</style>
    </section>
  )
}
