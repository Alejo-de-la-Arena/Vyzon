'use client'

import { useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { gsap } from '@/lib/gsap'
import type { Project } from '@/types'
import { ProjectPreview } from './ProjectPreview'

interface Props {
  project:   Project | null
  onClose:   () => void
  onPrev:    () => void
  onNext:    () => void
  canPrev:   boolean
  canNext:   boolean
}

export function ProjectModal({ project, onClose, onPrev, onNext, canPrev, canNext }: Props) {
  const t      = useTranslations('works')
  const locale = useLocale()

  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  // Enter animation — re-runs only when the active project changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!project || !overlayRef.current || !panelRef.current) return
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(panelRef.current,
      { opacity: 0, scale: 0.95, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'expo.out' }
    )
  }, [project?.id])

  // Lock body scroll
  useEffect(() => {
    if (!project) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [project])

  // ESC to close + arrow keys to navigate
  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft'  && canPrev) onPrev()
      if (e.key === 'ArrowRight' && canNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose, onPrev, onNext, canPrev, canNext])

  if (!project) return null

  const content = locale === 'en' ? project.en : project.es

  // Split paragraphs for the body sections
  const challengeParas = content.challenge.split('\n\n').filter(Boolean)
  const solutionParas  = content.solution.split('\n\n').filter(Boolean)
  const resultParas    = content.result.split('\n\n').filter(Boolean)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-[900px] my-8 bg-[#080808] border border-bone-faint/[0.08]"
        style={{ padding: 'clamp(32px, 5vw, 80px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label={t('modalClose')}
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-bone-subtle hover:text-cyan transition-colors duration-250 font-mono text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 font-mono text-label uppercase tracking-[0.25em] mb-4">
            <span style={{ color: project.accentColor }}>{project.number}</span>
            <span className="text-bone-faint">·</span>
            <span className="text-cyan">{content.type}</span>
            <span className="text-bone-faint">·</span>
            <span className="text-bone-subtle">{project.year}</span>
          </div>
          <h2
            className="font-sans font-bold text-bone"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
          >
            {project.name}
          </h2>
          <p
            className="font-sans italic mt-3 max-w-[55ch]"
            style={{ color: project.accentColor, opacity: 0.9, fontSize: 'clamp(15px, 1.4vw, 18px)' }}
          >
            {content.description}
          </p>
        </header>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 lg:gap-12 mb-10">
          {/* Left: text body */}
          <div className="space-y-8">
            <Block label={t('modalChallenge')} paragraphs={challengeParas} />
            <Block label={t('modalSolution')}  paragraphs={solutionParas} />
            <Block label={t('modalResult')}    paragraphs={resultParas}   accent />
          </div>

          {/* Right: meta + preview */}
          <aside className="space-y-8">
            {/* Stack */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-3">
                {t('modalStack')}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="font-mono text-mono-sm px-3 py-1.5 border"
                    style={{ borderColor: `${project.accentColor}40`, color: '#F5F0E8' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Timeline + year */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-2">
                  {t('modalTimeline')}
                </p>
                <p className="font-sans text-bone text-[16px]">
                  {project.deliveryDays
                    ? t('modalDelivered', { days: project.deliveryDays })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-2">
                  {t('modalYear')}
                </p>
                <p className="font-mono text-cyan text-[16px] tracking-[0.1em]">
                  {project.year}
                </p>
              </div>
            </div>

            {/* Mini preview */}
            <div>
              <ProjectPreview project={project} exploreLabel={t('explore')} />
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-bone-faint/[0.08] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Visit site */}
          {project.siteUrl ? (
            <a
              href={project.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-label uppercase tracking-widest text-cyan hover:text-white transition-colors duration-250"
            >
              {t('visitSite')} ↗
            </a>
          ) : (
            <span className="font-mono text-label uppercase tracking-widest text-bone-faint">
              {t('visitSite')} —
            </span>
          )}

          {/* Prev / Next */}
          <div className="flex items-center gap-6">
            <button
              onClick={onPrev}
              disabled={!canPrev}
              className="font-mono text-label uppercase tracking-widest text-bone-muted hover:text-cyan transition-colors duration-250 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← {t('modalPrev')}
            </button>
            <button
              onClick={onNext}
              disabled={!canNext}
              className="font-mono text-label uppercase tracking-widest text-bone-muted hover:text-cyan transition-colors duration-250 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('modalNext')} →
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function Block({ label, paragraphs, accent }: { label: string; paragraphs: string[]; accent?: boolean }) {
  return (
    <div>
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.3em] mb-3 ${accent ? 'text-cyan' : 'text-bone-subtle'}`}
      >
        {label}
      </p>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="font-sans text-body-md text-bone-muted leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
