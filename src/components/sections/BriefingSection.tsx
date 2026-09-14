'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { gsap, useGSAP, EASE, DURATION, prefersReducedMotion } from '@/lib/gsap'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type FlowState = 'idle' | 'validating' | 'questions' | 'generating' | 'document' | 'error'
type CanvasMode = 'idle' | 'typing' | 'processing'
type BriefingErrorCode = 'IP_RATE_LIMITED' | 'GLOBAL_RATE_LIMITED' | 'SERVICE_UNAVAILABLE' | 'REQUEST_TIMEOUT' | 'UNKNOWN'

interface TechnicalDocument {
  tipo:               string
  descripcion:        string
  stack:              string[]
  stack_justification:string
  timeline: {
    total: string
    fases: Array<{ nombre: string; duracion: string }>
  }
  inversion: {
    rango: string
    nota:  string
  }
  incluye:        string[]
  proximos_pasos: string[]
  pregunta_cierre:string
}

interface QuestionsData {
  ack:       string
  questions: [string, string]
}

const MAX_BRIEF  = 500
const MAX_ANSWER = 300
const EMAIL      = 'hola@vyzon.dev'

class BriefingRequestError extends Error {
  constructor(readonly code: BriefingErrorCode) {
    super(code)
  }
}

function getErrorCode(payload: unknown): BriefingErrorCode {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return 'UNKNOWN'
  const error = payload.error
  if (!error || typeof error !== 'object' || !('code' in error) || typeof error.code !== 'string') return 'UNKNOWN'

  return error.code === 'IP_RATE_LIMITED' || error.code === 'GLOBAL_RATE_LIMITED' ||
    error.code === 'SERVICE_UNAVAILABLE' || error.code === 'REQUEST_TIMEOUT'
    ? error.code
    : 'UNKNOWN'
}

async function getResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/* ─── API helpers ────────────────────────────────────────────────────────── */

async function callValidate(brief: string, locale: string) {
  const res = await fetch('/api/briefing', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: brief, locale, step: 'validate' }),
  })
  const payload = await getResponseJson(res)
  if (!res.ok) throw new BriefingRequestError(getErrorCode(payload))
  return payload as { sufficient: boolean; ack: string; questions: string[] }
}

async function callGenerate(brief: string, history: string, locale: string) {
  const res = await fetch('/api/briefing', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: brief, history, locale, step: 'generate' }),
  })
  const payload = await getResponseJson(res)
  if (!res.ok) throw new BriefingRequestError(getErrorCode(payload))
  return payload as { document: TechnicalDocument }
}

/* ─── CodeRainCanvas ─────────────────────────────────────────────────────
 * 80 partículas idle. Typing: +opacity +speed. Processing: +20 partículas.
 * Pausa con IntersectionObserver cuando la sección sale del viewport.
 */
function CodeRainCanvas({ mode }: { mode: CanvasMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef   = useRef<CanvasMode>(mode)
  modeRef.current = mode

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (prefersReducedMotion()) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const CHARS = '01{}[]<>()=>;:abcdefghijklmnopqrstuvwxyz'
    const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w = 0
    let h = 0

    interface Particle {
      x: number; y: number; char: string
      opacity: number; speed: number; size: number
      extra: boolean
    }

    const makeParticle = (extra = false): Particle => ({
      x:       Math.random() * w,
      y:       Math.random() * h,
      char:    randomChar(),
      opacity: Math.random() * 0.03 + 0.01,
      speed:   Math.random() * 0.3 + 0.1,
      size:    Math.floor(Math.random() * 4) + 8,
      extra,
    })

    const BASE  = 80
    const EXTRA = 20
    let particles: Particle[] = Array.from({ length: BASE }, () => makeParticle())

    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let boostO = 0
    let boostS = 0
    let extrasActive = false
    let raf = 0
    let visible = true

    const visObs = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    visObs.observe(canvas)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return

      const m = modeRef.current
      const targetO = m === 'processing' ? 0.04 : m === 'typing' ? 0.02 : 0
      const targetS = m === 'processing' ? 0.4  : m === 'typing' ? 0.2  : 0

      const upRate   = 0.06
      const downRate = 0.0016
      boostO += (targetO - boostO) * (targetO > boostO ? upRate : downRate)
      boostS += (targetS - boostS) * (targetS > boostS ? upRate : downRate)

      if (m === 'processing' && !extrasActive) {
        for (let i = 0; i < EXTRA; i++) particles.push(makeParticle(true))
        extrasActive = true
      } else if (m !== 'processing' && extrasActive && boostO < 0.004) {
        particles = particles.filter(p => !p.extra)
        extrasActive = false
      }

      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.y -= p.speed + boostS
        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w }
        if (Math.random() < 0.002) p.char = randomChar()
        ctx.fillStyle = `rgba(0, 229, 255, ${Math.min(0.3, p.opacity + boostO)})`
        ctx.font = `${p.size}px 'Geist Mono', monospace`
        ctx.fillText(p.char, p.x, p.y)
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

/* ─── BriefingSection ────────────────────────────────────────────────────── */

export function BriefingSection() {
  const t      = useTranslations('briefing')
  const locale = useLocale()

  /* Flow state */
  const [flowState,     setFlowState]     = useState<FlowState>('idle')
  const [brief,         setBrief]         = useState('')
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null)
  const [answers,       setAnswers]       = useState<[string, string]>(['', ''])
  const [document,      setDocument]      = useState<TechnicalDocument | null>(null)
  const [isTyping,      setIsTyping]      = useState(false)
  const [errorCode,     setErrorCode]     = useState<BriefingErrorCode>('UNKNOWN')

  /* Refs */
  const sectionRef  = useRef<HTMLElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const docRef      = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<number | null>(null)

  /* Derived canvas mode + progress bar state */
  const canvasMode: CanvasMode =
    flowState === 'validating' || flowState === 'generating' ? 'processing' :
    isTyping ? 'typing' : 'idle'

  const barState =
    flowState === 'validating' || flowState === 'generating' ? 'processing' :
    flowState === 'document'                                 ? 'done'       : ''

  /* Terminal label changes when document is ready */
  const terminalLabel =
    flowState === 'document' ? t('resultTitle') : t('terminalLabel')

  /* Typing heartbeat */
  function pingTyping() {
    setIsTyping(true)
    if (typingTimer.current) window.clearTimeout(typingTimer.current)
    typingTimer.current = window.setTimeout(() => setIsTyping(false), 1200)
  }
  useEffect(() => () => { if (typingTimer.current) window.clearTimeout(typingTimer.current) }, [])

  /* ── Entrance animations ── */
  useGSAP(() => {
    const headline = sectionRef.current?.querySelector<HTMLElement>('.briefing-headline')

    if (prefersReducedMotion()) {
      if (headline)            gsap.fromTo(headline,            { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } })
      if (terminalRef.current) gsap.fromTo(terminalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.15, immediateRender: false, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } })
      return
    }
    if (headline) {
      gsap.fromTo(headline,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: DURATION.slow, ease: EASE.expo, immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } })
    }
    if (terminalRef.current) {
      gsap.fromTo(terminalRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: DURATION.slow, ease: EASE.expo, delay: 0.2, immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } })
    }
  }, { scope: sectionRef })

  /* ── Document reveal — stagger each .doc-section ── */
  useEffect(() => {
    if (flowState !== 'document' || !docRef.current) return
    if (prefersReducedMotion()) {
      docRef.current.querySelectorAll<HTMLElement>('.doc-section').forEach(el => {
        el.style.opacity = '1'
      })
      return
    }
    const sections = docRef.current.querySelectorAll<HTMLElement>('.doc-section')
    gsap.fromTo(sections,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: EASE.expo, stagger: 0.09, delay: 0.15, immediateRender: false }
    )
  }, [flowState])

  /* ── Flow handlers ── */

  async function handleAnalyze() {
    if (brief.trim().length < 10 || flowState !== 'idle') return
    setFlowState('validating')

    try {
      const res = await callValidate(brief.trim(), locale)

      if (res.sufficient) {
        setFlowState('generating')
        const gen = await callGenerate(brief.trim(), '', locale)
        setDocument(gen.document)
        setFlowState('document')
      } else {
        setQuestionsData({
          ack:       res.ack || '',
          questions: (res.questions?.slice(0, 2) || ['', '']) as [string, string],
        })
        setFlowState('questions')
      }
    } catch (error: unknown) {
      setErrorCode(error instanceof BriefingRequestError ? error.code : 'UNKNOWN')
      setFlowState('error')
    }
  }

  async function handleContinue() {
    if (!questionsData) return
    const a1 = answers[0].trim()
    const a2 = answers[1].trim()
    if (!a1 || !a2) return

    setFlowState('generating')

    const history = [
      `Brief inicial: ${brief}`,
      `Preguntas: ${questionsData.questions.join(' / ')}`,
      `Respuestas: "${a1}" / "${a2}"`,
    ].join('\n')

    try {
      const gen = await callGenerate(brief.trim(), history, locale)
      setDocument(gen.document)
      setFlowState('document')
    } catch (error: unknown) {
      setErrorCode(error instanceof BriefingRequestError ? error.code : 'UNKNOWN')
      setFlowState('error')
    }
  }

  function handleReset() {
    setBrief('')
    setAnswers(['', ''])
    setQuestionsData(null)
    setDocument(null)
    setErrorCode('UNKNOWN')
    setFlowState('idle')
  }

  const isActive = brief.trim().length >= 10

  /* ─────────────────────────────── RENDER ─────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      id="briefing"
      data-section="briefing"
      className="relative py-section overflow-hidden bg-scanlines"
      style={{ backgroundColor: '#040404' }}
      aria-label="Briefing IA"
    >
      {/* Fondo reactivo */}
      <CodeRainCanvas mode={canvasMode} />

      {/* Gradiente radial ambiental */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />
      {/* Borde superior */}
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.2) 50%, transparent)', zIndex: 2 }} />
      {/* Borde inferior */}
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.2) 50%, transparent)', zIndex: 2 }} />

      <div className="container-site relative z-10 max-w-[1000px]">

        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse-dot" />
            <span className="font-mono text-label uppercase tracking-[0.3em] text-cyan">
              {t('label')}
            </span>
          </div>
          <h2
            className="briefing-headline font-sans text-display-lg text-bone max-w-[800px]"
            style={{ willChange: 'transform, opacity' }}
          >
            {t('headline')}
          </h2>
        </div>

        {/* Terminal — single container for all states */}
        <div
          ref={terminalRef}
          className="relative rounded-md overflow-hidden"
          style={{
            background:     '#080808',
            border:         '1px solid rgba(0,229,255,0.12)',
            boxShadow:      '0 0 40px rgba(0,229,255,0.04)',
            backdropFilter: 'blur(8px)',
            willChange:     'transform, opacity',
          }}
        >
          {/* Progress bar */}
          <div className={`terminal-progress-bar ${barState}`} aria-hidden="true" />

          {/* Terminal header — dots + dynamic label */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-bone-faint/[0.06]">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-50" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-50" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-50" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-bone-subtle">
              {terminalLabel}
            </span>
          </div>

          {/* ── IDLE — input area ── */}
          {flowState === 'idle' && (
            <div className="px-6 py-6">
              <div className="flex gap-3">
                <span className="font-mono text-mono-lg text-cyan mt-0.5 select-none flex-shrink-0">{'>'}</span>
                <textarea
                  value={brief}
                  onChange={e => { setBrief(e.target.value.slice(0, MAX_BRIEF)); pingTyping() }}
                  placeholder={t('placeholder')}
                  maxLength={MAX_BRIEF}
                  rows={3}
                  aria-label="Descripción del proyecto"
                  className="flex-1 font-sans text-[18px] text-bone bg-transparent resize-none outline-none border-none placeholder:text-bone-subtle/30 leading-relaxed"
                />
              </div>
              <div className="border-t border-bone-faint/[0.06] mt-6 pt-5 flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-subtle">
                  {brief.length}/{MAX_BRIEF}
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={!isActive}
                  aria-label="Analizar proyecto"
                  className={`font-mono text-label uppercase tracking-widest px-6 py-3 transition-all duration-350 ${
                    isActive
                      ? 'bg-cyan text-black hover:bg-white cursor-pointer'
                      : 'bg-transparent text-cyan border border-cyan opacity-40 cursor-not-allowed'
                  }`}
                >
                  {t('analyzeButton')} →
                </button>
              </div>
            </div>
          )}

          {/* ── VALIDATING / GENERATING — loading state ── */}
          {(flowState === 'validating' || flowState === 'generating') && (
            <div className="px-6 py-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-cyan select-none">{'>'}</span>
                <span className="font-mono text-[15px] text-bone/70">
                  {flowState === 'validating' ? t('validatingText') : t('generatingText')}
                </span>
                <span className="font-mono text-cyan animate-cursor-blink">▋</span>
              </div>
            </div>
          )}

          {/* ── QUESTIONS — follow-up inputs ── */}
          {flowState === 'questions' && questionsData && (
            <div className="px-6 py-6 space-y-6">
              {/* Ack from Gemini */}
              <div className="flex gap-3 items-start">
                <span className="font-mono text-[#00FF88] select-none flex-shrink-0 mt-0.5">{'>'}</span>
                <p className="font-sans text-[16px] text-bone/80 leading-relaxed">
                  {questionsData.ack}
                </p>
              </div>

              {/* 2 questions */}
              <div className="border-t border-bone-faint/[0.06] pt-6 space-y-7">
                {questionsData.questions.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-subtle leading-relaxed">
                      {q}
                    </p>
                    <div className="flex gap-3 items-center">
                      <span className="font-mono text-cyan select-none flex-shrink-0">{'>'}</span>
                      <input
                        type="text"
                        value={answers[i]}
                        onChange={e => {
                          const val = e.target.value.slice(0, MAX_ANSWER)
                          setAnswers(prev => i === 0 ? [val, prev[1]] : [prev[0], val])
                          pingTyping()
                        }}
                        placeholder={locale === 'es' ? 'Tu respuesta...' : 'Your answer...'}
                        maxLength={MAX_ANSWER}
                        className="flex-1 font-sans text-[16px] text-bone bg-transparent outline-none border-b border-bone-faint/[0.12] pb-1.5 focus:border-cyan/40 transition-colors duration-200 placeholder:text-bone-subtle/30"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue */}
              <div className="border-t border-bone-faint/[0.06] pt-5 flex justify-end">
                <button
                  onClick={handleContinue}
                  disabled={!answers[0].trim() || !answers[1].trim()}
                  className={`font-mono text-label uppercase tracking-widest px-6 py-3 transition-all duration-350 ${
                    answers[0].trim() && answers[1].trim()
                      ? 'bg-cyan text-black hover:bg-white cursor-pointer'
                      : 'bg-transparent text-cyan border border-cyan opacity-40 cursor-not-allowed'
                  }`}
                >
                  {t('continueButton')} →
                </button>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {flowState === 'error' && (
            <div className="px-6 py-6 space-y-4">
              <p className="font-mono text-mono-sm text-error">
                {errorCode === 'IP_RATE_LIMITED'
                  ? (locale === 'es' ? 'Alcanzaste el límite de pruebas. Volvé en un rato.' : 'You reached the trial limit. Please come back later.')
                  : errorCode === 'GLOBAL_RATE_LIMITED'
                    ? (locale === 'es' ? 'La demo alcanzó su límite diario. Volvé mañana.' : 'The demo reached its daily limit. Please come back tomorrow.')
                    : t('errorMessage')}
              </p>
              <button
                onClick={handleReset}
                className="font-mono text-[11px] uppercase tracking-widest text-bone/50 hover:text-bone transition-colors duration-200"
              >
                ← {t('retryButton')}
              </button>
            </div>
          )}

          {/* ── DOCUMENT ── */}
          {flowState === 'document' && document && (
            <div ref={docRef} className="divide-y divide-bone-faint/[0.06]">

              {/* Doc header — status dot + date */}
              <div className="doc-section px-6 py-5 flex items-center justify-between" style={{ opacity: 0 }}>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse-dot" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00FF88]">
                    {t('resultTitle')}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-bone-subtle">
                  {new Date().toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  })}
                </span>
              </div>

              {/* Tipo + Descripción */}
              <div className="doc-section px-6 py-8" style={{ opacity: 0 }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-3">
                  {t('labelType')}
                </p>
                <h3
                  className="font-sans font-bold text-bone mb-4"
                  style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
                >
                  {document.tipo}
                </h3>
                <p className="font-sans text-[16px] italic text-bone/65 leading-relaxed max-w-[65ch]">
                  {document.descripcion}
                </p>
              </div>

              {/* Stack | Timeline | Inversión — 3 col grid */}
              <div className="doc-section px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8" style={{ opacity: 0 }}>

                {/* Stack */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-4">
                    {t('labelStack')}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {document.stack.map((tech, i) => (
                      <span
                        key={`${tech}-${i}`}
                        className="font-mono text-[11px] text-cyan px-3 py-1.5"
                        style={{ border: '1px solid rgba(0,229,255,0.25)' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="font-mono text-[11px] text-bone/40 leading-relaxed">
                    {document.stack_justification}
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-4">
                    {t('labelTimeline')}
                  </p>
                  <p className="font-mono text-cyan font-medium mb-4" style={{ fontSize: 'clamp(15px, 2vw, 20px)' }}>
                    {document.timeline.total}
                  </p>
                  <div className="space-y-2">
                    {document.timeline.fases.map((fase, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[12px] text-bone/55">{fase.nombre}</span>
                        <span className="font-mono text-[11px] text-cyan/60">{fase.duracion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inversión */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-4">
                    {t('labelInvestment')}
                  </p>
                  <p
                    className="font-mono text-cyan font-bold"
                    style={{ fontSize: 'clamp(18px, 2.5vw, 26px)' }}
                  >
                    {document.inversion.rango}
                  </p>
                  <p className="font-mono text-[11px] text-bone/40 mt-2 leading-relaxed">
                    {document.inversion.nota}
                  </p>
                </div>
              </div>

              {/* Incluye — 2×2 */}
              <div className="doc-section px-6 py-8" style={{ opacity: 0 }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-6">
                  {t('docIncluye')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {document.incluye.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[14px] text-[#00FF88] flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                      <span className="font-sans text-[15px] text-bone/75 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos pasos */}
              <div className="doc-section px-6 py-8" style={{ opacity: 0 }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-6">
                  {t('labelSteps')}
                </p>
                <ol className="space-y-4">
                  {document.proximos_pasos.map((paso, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-mono text-[12px] text-cyan flex-shrink-0 tracking-[0.1em] mt-0.5">
                        0{i + 1} →
                      </span>
                      <span className="font-sans text-[15px] text-bone/75 leading-relaxed">{paso}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pregunta de cierre */}
              <div
                className="doc-section px-6 py-6"
                style={{
                  opacity:    0,
                  background: 'rgba(0,229,255,0.04)',
                  borderLeft: '2px solid rgba(0,229,255,0.35)',
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan/60 mb-2">
                  {t('docClosure')}
                </p>
                <p className="font-sans text-cyan text-[17px] leading-relaxed">
                  {document.pregunta_cierre}
                </p>
              </div>

              {/* Footer — disclaimer + CTAs */}
              <div className="doc-section px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ opacity: 0 }}>
                <p className="font-mono text-[11px] text-bone-subtle max-w-[42ch] leading-relaxed">
                  {t('disclaimer')}
                </p>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <button
                    onClick={handleReset}
                    className="font-mono text-[11px] uppercase tracking-widest text-bone/40 hover:text-bone/80 transition-colors duration-200"
                  >
                    ← {t('resetButton')}
                  </button>
                  <a
                    href={`mailto:${EMAIL}`}
                    data-cursor="cta"
                    data-cursor-label="Escribir"
                    className="font-mono text-label uppercase tracking-widest bg-cyan text-black px-8 py-4 hover:bg-white transition-colors duration-250"
                  >
                    {t('ctaButton')} →
                  </a>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Progress bar — estilos */}
      <style jsx global>{`
        .terminal-progress-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          z-index: 3;
          background: linear-gradient(to bottom, transparent 0%, #00e5ff 50%, transparent 100%);
          background-size: 100% 200%;
          animation: progress-idle 3s linear infinite;
        }
        @keyframes progress-idle {
          0%   { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        .terminal-progress-bar.processing {
          background: #00e5ff;
          box-shadow: 0 0 12px #00e5ff, 0 0 24px rgba(0, 229, 255, 0.4);
          animation: none;
        }
        .terminal-progress-bar.done {
          background: #00ff88;
          box-shadow: 0 0 12px #00ff88;
          animation: progress-fadeout 1s ease 0.5s forwards;
        }
        @keyframes progress-fadeout {
          to { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .terminal-progress-bar { animation: none; }
        }
      `}</style>
    </section>
  )
}
