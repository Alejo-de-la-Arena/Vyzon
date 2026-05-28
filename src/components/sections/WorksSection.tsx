'use client'

import { useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { projects } from '@/data/projects'
import type { Project } from '@/types'
import { SectionBackground } from './SectionBackground'
import { ProjectPreview } from './ProjectPreview'
import { ProjectModal } from './ProjectModal'

export function WorksSection() {
  const t      = useTranslations('works')
  const locale = useLocale()

  const outerRef     = useRef<HTMLDivElement>(null)
  const stickyRef    = useRef<HTMLDivElement>(null)
  const trackRef     = useRef<HTMLDivElement>(null)
  const progressRefs = useRef<(HTMLDivElement | null)[]>([])

  const [activeIndex, setActiveIndex] = useState(0)
  const [modalIndex,  setModalIndex]  = useState<number | null>(null)

  // Horizontal scroll-pin (desktop only).
  useGSAP(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(min-width: 768px)').matches) return

    const outer  = outerRef.current!
    const sticky = stickyRef.current!
    const track  = trackRef.current!
    const reduced = prefersReducedMotion()

    const panels = projects.length
    if (reduced) return

    // Use onUpdate + manual x set so we can compute end precisely.
    const tween = gsap.to({}, {
      // dummy tween that the ScrollTrigger drives
      duration: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: outer,
        start:   'top top',
        // (panels - 1) full viewports of horizontal travel + 0.5 extra
        // for the last panel to breathe before vertical scroll resumes
        end: () => `+=${(panels - 1) * window.innerWidth + window.innerWidth * 0.5}`,
        pin: sticky,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const maxX = Math.max(0, track.scrollWidth - window.innerWidth)
          const x    = -(self.progress * maxX)
          gsap.set(track, { x })

          // Active index: based on which panel is most in view
          const idx = Math.min(panels - 1, Math.max(0, Math.round(self.progress * panels)))
          setActiveIndex(idx)

          // Progress dots fill linearly with progress
          progressRefs.current.forEach((el, i) => {
            if (!el) return
            const segment = 1 / panels
            const local   = Math.min(1, Math.max(0, (self.progress - i * segment) / segment))
            el.style.transform = `scaleX(${local})`
          })
        },
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, { scope: outerRef })

  return (
    <>
      <section
        id="work"
        className="relative bg-black overflow-hidden"
        aria-label="Trabajos"
      >
        {/* Ambient tint */}
        <SectionBackground variant="works" activeIndex={activeIndex} />

        {/* DESKTOP: header + horizontal pin */}
        <div className="hidden md:block">
          {/* Header — separated from horizontal scroll, same padding as nav */}
          <div className="container-site relative z-10 pt-section" style={{ paddingBottom: '80px' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-label uppercase tracking-[0.3em] text-cyan">
                {t('label')}
              </span>
              <span className="font-mono text-label text-bone-faint">— {t('count')}</span>
            </div>
            <h2 className="font-sans text-display-xl text-bone max-w-[800px]">
              {t('headline')}
            </h2>
          </div>

          {/* Outer container — gives the pinned region scroll room */}
          <div ref={outerRef} className="relative" style={{ height: `${projects.length * 100}vh` }}>
            <div
              ref={stickyRef}
              className="sticky top-0 h-screen w-screen overflow-hidden"
            >
              {/* Horizontal track */}
              <div
                ref={trackRef}
                className="flex h-full will-change-transform"
                style={{ width: `${projects.length * 100}vw` }}
              >
                {projects.map((p, i) => (
                  <DesktopPanel
                    key={p.id}
                    project={p}
                    index={i}
                    total={projects.length}
                    locale={locale}
                    viewLabel={t('viewProject')}
                    visitLabel={t('visitSite')}
                    exploreLabel={t('explore')}
                    onOpen={() => setModalIndex(i)}
                  />
                ))}
              </div>

              {/* Progress dots */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3 pointer-events-none">
                {projects.map((_, i) => (
                  <div key={i} className="w-12 h-px bg-bone-faint/30 overflow-hidden">
                    <div
                      ref={el => { progressRefs.current[i] = el }}
                      className="w-full h-full bg-cyan origin-left"
                      style={{ transform: `scaleX(${i === 0 ? 0.05 : 0})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE: vertical stack */}
        <div className="md:hidden container-site py-section relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-label uppercase tracking-[0.3em] text-cyan">
                {t('label')}
              </span>
              <span className="font-mono text-label text-bone-faint">— {t('count')}</span>
            </div>
            <h2 className="font-sans text-display-xl text-bone">
              {t('headline')}
            </h2>
          </div>

          <div className="space-y-16">
            {projects.map((p, i) => (
              <MobileCard
                key={p.id}
                project={p}
                index={i}
                total={projects.length}
                locale={locale}
                viewLabel={t('viewProject')}
                visitLabel={t('visitSite')}
                exploreLabel={t('explore')}
                onOpen={() => setModalIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
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

/* ───────────────────── DESKTOP PANEL ─────────────────────────── */

interface PanelProps {
  project:      Project
  index:        number
  total:        number
  locale:       string
  viewLabel:    string
  visitLabel:   string
  exploreLabel: string
  onOpen:       () => void
}

function DesktopPanel({ project, index, total, locale, viewLabel, visitLabel, exploreLabel, onOpen }: PanelProps) {
  const content = locale === 'en' ? project.en : project.es

  return (
    <article className="w-screen h-full flex-shrink-0 flex items-center px-[var(--space-container)]">
      <div className="grid grid-cols-[60%_40%] gap-12 w-full items-center">
        {/* LEFT — Interactive preview */}
        <div data-cursor="view">
          <ProjectPreview project={project} exploreLabel={exploreLabel} />
        </div>

        {/* RIGHT — Info */}
        <div className="relative">
          {/* Decorative giant number */}
          <span
            aria-hidden="true"
            className="absolute -top-12 right-0 font-sans font-bold text-bone select-none pointer-events-none"
            style={{ fontSize: '180px', opacity: 0.04, lineHeight: 1, letterSpacing: '-0.05em' }}
          >
            {project.number}
          </span>

          <div className="relative">
            <h3
              className="font-sans font-bold text-bone"
              style={{ fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.03em' }}
            >
              {project.name}
            </h3>

            <p className="font-mono text-label uppercase tracking-[0.2em] mt-4" style={{ color: project.accentColor }}>
              {content.category}
            </p>

            <p
              className="font-sans text-bone/70 mt-8 max-w-[42ch]"
              style={{ fontSize: '18px', lineHeight: 1.7 }}
            >
              {content.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-8">
              {project.tags.slice(0, 6).map(tag => (
                <span
                  key={tag}
                  className="font-mono text-mono-sm text-bone-subtle border border-bone-faint/20 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-8 mt-10">
              <button
                onClick={onOpen}
                className="link-animated font-mono text-label uppercase tracking-widest text-cyan hover:text-cyan/80 transition-colors duration-250"
              >
                {viewLabel} →
              </button>
              {project.siteUrl && (
                <a
                  href={project.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-animated font-mono text-label uppercase tracking-widest text-bone-subtle hover:text-bone transition-colors duration-250"
                >
                  {visitLabel} ↗
                </a>
              )}
            </div>

            <p className="absolute -bottom-12 right-0 font-mono text-mono-sm text-bone-faint tracking-[0.3em]">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ───────────────────── MOBILE CARD ─────────────────────────── */

function MobileCard({ project, index, total, locale, viewLabel, visitLabel, exploreLabel, onOpen }: PanelProps) {
  const content = locale === 'en' ? project.en : project.es
  return (
    <article className="border-b border-bone-faint/[0.08] pb-12 last:border-b-0">
      <div className="mb-6">
        <ProjectPreview project={project} exploreLabel={exploreLabel} />
      </div>

      <h3 className="font-sans font-bold text-bone text-[40px] leading-[0.95] tracking-[-0.02em]">
        {project.name}
      </h3>
      <p className="font-mono text-label uppercase tracking-[0.15em] mt-3" style={{ color: project.accentColor }}>
        {content.category}
      </p>
      <p className="font-sans text-bone/70 mt-5 text-[16px] leading-[1.7]">
        {content.description}
      </p>
      <div className="flex flex-wrap gap-2 mt-5">
        {project.tags.slice(0, 4).map(tag => (
          <span
            key={tag}
            className="font-mono text-mono-sm text-bone-subtle border border-bone-faint/20 px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={onOpen}
          className="font-mono text-label uppercase tracking-widest text-cyan"
        >
          {viewLabel} →
        </button>
        {project.siteUrl && (
          <a href={project.siteUrl} target="_blank" rel="noopener noreferrer"
            className="font-mono text-label uppercase tracking-widest text-bone-subtle">
            {visitLabel} ↗
          </a>
        )}
      </div>
      <p className="font-mono text-mono-sm text-bone-faint tracking-[0.3em] mt-6">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>
    </article>
  )
}
