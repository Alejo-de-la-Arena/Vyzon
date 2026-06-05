'use client'

/**
 * ScrollColorManager — VYZON Portfolio
 *
 * Animates document.body.style.backgroundColor between the 7 section
 * color states defined in the rediseno-experiencia.md blueprint.
 *
 * Strategy:
 *  - Each <section> gets a data-section="<name>" attribute.
 *  - ScrollTrigger fires onEnter / onEnterBack for each section.
 *  - GSAP smoothly transitions body bg (0.8s power2.inOut).
 *  - Sections themselves are bg-transparent; this layer is the only bg.
 *  - Disabled when prefers-reduced-motion is set.
 */

import { useEffect } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

// ── Section → background-color map ───────────────────────────────────
const SECTION_COLORS: Record<string, string> = {
  hero:      '#000000',  // profundo
  manifesto: '#080B12',  // negro azulado
  briefing:  '#040404',  // más oscuro + scanlines
  works:     '#000000',  // base; capítulos propios via Fase D
  services:  '#0A0A0A',  // brutalista
  process:   '#000000',  // constructivo
  cierre:    '#000000',  // negro absoluto
}

function applyBg(color: string) {
  gsap.to(document.body, {
    backgroundColor: color,
    duration: 0.85,
    ease: 'power2.inOut',
    overwrite: 'auto',
  })
}

export function ScrollColorManager() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (prefersReducedMotion()) return

    // Wait a tick so all sections are mounted
    const timer = window.setTimeout(() => {
      const sections = document.querySelectorAll<HTMLElement>('[data-section]')
      const triggers: ReturnType<typeof ScrollTrigger.create>[] = []

      sections.forEach(section => {
        const name = section.dataset.section
        if (!name || !(name in SECTION_COLORS)) return
        const color = SECTION_COLORS[name]

        const trigger = ScrollTrigger.create({
          trigger:    section,
          start:      'top 55%',
          end:        'bottom 45%',
          onEnter:     () => applyBg(color),
          onEnterBack: () => applyBg(color),
        })

        triggers.push(trigger)
      })

      return () => triggers.forEach(t => t.kill())
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return null
}
