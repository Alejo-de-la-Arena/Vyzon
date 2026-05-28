'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion, isTouchDevice } from '@/lib/gsap'

type Variant =
  | 'hero'
  | 'manifesto'
  | 'briefing'
  | 'works'
  | 'services'
  | 'process'
  | 'cierre'

interface Props {
  variant:        Variant
  /** For 'works' variant: 0,1,2 — which project tint is active */
  activeIndex?:   number
}

/**
 * SectionBackground — ambient background per section variant.
 * Mounted absolutely behind section content. All variants honor prefers-reduced-motion.
 */
export function SectionBackground({ variant, activeIndex = 0 }: Props) {
  switch (variant) {
    case 'hero':       return <HeroBg />
    case 'manifesto':  return <ManifestoBg />
    case 'briefing':   return <BriefingBg />
    case 'works':      return <WorksBg activeIndex={activeIndex} />
    case 'services':   return <ServicesBg />
    case 'process':    return <ProcessBg />
    case 'cierre':     return <CierreBg />
  }
}

/* ───────────────────────────── HERO ─────────────────────────────
   Canvas with 80 floating particles + connection lines
   + radial gradient following the mouse.
   ────────────────────────────────────────────────────────────── */
function HeroBg() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const gradientRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = prefersReducedMotion()

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const N = reduced ? 30 : 80
    type P = { x: number; y: number; vx: number; vy: number }
    const particles: P[] = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.offsetWidth,
      y:  Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }))

    let raf = 0
    const loop = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // particles
      ctx.fillStyle = 'rgba(0, 229, 255, 0.45)'
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // connections
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx*dx + dy*dy
          if (d2 < 12000) {
            ctx.globalAlpha = 1 - d2 / 12000
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(loop)
    }
    if (!reduced) raf = requestAnimationFrame(loop)
    else loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Mouse-following radial gradient
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return
    const el = gradientRef.current
    if (!el) return
    let mx = 50, my = 50, cx = 50, cy = 50
    let raf = 0
    const tick = () => {
      cx += (mx - cx) * 0.06
      cy += (my - cy) * 0.06
      el.style.setProperty('--mx', `${cx}%`)
      el.style.setProperty('--my', `${cy}%`)
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth)  * 100
      my = (e.clientY / window.innerHeight) * 100
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,240,232,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,240,232,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      {/* Particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Mouse-follow gradient */}
      <div
        ref={gradientRef}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(0,229,255,0.08), transparent 70%)',
        }}
      />
    </div>
  )
}

/* ──────────────────────── MANIFESTO ─────────────────────────────
   5 kinetic horizontal lines at different speeds + 1 bright sweep.
   ────────────────────────────────────────────────────────────── */
function ManifestoBg() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes drift-1 { 0% { transform: translateX(-10%); } 100% { transform: translateX(10%); } }
        @keyframes drift-2 { 0% { transform: translateX(8%);  } 100% { transform: translateX(-8%); } }
        @keyframes sweep   { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .manifesto-line { position: absolute; left: 0; right: 0; height: 1px; background: rgba(0,229,255,0.04); will-change: transform; }
        .manifesto-line.bright { background: linear-gradient(90deg, transparent, rgba(0,229,255,0.18), transparent); animation: sweep 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .manifesto-line { animation: none !important; }
        }
      `}</style>
      <div className="manifesto-line" style={{ top: '12%', animation: 'drift-1 24s ease-in-out infinite alternate' }} />
      <div className="manifesto-line" style={{ top: '30%', animation: 'drift-2 30s ease-in-out infinite alternate' }} />
      <div className="manifesto-line" style={{ top: '52%', animation: 'drift-1 38s ease-in-out infinite alternate' }} />
      <div className="manifesto-line" style={{ top: '70%', animation: 'drift-2 28s ease-in-out infinite alternate' }} />
      <div className="manifesto-line" style={{ top: '88%', animation: 'drift-1 34s ease-in-out infinite alternate' }} />
      <div className="manifesto-line bright" style={{ top: '45%' }} />
    </div>
  )
}

/* ──────────────────────── BRIEFING IA ───────────────────────────
   Floating code-like chars + slow scanline.
   ────────────────────────────────────────────────────────────── */
function BriefingBg() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const tokens = ['const', '→', '{}', '[]', 'fn', '=>', 'AI', '01', '0xFF', 'async', 'await', '?:', '|>', '/*', '*/', '$_', 'null']
    const timeoutIds: number[] = []

    const spawn = () => {
      const span = document.createElement('span')
      span.textContent = tokens[Math.floor(Math.random() * tokens.length)]
      span.style.position = 'absolute'
      span.style.left   = `${Math.random() * 100}%`
      span.style.top    = `${Math.random() * 100}%`
      span.style.color  = 'rgba(0, 229, 255, 0.18)'
      span.style.fontFamily = 'var(--font-geist-mono, ui-monospace, monospace)'
      span.style.fontSize = `${10 + Math.random() * 6}px`
      span.style.opacity = '0'
      span.style.transition = 'opacity 0.8s ease'
      el.appendChild(span)
      requestAnimationFrame(() => { span.style.opacity = '1' })
      const fadeId = window.setTimeout(() => { span.style.opacity = '0' }, 2400 + Math.random() * 1800)
      const killId = window.setTimeout(() => { span.remove() }, 4500)
      timeoutIds.push(fadeId, killId)
    }

    const reduced = prefersReducedMotion()
    if (reduced) return

    // burst initial + interval
    for (let i = 0; i < 6; i++) spawn()
    const interval = window.setInterval(spawn, 750)
    return () => {
      clearInterval(interval)
      timeoutIds.forEach(id => clearTimeout(id))
      el.innerHTML = ''
    }
  }, [])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes scanline { 0% { transform: translateY(-10%); } 100% { transform: translateY(120%); } }
        .scanline { position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,229,255,0.18), transparent); animation: scanline 11s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .scanline { animation: none !important; } }
      `}</style>
      <div ref={containerRef} className="absolute inset-0" />
      <div className="scanline" />
    </div>
  )
}

/* ──────────────────────── WORKS ─────────────────────────────────
   Subtle tint that changes with the active project.
   ────────────────────────────────────────────────────────────── */
function WorksBg({ activeIndex }: { activeIndex: number }) {
  const tints = [
    'radial-gradient(900px circle at 30% 50%, rgba(124,58,237,0.08), transparent 70%)',  // TaskFlow
    'radial-gradient(900px circle at 50% 50%, rgba(0,229,255,0.08), transparent 70%)',   // AURA AI
    'radial-gradient(900px circle at 70% 50%, rgba(0,255,136,0.08), transparent 70%)',   // OBSIDIAN
  ]
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
      style={{ background: tints[activeIndex] ?? tints[0] }}
    />
  )
}

/* ──────────────────────── SERVICES ──────────────────────────────
   Sparse drawn grid (drawn-in on view).
   ────────────────────────────────────────────────────────────── */
function ServicesBg() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes drawY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes drawX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .v-line { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(245,240,232,0.04); transform-origin: top center; animation: drawY 1.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .h-line { position: absolute; left: 0; right: 0; height: 1px; background: rgba(245,240,232,0.04); transform-origin: left center; animation: drawX 1.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @media (prefers-reduced-motion: reduce) { .v-line, .h-line { animation: none !important; transform: none !important; } }
      `}</style>
      <div className="v-line" style={{ left: '20%', animationDelay: '0.1s' }} />
      <div className="v-line" style={{ left: '50%', animationDelay: '0.25s' }} />
      <div className="v-line" style={{ left: '80%', animationDelay: '0.4s' }} />
      <div className="h-line" style={{ top: '30%', animationDelay: '0.15s' }} />
      <div className="h-line" style={{ top: '70%', animationDelay: '0.3s' }} />
    </div>
  )
}

/* ──────────────────────── PROCESS ───────────────────────────────
   Subtle grain texture only. The line glow lives in the section
   itself (so it can sit on the actual timeline element).
   ────────────────────────────────────────────────────────────── */
function ProcessBg() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}

/* ──────────────────────── CIERRE ────────────────────────────────
   Canvas vortex of orbiting particles.
   ────────────────────────────────────────────────────────────── */
function CierreBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = prefersReducedMotion()

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const N = reduced ? 25 : 60
    type O = { angle: number; speed: number; radius: number; radiusTarget: number; opacity: number; size: number }
    const orbs: O[] = Array.from({ length: N }, () => ({
      angle:        Math.random() * Math.PI * 2,
      speed:        0.0008 + Math.random() * 0.002,
      radius:       0,
      radiusTarget: 30 + Math.random() * 220,
      opacity:      0.1 + Math.random() * 0.2,
      size:         0.6 + Math.random() * 1.4,
    }))

    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const cx = w / 2
      const cy = h / 2
      ctx.clearRect(0, 0, w, h)
      const t = (now - start) / 1000
      for (const o of orbs) {
        // ease radius from 0 to target during the first 2.5s
        o.radius += (o.radiusTarget - o.radius) * 0.012
        o.angle += o.speed
        const x = cx + Math.cos(o.angle + t * 0.05) * o.radius
        const y = cy + Math.sin(o.angle + t * 0.05) * o.radius * 0.55
        ctx.beginPath()
        ctx.arc(x, y, o.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${o.opacity})`
        ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    if (!reduced) raf = requestAnimationFrame(loop)
    else loop(0)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
