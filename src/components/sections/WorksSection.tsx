'use client'

import { useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { projects } from '@/data/projects'
import type { Project } from '@/types'
import { ProjectPreview } from './ProjectPreview'
import { ProjectModal } from './ProjectModal'

/* Paletas por capítulo (atmósfera propia) */
const TASKFLOW_BG = '#F0EDE6'  // claro — inversión total del esquema
const AURA_BG     = '#060912'  // azul noche
const OBSIDIAN_BG = '#000000'  // negro absoluto

const VIOLET = '#7C3AED'
const CYAN   = '#00E5FF'
const GREEN  = '#00FF88'

export function WorksSection() {
  const t      = useTranslations('works')
  const locale = useLocale()

  const sectionRef   = useRef<HTMLElement>(null)
  const taskflowRef  = useRef<HTMLDivElement>(null)
  const auraRef      = useRef<HTMLDivElement>(null)
  const obsidianRef  = useRef<HTMLDivElement>(null)
  const lightPaintRef = useRef<HTMLDivElement>(null)

  const [modalIndex,   setModalIndex]   = useState<number | null>(null)
  const [obsidianOpen, setObsidianOpen] = useState(false)

  const [taskflow, aura, obsidian] = projects
  const contentOf = (p: Project) => (locale === 'en' ? p.en : p.es)
  const tfC  = contentOf(taskflow)
  const auC  = contentOf(aura)
  const obC  = contentOf(obsidian)

  useGSAP(() => {
    const reduced = prefersReducedMotion()

    /* TaskFlow — clip-path reveal: el fondo claro se "pinta desde abajo".
       El momento más dramático del sitio (blueprint 4.4). */
    const paint = lightPaintRef.current
    if (paint) {
      if (reduced) {
        gsap.set(paint, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' })
      } else {
        gsap.fromTo(paint,
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'none',
            scrollTrigger: { trigger: taskflowRef.current, start: 'top 100%', end: 'top -10%', scrub: 0.6 },
          }
        )
      }
    }

    /* Reveal de contenido por capítulo (una vez al entrar) */
    const chapters = [taskflowRef.current, auraRef.current, obsidianRef.current]
    chapters.forEach(ch => {
      if (!ch) return
      const items = ch.querySelectorAll<HTMLElement>('[data-reveal]')
      if (!items.length) return
      if (reduced) { gsap.set(items, { opacity: 1, y: 0 }); return }
      gsap.fromTo(items,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: ch, start: 'top 65%', once: true } }
      )
    })

    /* OBSIDIAN — los detalles se revelan al llegar con el scroll (además del hover) */
    if (obsidianRef.current && !reduced) {
      ScrollTrigger.create({
        trigger: obsidianRef.current,
        start: 'top 45%',
        once: true,
        onEnter: () => setObsidianOpen(true),
      })
    } else {
      setObsidianOpen(true)
    }
  }, { scope: sectionRef })

  return (
    <>
      <section
        ref={sectionRef}
        id="work"
        data-section="works"
        className="relative overflow-hidden"
        style={{ isolation: 'isolate', zIndex: 1, position: 'relative' }}
        aria-label="Trabajos"
      >
        {/* ════════════════ CAPÍTULO 01 — TASKFLOW (claro, limpio, productivo) ════════════════ */}
        <div
          ref={taskflowRef}
          className="relative min-h-[100dvh] flex items-center overflow-hidden py-28"
          style={{ color: '#0A0A0A' }}
        >
          {/* Fondo claro que se pinta desde abajo (clip-path scrub) */}
          <div ref={lightPaintRef} className="absolute inset-0" style={{ background: TASKFLOW_BG, zIndex: 0 }} />

          {/* Número decorativo enorme */}
          <span
            aria-hidden="true"
            className="absolute font-mono font-bold select-none pointer-events-none leading-none"
            style={{ color: '#E0DAD0', fontSize: 'clamp(8rem, 18vw, 16rem)', top: '1.5rem', right: '2rem', zIndex: 1 }}
          >
            {taskflow.number}
          </span>

          <div className="container-site relative w-full" style={{ zIndex: 2 }}>
            {/* Header de sección — headline sin eyebrow (eyebrow max 3/7 sections) */}
            <div data-reveal className="mb-14 md:mb-24">
              <h2 className="font-sans font-bold" style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {t('headline')}
              </h2>
            </div>

            {/* Contenido: texto izq · visual der */}
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="order-2 md:order-1">
                <div data-reveal className="mb-6" style={{ height: '2px', width: '3rem', background: VIOLET }} />
                <p data-reveal className="font-mono text-label uppercase tracking-[0.2em] mb-5" style={{ color: VIOLET }}>
                  {tfC.category} · {taskflow.year}
                </p>
                {/* Typography ceiling: max 6rem (96px) */}
                <h3 data-reveal className="font-sans font-bold" style={{ fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
                  {taskflow.name}
                </h3>
                <p data-reveal className="font-sans mt-7 max-w-[44ch]" style={{ color: '#3A3630', fontSize: '18px', lineHeight: 1.7 }}>
                  {tfC.description}
                </p>
                <div data-reveal className="flex flex-wrap gap-2 mt-8">
                  {taskflow.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="font-mono text-mono-sm px-3 py-1.5" style={{ border: '1px solid rgba(10,10,10,0.12)', color: '#0A0A0A' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div data-reveal className="mt-10">
                  <button
                    onClick={() => setModalIndex(0)}
                    className="works-cta font-mono text-label uppercase tracking-widest"
                    style={{ color: VIOLET }}
                  >
                    {t('viewProject')} →
                  </button>
                </div>
              </div>

              <div data-reveal data-cursor="view" data-cursor-label="Ver caso" className="order-1 md:order-2">
                <ProjectPreview project={taskflow} exploreLabel={t('explore')} />
              </div>
            </div>
          </div>
        </div>

        {/* Transición TaskFlow → AURA: la superficie clara se hunde hacia el azul noche */}
        <div aria-hidden="true" style={{ height: '40vh', background: `linear-gradient(to bottom, ${TASKFLOW_BG} 0%, ${AURA_BG} 100%)` }} />

        {/* ════════════════ CAPÍTULO 02 — AURA AI (técnico, futurista) ════════════════ */}
        <div
          ref={auraRef}
          className="relative min-h-[100dvh] flex items-center overflow-hidden py-28"
          style={{ background: AURA_BG, color: CYAN }}
        >
          {/* Número decorativo enorme */}
          <span
            aria-hidden="true"
            className="absolute font-mono font-bold select-none pointer-events-none leading-none"
            style={{ color: 'rgba(0,229,255,0.05)', fontSize: 'clamp(8rem, 18vw, 16rem)', bottom: '1.5rem', right: '2rem', zIndex: 1 }}
          >
            {aura.number}
          </span>

          <div className="container-site relative w-full" style={{ zIndex: 2 }}>
            {/* Contenido: visual izq · texto der */}
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div data-reveal data-cursor="view" data-cursor-label="Ver caso" className="order-1">
                <ProjectPreview project={aura} exploreLabel={t('explore')} />
              </div>

              <div className="order-2">
                <div data-reveal className="mb-6" style={{ height: '2px', width: '3rem', background: CYAN }} />
                <p data-reveal className="font-mono text-label uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(0,229,255,0.6)' }}>
                  {auC.category} · {aura.year}
                </p>
                {/* Typography ceiling: max 6rem (96px) */}
                <h3 data-reveal className="works-aura-name font-sans font-bold" style={{ fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: CYAN }}>
                  {aura.name}
                </h3>
                <p data-reveal className="font-sans mt-7 max-w-[46ch]" style={{ color: 'rgba(245,240,232,0.6)', fontSize: '18px', lineHeight: 1.7 }}>
                  {auC.description}
                </p>
                <div data-reveal className="flex flex-wrap gap-2 mt-8">
                  {aura.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="font-mono text-mono-sm px-3 py-1.5" style={{ border: '1px solid rgba(0,229,255,0.2)', color: '#F5F0E8' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div data-reveal className="mt-10">
                  <button
                    onClick={() => setModalIndex(1)}
                    className="works-cta font-mono text-label uppercase tracking-widest"
                    style={{ color: CYAN }}
                  >
                    {t('viewProject')} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transición AURA → OBSIDIAN */}
        <div aria-hidden="true" style={{ height: '40vh', background: `linear-gradient(to bottom, ${AURA_BG} 0%, ${OBSIDIAN_BG} 100%)` }} />

        {/* ════════════════ CAPÍTULO 03 — OBSIDIAN (oscuro, exclusivo, minimalismo extremo) ════════════════ */}
        <div
          ref={obsidianRef}
          onMouseEnter={() => setObsidianOpen(true)}
          className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center overflow-hidden py-28"
          style={{ background: OBSIDIAN_BG }}
        >
          {/* Número decorativo enorme, centrado detrás del nombre */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
            <span aria-hidden="true" className="font-mono font-bold select-none leading-none" style={{ color: 'rgba(255,255,255,0.025)', fontSize: 'clamp(16rem, 40vw, 40rem)' }}>
              {obsidian.number}
            </span>
          </div>

          <div className="container-site relative" style={{ zIndex: 2 }}>
            {/* Línea de acento verde — crece al abrir */}
            <div
              className="mx-auto mb-8"
              style={{
                height: '1px',
                width: obsidianOpen ? '3rem' : '0px',
                background: GREEN,
                boxShadow: '0 0 10px rgba(0,255,136,0.6)',
                transition: 'width 0.6s ease',
              }}
            />

            {/* Nombre protagonista — enorme, centrado, verde */}
            {/* OBSIDIAN: letter-spacing 0.12em expansivo es la firma de este capítulo.
                  Typography ceiling: max 96px (6rem). */}
            <h3
              data-reveal
              className="works-obsidian-name font-sans font-bold"
              style={{ color: GREEN, fontSize: 'clamp(40px, 8vw, 96px)', lineHeight: 1, letterSpacing: '0.12em' }}
            >
              {obsidian.name}
            </h3>

            {/* Detalles — aparecen al hover / al llegar con el scroll */}
            <div
              className="mt-10"
              style={{
                opacity: obsidianOpen ? 1 : 0,
                transform: obsidianOpen ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              <p className="font-mono text-label uppercase tracking-[0.25em]" style={{ color: GREEN }}>
                {obC.category} · {obsidian.year}
              </p>
              <p className="font-sans mx-auto mt-5 max-w-[45ch]" style={{ color: 'rgba(245,240,232,0.6)', fontSize: '17px', lineHeight: 1.7 }}>
                {obC.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-7">
                {obsidian.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="font-mono text-mono-sm px-3 py-1.5" style={{ border: '1px solid rgba(0,255,136,0.3)', color: '#F5F0E8' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-9">
                <button
                  onClick={() => setModalIndex(2)}
                  className="works-cta font-mono text-label uppercase tracking-widest"
                  style={{ color: GREEN, border: '1px solid rgba(0,255,136,0.4)', padding: '14px 28px' }}
                >
                  {t('viewProject')} →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Glow de los nombres protagonistas */}
        <style jsx global>{`
          .works-aura-name {
            text-shadow:
              0 0 30px rgba(0, 229, 255, 0.8),
              0 0 60px rgba(0, 229, 255, 0.4),
              0 0 120px rgba(0, 229, 255, 0.2);
          }
          .works-obsidian-name {
            text-shadow:
              0 0 40px rgba(0, 255, 136, 0.45),
              0 0 90px rgba(0, 255, 136, 0.18);
          }
          .works-cta {
            position: relative;
            transition: opacity 0.25s ease;
          }
          .works-cta:hover { opacity: 0.7; }
        `}</style>
      </section>

      {/* Modal de detalle — fullscreen, animado, con navegación entre proyectos */}
      <ProjectModal
        project={modalIndex !== null ? projects[modalIndex] : null}
        onClose={() => setModalIndex(null)}
        onPrev ={() => setModalIndex(i => (i !== null && i > 0 ? i - 1 : i))}
        onNext ={() => setModalIndex(i => (i !== null && i < projects.length - 1 ? i + 1 : i))}
        canPrev={modalIndex !== null && modalIndex > 0}
        canNext={modalIndex !== null && modalIndex < projects.length - 1}
      />
    </>
  )
}
