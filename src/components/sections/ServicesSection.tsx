'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, useGSAP, EASE, DURATION, STAGGER, prefersReducedMotion } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

export function ServicesSection() {
  const t          = useTranslations('services')
  const sectionRef = useRef<HTMLElement>(null)

  const services = [
    { num: '01', name: t('s1Name'), desc: t('s1Desc'), price: t('s1Price') },
    { num: '02', name: t('s2Name'), desc: t('s2Desc'), price: t('s2Price') },
    { num: '03', name: t('s3Name'), desc: t('s3Desc'), price: t('s3Price') },
    { num: '04', name: t('s4Name'), desc: t('s4Desc'), price: t('s4Price') },
  ]

  useGSAP(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>('.service-card')
    if (!cards) return

    if (!prefersReducedMotion()) {
      gsap.fromTo(Array.from(cards),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: DURATION.slow,
          stagger: STAGGER.normal,
          ease: EASE.expo,
          immediateRender: false,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )
    }

    Array.from(cards).forEach(card => {
      const num  = card.querySelector<HTMLElement>('.service-num')!
      const link = card.querySelector<HTMLElement>('.service-link')!

      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          borderColor: '#00E5FF',
          backgroundColor: 'rgba(0,229,255,0.03)',
          duration: DURATION.fast,
          ease: 'power2.out',
        })
        gsap.to(num, {
          scale: 1.5,
          color: '#00E5FF',
          opacity: 0.55,
          duration: 0.4,
          ease: EASE.expo,
        })
        gsap.fromTo(link,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: EASE.expo }
        )
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          borderColor: '#4A4844',
          backgroundColor: 'transparent',
          duration: DURATION.fast,
          ease: 'power2.out',
        })
        gsap.to(num, {
          scale: 1,
          color: '#4A4844',
          opacity: 0.2,
          duration: 0.4,
          ease: EASE.expo,
        })
        gsap.to(link, { x: -20, opacity: 0, duration: 0.3, ease: EASE.expo })
      })
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-section overflow-hidden"
      style={{ background: '#060606' }}
      aria-label="Servicios"
    >
      {/* Drawn-in grid background */}
      <SectionBackground variant="services" />

      <div className="container-site relative z-10">
        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-label uppercase tracking-[0.3em] text-cyan mb-4">
            {t('label')}
          </p>
          <h2 className="font-sans text-display-xl text-bone">
            {t('headline')}
          </h2>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-bone-faint/[0.08]">
          {services.map(s => (
            <div
              key={s.num}
              className="service-card relative flex flex-col justify-between min-h-[300px] p-10 border-r border-b transition-colors duration-250"
              style={{ borderColor: '#4A4844' }}
            >
              {/* Decorative number, top-right */}
              <span
                aria-hidden="true"
                className="service-num absolute top-8 right-8 font-mono font-bold select-none pointer-events-none origin-top-right"
                style={{
                  fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
                  opacity: 0.2,
                  color: '#4A4844',
                  lineHeight: 1,
                }}
              >
                {s.num}
              </span>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-sans font-semibold text-bone text-[28px] tracking-[-0.01em] leading-[1.1] mb-4">
                  {s.name}
                </h3>
                <p className="font-sans text-[15px] text-bone/55 leading-[1.7] max-w-[32ch]">
                  {s.desc}
                </p>
              </div>

              {/* Footer: price + slide-in link */}
              <div className="relative z-10 mt-8">
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
    </section>
  )
}
