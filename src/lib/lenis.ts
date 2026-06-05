'use client'

/**
 * Lenis Smooth Scroll — VYZON Portfolio
 *
 * Integración con GSAP ScrollTrigger:
 *   Lenis v1.x actualiza el scroll REAL del documento (a diferencia de
 *   Locomotive Scroll). Por eso NO se usa ScrollTrigger.scrollerProxy().
 *   Basta con:
 *     1. lenis.on('scroll', ScrollTrigger.update) → notifica a GSAP en cada tick.
 *     2. gsap.ticker.add(lenis.raf)                → un solo RAF loop compartido.
 *     3. ScrollTrigger.refresh() diferido          → recalcula posiciones
 *        DESPUÉS de que los client components hidraten y registren sus triggers.
 */

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenisInstance: Lenis | null = null
let refreshTimers: number[] = []

export function createLenis(): Lenis {
  const lenis = new Lenis({
    duration:        1.0,  // reducido de 1.2 — respuesta más directa sin perder suavidad
    easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation:     'vertical',
    smoothWheel:     true,
    wheelMultiplier: 0.8,  // velocidad de rueda más controlada
    touchMultiplier: 1.5,  // reducido de 2 — swipe touch más natural
  })

  // 1) Cada vez que Lenis hace scroll, refrescar ScrollTrigger.
  lenis.on('scroll', ScrollTrigger.update)

  // 2) Sincronizar Lenis con el ticker de GSAP (loop único y eficiente).
  const tickerFn = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tickerFn)
  ;(lenis as Lenis & { __tickerFn?: (t: number) => void }).__tickerFn = tickerFn

  // GSAP lerpea por su cuenta — desactivar el lag smoothing nativo.
  gsap.ticker.lagSmoothing(0)

  // 3) Refresh inmediato + reintentos diferidos.
  //    Los componentes 'use client' hidratan después del LenisProvider,
  //    así que registrar sus ScrollTriggers más tarde. Refrescamos varias
  //    veces para recalcular posiciones a medida que el DOM se estabiliza.
  ScrollTrigger.refresh()
  refreshTimers = [
    window.setTimeout(() => ScrollTrigger.refresh(), 100),
    window.setTimeout(() => ScrollTrigger.refresh(), 500),
    window.setTimeout(() => ScrollTrigger.refresh(), 1500),
  ]

  // Fallback: si por alguna razón Lenis no emite scroll (e.g. scroll programático
  // que bypassea Lenis), escuchar el evento nativo también.
  window.addEventListener('scroll', ScrollTrigger.update, { passive: true })

  lenisInstance = lenis
  return lenis
}

export function getLenis(): Lenis | null {
  return lenisInstance
}

export function destroyLenis(): void {
  if (!lenisInstance) return
  const tickerFn = (lenisInstance as Lenis & { __tickerFn?: (t: number) => void }).__tickerFn
  if (tickerFn) gsap.ticker.remove(tickerFn)
  refreshTimers.forEach(id => clearTimeout(id))
  refreshTimers = []
  window.removeEventListener('scroll', ScrollTrigger.update)
  lenisInstance.destroy()
  lenisInstance = null
}

/**
 * Compatibilidad: el loop ya está conectado vía gsap.ticker en createLenis().
 * Conservado como no-op para no romper el wiring existente en LenisProvider.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function startLenisRaf(lenis: Lenis): () => void {
  return () => {}
}
