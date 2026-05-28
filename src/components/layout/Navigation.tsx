'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageToggle } from './LanguageToggle'
import { gsap } from '@/lib/gsap'

export function Navigation() {
  const t      = useTranslations('nav')
  const locale = useLocale()

  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)

  const localePath = locale === 'en' ? '/en' : ''

  const navItems = [
    { id: 'work',     label: t('work'),     href: `${localePath}/#work` },
    { id: 'services', label: t('services'), href: `${localePath}/#services` },
    { id: 'process',  label: t('process'),  href: `${localePath}/#process` },
    { id: 'contact',  label: t('contact'),  href: `${localePath}/#contact` },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Animate drawer
  useEffect(() => {
    const drawer = document.getElementById('mobile-drawer')
    if (!drawer) return
    if (menuOpen) {
      gsap.fromTo(drawer,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'expo.out' }
      )
    } else {
      gsap.to(drawer, { x: '100%', duration: 0.4, ease: 'expo.in' })
    }
  }, [menuOpen])

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className={`
          fixed top-0 left-0 right-0 z-50
          flex items-center justify-between
          px-[var(--space-container)] py-6
          transition-all duration-500
          ${scrolled
            ? 'bg-black/85 backdrop-blur-md nav-border-gradient'
            : 'bg-transparent'
          }
        `}
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

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-gray-900 border-l border-bone-faint/[0.08] flex flex-col pt-24 pb-12 px-8 md:hidden"
        style={{ transform: 'translateX(100%)' }}
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
