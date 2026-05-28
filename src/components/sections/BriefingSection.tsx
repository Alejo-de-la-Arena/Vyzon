'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { gsap, useGSAP, EASE, DURATION, prefersReducedMotion } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'
import { analyzeProject, type BriefingResult, type Locale } from '@/lib/briefing'

const MAX_CHARS = 200

type Status = 'idle' | 'processing' | 'done' | 'error'

export function BriefingSection() {
  const t      = useTranslations('briefing')
  const locale = useLocale() as Locale

  const [text,   setText]   = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<BriefingResult | null>(null)
  const [steps,  setSteps]  = useState<string[]>([])

  const sectionRef  = useRef<HTMLElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const resultRef   = useRef<HTMLDivElement>(null)

  const processingSteps = t.raw('processingSteps') as string[]

  // Entrance — fromTo + immediateRender:false (fail-safe)
  useGSAP(() => {
    const headline = sectionRef.current?.querySelector<HTMLElement>('.briefing-headline')

    if (prefersReducedMotion()) {
      if (headline) gsap.fromTo(headline, { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } })
      if (terminalRef.current) gsap.fromTo(terminalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.15, immediateRender: false, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } })
      return
    }
    if (headline) {
      gsap.fromTo(headline,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: DURATION.slow, ease: EASE.expo, immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } }
      )
    }
    if (terminalRef.current) {
      gsap.fromTo(terminalRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: DURATION.slow, ease: EASE.expo, delay: 0.2, immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } }
      )
    }
  }, { scope: sectionRef })

  // Result reveal
  useEffect(() => {
    if (status === 'done' && resultRef.current) {
      gsap.fromTo(resultRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: DURATION.slow, ease: EASE.expo, delay: 0.2 }
      )
    }
  }, [status])

  /**
   * Typewriter de los pasos de procesamiento — char por char.
   * Mantiene el efecto visual idéntico al que tenía con la API.
   */
  async function runProcessingSteps() {
    for (const step of processingSteps) {
      await new Promise<void>(resolve => {
        setSteps(prev => [...prev, ''])
        let i = 0
        const interval = setInterval(() => {
          i++
          setSteps(prev => {
            const next = [...prev]
            next[next.length - 1] = step.slice(0, i)
            return next
          })
          if (i >= step.length) {
            clearInterval(interval)
            setTimeout(resolve, 250)
          }
        }, 28)
      })
    }
  }

  async function handleSubmit() {
    if (text.trim().length < 5 || status === 'processing') return

    setStatus('processing')
    setSteps([])
    setResult(null)

    try {
      // Pasos visuales con typewriter (mismo efecto que antes)
      await runProcessingSteps()
      // Pequeño beat para que el usuario lea el último paso
      await new Promise(r => setTimeout(r, 400))
      // Análisis local — sin red, sin API
      const analysis = analyzeProject(text.trim(), locale)
      setResult(analysis)
      setStatus('done')
    } catch (err) {
      console.error('[BriefingSection]', err)
      setStatus('error')
    }
  }

  const isActive  = text.trim().length >= 5
  const charLabel = `${text.length}/${MAX_CHARS}`

  return (
    <section
      ref={sectionRef}
      id="briefing"
      className="relative py-section overflow-hidden"
      style={{ background: '#070707' }}
      aria-label="Briefing IA"
    >
      {/* Ambient background — floating chars + scanline */}
      <SectionBackground variant="briefing" />

      <div className="container-site relative z-10 max-w-[1000px]">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse-dot" />
            <span className="font-mono text-label uppercase tracking-[0.3em] text-cyan">
              {t('label')}
            </span>
          </div>
          <h2 className="briefing-headline font-sans text-display-lg text-bone max-w-[800px]">
            {t('headline')}
          </h2>
        </div>

        {/* Terminal */}
        <div
          ref={terminalRef}
          className="rounded-md border border-bone-faint/10 bg-black/40 overflow-hidden"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-bone-faint/[0.06]">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-50" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-50" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-50" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-bone-subtle">
              {t('terminalLabel')}
            </span>
          </div>

          {/* Input area */}
          <div className="px-6 py-6">
            <div className="flex gap-3">
              <span className="font-mono text-mono-lg text-cyan mt-0.5 select-none flex-shrink-0">{'>'}</span>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder={t('placeholder')}
                maxLength={MAX_CHARS}
                rows={3}
                disabled={status === 'processing'}
                aria-label="Descripción del proyecto"
                className="
                  flex-1 font-sans text-[18px] text-bone bg-transparent
                  resize-none outline-none border-none
                  placeholder:text-bone-subtle/30
                  disabled:opacity-60
                  leading-relaxed
                "
              />
            </div>

            {/* Footer: char counter + submit */}
            <div className="border-t border-bone-faint/[0.06] mt-6 pt-5 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-subtle">
                {charLabel}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!isActive || status === 'processing'}
                aria-label="Analizar proyecto"
                className={`
                  font-mono text-label uppercase tracking-widest px-6 py-3
                  transition-all duration-350
                  ${isActive && status !== 'processing'
                    ? 'bg-cyan text-black hover:bg-white cursor-pointer'
                    : 'bg-transparent text-cyan border border-cyan opacity-40 cursor-not-allowed'
                  }
                `}
              >
                {status === 'processing' ? t('analyzingButton') : t('analyzeButton')} →
              </button>
            </div>
          </div>

          {/* Processing steps (typewriter) */}
          {steps.length > 0 && (
            <div className="px-6 pb-6 space-y-2 border-t border-bone-faint/[0.06] pt-5">
              {steps.map((step, i) => (
                <p key={i} className="font-mono text-mono-sm text-bone-muted">
                  <span className="text-cyan">{'→'}</span>{' '}
                  {step.replace(/^→\s*/, '')}
                  {i === steps.length - 1 && status === 'processing' && (
                    <span className="inline-block w-[1ch] animate-cursor-blink">▋</span>
                  )}
                </p>
              ))}
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="px-6 pb-6 border-t border-bone-faint/[0.06] pt-5">
              <p className="font-mono text-mono-sm text-error">{t('errorMessage')}</p>
            </div>
          )}
        </div>

        {/* Resultado */}
        {status === 'done' && result && (
          <div
            ref={resultRef}
            className="mt-12 rounded-md border border-cyan/30 bg-cyan-subtle/20 p-10"
            style={{ opacity: 0 }}
            aria-live="polite"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-success" />
              <span className="font-mono text-label uppercase tracking-[0.25em] text-cyan">
                {t('resultTitle')}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-bone-faint/[0.06] mb-10" />

            {/* Grid 2x2: Tipo | Stack | Timeline | Inversión */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 mb-10">
              {/* Tipo */}
              <ResultCell label={t('labelType')} value={result.tipo} />

              {/* Stack — chips */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-3">
                  {t('labelStack')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.stack.map((tech, i) => (
                    <span
                      key={`${tech}-${i}`}
                      className="font-mono text-mono-sm text-bone border border-bone-faint/20 px-3 py-1.5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <ResultCell label={t('labelTimeline')}   value={result.timeline}  accent />

              {/* Inversión */}
              <ResultCell label={t('labelInvestment')} value={result.inversion} accent />
            </div>

            {/* Descripción — italic, opacity 0.7 */}
            {result.descripcion && (
              <div className="mb-10 border-t border-bone-faint/[0.06] pt-8">
                <p className="font-sans text-[18px] italic text-bone/70 leading-relaxed max-w-[60ch]">
                  {result.descripcion}
                </p>
              </div>
            )}

            {/* Próximos pasos — numerados */}
            {result.pasos && result.pasos.length > 0 && (
              <div className="mb-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-5">
                  {t('labelSteps')}
                </p>
                <ol className="space-y-4">
                  {result.pasos.map((paso, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="font-mono text-mono-sm text-cyan flex-shrink-0 mt-1 tracking-[0.1em]">
                        0{i + 1}
                      </span>
                      <span className="font-sans text-body-md text-bone-muted leading-relaxed">
                        {paso}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Disclaimer + CTA */}
            <div className="border-t border-bone-faint/[0.08] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <p className="font-mono text-mono-sm text-bone-subtle max-w-[40ch]">
                {t('disclaimer')}
              </p>
              <a
                href="mailto:hola@vyzon.dev"
                data-cursor="cta"
                className="
                  font-mono text-label uppercase tracking-widest
                  bg-cyan text-black px-8 py-4 flex-shrink-0
                  hover:bg-white transition-colors duration-250
                "
              >
                {t('ctaButton')} →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ResultCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-2">
        {label}
      </p>
      <p className={`${accent ? 'font-mono text-cyan' : 'font-sans text-bone'} text-[18px] font-medium`}>
        {value}
      </p>
    </div>
  )
}
