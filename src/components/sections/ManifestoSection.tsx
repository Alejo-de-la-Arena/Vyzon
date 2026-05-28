'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { gsap } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

interface Principle {
  num:   string
  title: string
  sub:   string
  body:  string
}

export function ManifestoSection() {
  const t = useTranslations('manifesto')

  const sectionRef = useRef<HTMLElement>(null)

  const principles: Principle[] = [
    { num: '01', title: t('p1Title'), sub: t('p1Sub'), body: t('p1Body') },
    { num: '02', title: t('p2Title'), sub: t('p2Sub'), body: t('p2Body') },
    { num: '03', title: t('p3Title'), sub: t('p3Sub'), body: t('p3Body') },
  ]

  /**
   * Animación simple y fluida con gsap.context.
   * Sin SplitText, sin clip-path — solo fade + slide.
   */
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      const blocks = sectionRef.current!.querySelectorAll<HTMLElement>('.manifesto-item')

      blocks.forEach(block => {
        const eyebrow = block.querySelector<HTMLElement>('.manifesto-eyebrow')
        const title   = block.querySelector<HTMLElement>('.manifesto-title')
        const sub     = block.querySelector<HTMLElement>('.manifesto-sub')
        const body    = block.querySelector<HTMLElement>('.manifesto-body')

        const tl = gsap.timeline({
          scrollTrigger: { trigger: block, start: 'top 85%', once: true },
        })

        if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', immediateRender: false })
        if (title)   tl.from(title,   { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', immediateRender: false }, '-=0.2')
        if (sub)     tl.from(sub,     { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', immediateRender: false }, '-=0.3')
        if (body)    tl.from(body,    { opacity: 0, y: 12, duration: 0.6, ease: 'power2.out', immediateRender: false }, '-=0.3')
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-section overflow-hidden"
      aria-label="Manifiesto VYZON"
    >
      {/* Ambient — kinetic horizontal lines */}
      <SectionBackground variant="manifesto" />

      <div className="container-site relative z-10">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono text-label uppercase tracking-[0.3em] text-cyan mb-4">
            {t('label')}
          </p>
          <h2 className="font-sans text-display-xl text-bone">
            {t('headline')}
          </h2>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 border-t border-l border-bone-faint/[0.08]">
          {principles.map(p => (
            <DesktopColumn key={p.num} principle={p} principleLabel={t('principleLabel')} />
          ))}
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden border-t border-bone-faint/[0.08]">
          {principles.map((p, i) => (
            <MobileAccordion
              key={p.num}
              principle={p}
              defaultOpen={i === 0}
              principleLabel={t('principleLabel')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── DESKTOP — Column ────────────────────────── */

function DesktopColumn({ principle, principleLabel }: { principle: Principle; principleLabel: string }) {
  const colRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const col = colRef.current
    if (!col) return
    const num = col.querySelector<HTMLElement>('.manifesto-num')

    const onEnter = () => {
      gsap.to(col, { backgroundColor: 'rgba(0,229,255,0.02)', duration: 0.3, ease: 'power2.out' })
      if (num) gsap.to(num, { scale: 1.2, duration: 0.4, ease: 'expo.out' })
    }
    const onLeave = () => {
      gsap.to(col, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.3, ease: 'power2.out' })
      if (num) gsap.to(num, { scale: 1, duration: 0.4, ease: 'expo.out' })
    }

    col.addEventListener('mouseenter', onEnter)
    col.addEventListener('mouseleave', onLeave)
    return () => {
      col.removeEventListener('mouseenter', onEnter)
      col.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={colRef}
      className="manifesto-item relative flex flex-col border-r border-b border-bone-faint/[0.08]"
      style={{ padding: '48px 40px', minHeight: '400px' }}
    >
      {/* Number */}
      <p
        className="manifesto-eyebrow manifesto-num font-mono text-cyan inline-block origin-left"
        style={{ fontSize: '11px', letterSpacing: '0.3em', marginBottom: '32px' }}
      >
        {principle.num}
        <span className="text-bone-subtle"> — {principleLabel}</span>
      </p>

      {/* Title */}
      <h3
        className="manifesto-title font-sans font-bold text-bone"
        style={{
          fontSize: 'clamp(28px, 3vw, 44px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}
      >
        {principle.title}
      </h3>

      {/* Subtitle */}
      <p
        className="manifesto-sub font-sans italic text-bone/40"
        style={{
          fontSize: 'clamp(28px, 3vw, 44px)',
          fontWeight: 300,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {principle.sub}
      </p>

      {/* Body — first ~40 words */}
      <p
        className="manifesto-body font-mono text-bone/55"
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          marginTop: '24px',
        }}
      >
        {truncateWords(principle.body, 40)}
      </p>
    </div>
  )
}

/* ─────────────────── MOBILE — Accordion ──────────────────────── */

function MobileAccordion({
  principle,
  defaultOpen,
  principleLabel,
}: {
  principle:      Principle
  defaultOpen:    boolean
  principleLabel: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef   = useRef<HTMLDivElement>(null)

  // Animate height when toggled
  useEffect(() => {
    const wrapper = contentRef.current
    const inner   = innerRef.current
    if (!wrapper || !inner) return

    if (open) {
      gsap.set(wrapper, { height: 'auto' })
      const targetH = wrapper.offsetHeight
      gsap.fromTo(wrapper, { height: 0 }, { height: targetH, duration: 0.45, ease: 'expo.out', onComplete: () => { wrapper.style.height = 'auto' } })
      gsap.fromTo(inner, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 })
    } else {
      const currentH = wrapper.offsetHeight
      gsap.fromTo(wrapper, { height: currentH }, { height: 0, duration: 0.35, ease: 'expo.in' })
    }
  }, [open])

  return (
    <div className="manifesto-item border-b border-bone-faint/[0.08]">
      {/* Header — clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-6 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="manifesto-eyebrow font-mono text-cyan flex-shrink-0"
            style={{ fontSize: '11px', letterSpacing: '0.3em' }}
          >
            {principle.num}
          </span>
          <h3
            className="manifesto-title font-sans font-bold text-bone truncate"
            style={{ fontSize: '22px', lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            {principle.title}
          </h3>
        </div>
        <span
          className="font-mono text-bone-subtle flex-shrink-0 transition-transform duration-300"
          style={{
            fontSize: '20px',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {/* Expandable content */}
      <div ref={contentRef} className="overflow-hidden" style={{ height: defaultOpen ? 'auto' : 0 }}>
        <div ref={innerRef} className="pb-6 pl-12">
          <p
            className="manifesto-sub font-sans italic text-bone/50"
            style={{ fontSize: '18px', fontWeight: 300, lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: '12px' }}
          >
            {principle.sub}
          </p>
          <p
            className="manifesto-body font-mono text-bone/55"
            style={{ fontSize: '14px', lineHeight: 1.7 }}
          >
            {principle.body}
          </p>
          <p className="font-mono text-bone-faint/60 text-[10px] tracking-[0.25em] uppercase mt-4">
            {principleLabel}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── helpers ─────────────────────────────── */

function truncateWords(text: string, max: number): string {
  const words = text.split(/\s+/)
  if (words.length <= max) return text
  return words.slice(0, max).join(' ') + '…'
}
