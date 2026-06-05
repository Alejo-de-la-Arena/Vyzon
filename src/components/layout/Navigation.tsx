'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageToggle } from './LanguageToggle'
import { gsap } from '@/lib/gsap'

// ── Scramble text effect ─────────────────────────────────────────────
// Resolves chars left-to-right over 8 frames (600ms total).
// Switches font to Geist Mono while scrambling (looks technical).
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!?'

function scrambleText(el: HTMLElement, finalText: string): void {
  const steps        = 8
  const stepDuration = 600 / steps
  let   step         = 0

  // Switch to mono during effect
  const origFont = el.style.fontFamily
  el.style.fontFamily = 'var(--font-geist-mono, ui-monospace, monospace)'

  const interval = setInterval(() => {
    step++
    const resolved = Math.floor((step / steps) * finalText.length)

    el.textContent = finalText
      .split('')
      .map((ch, i) => {
        if (ch === ' ') return ' '
        if (i < resolved)  return ch
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      })
      .join('')

    if (step >= steps) {
      clearInterval(interval)
      el.textContent    = finalText
      el.style.fontFamily = origFont
    }
  }, stepDuration)
}

export function Navigation() {
  const t      = useTranslations('nav')
  const locale = useLocale()

  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  // Sentinel ref — IntersectionObserver instead of window scroll listener
  // (Emil: window.addEventListener('scroll') is banned — jank-prone, no batching)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleScramble = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget
    const text = el.dataset.text ?? el.textContent ?? ''
    if (text) scrambleText(el, text)
  }, [])

  const localePath = locale === 'en' ? '/en' : ''

  const navItems = [
    { id: 'work',     label: t('work'),     href: `${localePath}/#work` },
    { id: 'services', label: t('services'), href: `${localePath}/#services` },
    { id: 'process',  label: t('process'),  href: `${localePath}/#process` },
    { id: 'contact',  label: t('contact'),  href: `${localePath}/#contact` },
  ]

  // IntersectionObserver: sentinel placed 80px below page top.
  // When it leaves the viewport, nav becomes opaque.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Animate drawer — Emil: expo.out for both enter AND exit (ease-in is banned)
  // Exit is faster than enter (400ms vs 500ms) — asymmetric enter/exit.
  useEffect(() => {
    const drawer = document.getElementById('mobile-drawer')
    if (!drawer) return
    if (menuOpen) {
      gsap.fromTo(drawer,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'expo.out' }
      )
    } else {
      gsap.to(drawer, { x: '100%', duration: 0.35, ease: 'expo.out' })
    }
  }, [menuOpen])

  return (
    <>
      {/* Sentinel — IntersectionObserver target. Placed 80px below top,
          outside viewport when scrolled. Invisible, no layout cost. */}
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="absolute top-[80px] left-0 w-0 h-0 pointer-events-none overflow-hidden"
      />

      <nav
        aria-label="Navegación principal"
        className={`
          fixed top-0 left-0 right-0 z-50
          flex items-center justify-between
          px-[var(--space-container)] py-6
          ${scrolled
            ? 'bg-black/85 backdrop-blur-md nav-border-gradient'
            : 'bg-transparent'
          }
        `}
        style={{
          /* Emil: specify exact properties, never transition:all */
          transition: 'background-color 400ms var(--ease-expo), backdrop-filter 400ms var(--ease-expo)',
        }}
      >
        {/* Logo */}
        <Link
          href={localePath || '/'}
          className="font-sans font-bold text-bone tracking-[0.2em] text-[18px] hover:text-bone/80 transition-colors duration-250"
          aria-label="VYZON — Volver al inicio"
        >
          VYZON
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <a
              key={item.id}
              href={item.href}
              data-text={item.label}
              onMouseEnter={handleScramble}
              className="link-animated font-mono text-label uppercase tracking-[0.15em] text-bone-muted hover:text-bone transition-colors duration-250"
            >
              {item.label}
            </a>
          ))}
          <LanguageToggle />
        </div>

        {/* Mobile: language toggle + hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <LanguageToggle />
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="relative w-8 h-8 flex flex-col justify-center items-center gap-[5px]"
          >
            <span
              className={`block h-px bg-bone w-5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}
            />
            <span
              className={`block h-px bg-bone w-5 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}
            />
            <span
              className={`block h-px bg-bone w-5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer — role="dialog" for a11y, design token bg (#0D0D0D) */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed top-0 right-0 bottom-0 z-50 w-72 border-l border-bone-faint/[0.08] flex flex-col pt-24 pb-12 px-8 md:hidden"
        style={{ transform: 'translateX(100%)', backgroundColor: 'var(--color-surface)' }}
        aria-hidden={!menuOpen}
      >
        {/* Close */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
          className="absolute top-6 right-6 font-mono text-label text-bone-subtle hover:text-bone"
        >
          ✕
        </button>

        {/* Nav links */}
        <nav className="flex flex-col gap-8 mb-auto">
          {navItems.map(item => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-mono text-label uppercase tracking-[0.2em] text-bone-muted hover:text-bone transition-colors duration-250"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Email */}
        <a
          href="mailto:hola@vyzon.dev"
          className="font-mono text-mono-sm text-cyan hover:text-cyan/80 transition-colors duration-250 mt-8"
        >
          hola@vyzon.dev
        </a>
      </div>

      {/* Gradient border on scroll */}
      <style jsx global>{`
        .nav-border-gradient {
          border-bottom: 1px solid transparent;
          border-image: linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.4) 50%, transparent 100%) 1;
        }
      `}</style>
    </>
  )
}
