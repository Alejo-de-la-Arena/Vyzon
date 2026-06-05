'use client'

/**
 * GSAP Configuration — VYZON Portfolio
 * Registers plugins and exports typed constants.
 *
 * ⚠️ This file imports gsap — it must only be used client-side.
 *    Use inside useGSAP() or useEffect(), never at module top-level during SSR.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// VYZON usa reveals por línea entera (fade + slide-up), no SplitText.
// Más fluido visualmente y evita complejidad por nada.

gsap.registerPlugin(ScrollTrigger, useGSAP)

// ── Easing presets ────────────────────────────────────────────────
// Emil rule: NO elastic/bounce. Ease-out only for enters/exits.
// Custom curves over CSS defaults — these have the "punch" that
// makes animations feel intentional rather than accidental.
export const EASE = {
  expo:    'expo.out',                             // Premium, suave — el más usado
  power3:  'power3.out',                           // Para elementos más pesados
  power4:  'power4.out',                           // CTA rebounds, entrances decisivas
  smooth:  'cubic-bezier(0.25, 1, 0.5, 1)',        // ease-out-quart — smooth
  snappy:  'cubic-bezier(0.16, 1, 0.3, 1)',        // ease-out-expo — decisive
  linear:  'none',                                 // Parallax, scrub
} as const

// ── Duration presets (segundos) ───────────────────────────────────
export const DURATION = {
  fast:   0.3,  // Micro-interactions (hover, click feedback)
  mid:    0.6,  // Fade de elementos simples
  slow:   1.0,  // Reveal de texto largo, cards
  slower: 1.4,  // Char-by-char del headline hero
  crawl:  2.0,  // Elementos muy pesados, líneas de progreso
} as const

// ── Stagger presets (segundos) ────────────────────────────────────
export const STAGGER = {
  tight:  0.025, // SplitText char-by-char
  normal: 0.1,   // Cards, items de lista
  loose:  0.15,  // Cards grandes, secciones
  slow:   0.25,  // Elementos muy espaciados
} as const

// ── ScrollTrigger defaults ────────────────────────────────────────
export const ST_DEFAULTS = {
  scrub:    1.5,
  markers:  false, // cambiar a true durante development
} as const

// ── Utility: detectar prefers-reduced-motion ──────────────────────
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ── Utility: detectar touch device (cursor custom off) ───────────
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

export { gsap, ScrollTrigger, useGSAP }
