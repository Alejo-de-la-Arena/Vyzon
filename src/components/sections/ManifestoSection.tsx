'use client'

import { useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { gsap } from '@/lib/gsap'
import { SectionBackground } from './SectionBackground'

interface Principle {
  num:   string
  title: string
  sub:   string
  body:  string
}

const CLIP_HIDDEN_L = 'inset(0% 100% 0% 0%)'   // título oculto, se abre L→R
const CLIP_HIDDEN_R = 'inset(0% 0% 0% 100%)'   // subtítulo oculto, se abre R→L
const CLIP_OPEN      = 'inset(0% 0% 0% 0%)'

const q = (root: ParentNode, sel: string) => root.querySelector(sel) as HTMLElement

/**
 * Construye la sub-timeline scrubbeada de un principio dentro del timeline maestro.
 * `o` es el offset en "unidades %" del pin (0, 33, 66). Sub-estados:
 *   antesala   o+0  → o+8   : solo el número (opacity 0 → 0.04)
 *   emergencia o+8  → o+25  : número crece a 0.15 + transform; label + clip-path título/sub
 *   apogeo     o+25 → o+30  : body fade-in (todo visible)
 *   transición o+30 → o+33  : el principio sale (solo queda el número del siguiente)
 */
function buildPrinciple(master: gsap.core.Timeline, art: HTMLElement, o: number, i: number) {
  const number  = q(art, '.manifesto-number')
  const content = q(art, '.manifesto-content')
  const label   = q(art, '.manifesto-label')
  const title   = q(art, '.manifesto-title')
  const sub     = q(art, '.manifesto-sub')
  const body    = q(art, '.manifesto-body')
  const E = 'none' as const // el scrub aporta la suavidad; dentro de cada tween es lineal

  // ANTESALA — el número aparece (opacity 0 → 0.04)
  master.fromTo(number, { opacity: 0 }, { opacity: 0.04, ease: E, duration: 8 }, o)

  // EMERGENCIA + APOGEO — el número sube a su máximo (0.15) y ejecuta su transform propio
  master.to(number, { opacity: 0.15, ease: E, duration: 22 }, o + 8)
  if (i === 0) {
    // 01 — entra desde la izquierda
    master.fromTo(number, { xPercent: -15 }, { xPercent: 0, ease: E, duration: 22 }, o + 8)
  } else if (i === 1) {
    // 02 — centro fijo, solo crece levemente
    master.fromTo(number, { scale: 0.92 }, { scale: 1, ease: E, duration: 22 }, o + 8)
  } else {
    // 03 — el clímax: escala grande
    master.fromTo(number, { scale: 1 }, { scale: 1.6, ease: E, duration: 22 }, o + 8)
  }

  // EMERGENCIA — label, título (clip L→R) y subtítulo (clip R→L)
  master.fromTo(label, { opacity: 0, y: 8 }, { opacity: 1, y: 0, ease: E, duration: 4 }, o + 8)
  master.fromTo(title, { clipPath: CLIP_HIDDEN_L }, { clipPath: CLIP_OPEN, ease: E, duration: 12 }, o + 10)
  master.fromTo(sub,   { clipPath: CLIP_HIDDEN_R }, { clipPath: CLIP_OPEN, ease: E, duration: 10 }, o + 15)

  // APOGEO — el párrafo de expansión
  master.fromTo(body, { opacity: 0, y: 8 }, { opacity: 1, y: 0, ease: E, duration: 5 }, o + 25)

  // TRANSICIÓN — el principio se va (queda "solo el número" del siguiente)
  if (i < 2) {
    master.to(content, { opacity: 0, ease: E, duration: 3 }, o + 30)
    master.to(number,  { opacity: 0, ease: E, duration: 3 }, o + 30)
  } else {
    // Cierre del clímax: todo desaparece excepto el número 03, que hace fade final a 0
    master.to(content, { opacity: 0, ease: E, duration: 3 }, o + 30)
    master.to(number,  { opacity: 0, scale: 1.6, ease: E, duration: 4 }, o + 30)
  }
}

export function ManifestoSection() {
  const t = useTranslations('manifesto')

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef   = useRef<HTMLDivElement>(null)

  const principles: Principle[] = [
    { num: '01', title: t('p1Title'), sub: t('p1Sub'), body: t('p1Body') },
    { num: '02', title: t('p2Title'), sub: t('p2Sub'), body: t('p2Body') },
    { num: '03', title: t('p3Title'), sub: t('p3Sub'), body: t('p3Body') },
  ]

  useEffect(() => {
    const section = sectionRef.current
    const stage   = stageRef.current
    if (!section || !stage) return

    const mm = gsap.matchMedia(section)

    mm.add(
      {
        isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        isMobile:  '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (c) => {
        const conds = c.conditions as { isDesktop: boolean; isMobile: boolean; isReduced: boolean }
        const articles = Array.from(section.querySelectorAll<HTMLElement>('.manifesto-principle'))

        /* prefers-reduced-motion → todo visible, sin movimiento */
        if (conds.isReduced) {
          articles.forEach((art, i) => {
            gsap.set([q(art, '.manifesto-title'), q(art, '.manifesto-sub')], { clipPath: CLIP_OPEN })
            gsap.set([q(art, '.manifesto-label'), q(art, '.manifesto-body')], { opacity: 1, y: 0 })
            gsap.set(q(art, '.manifesto-number'), { opacity: 0.1, scale: i === 2 ? 1.3 : 1 })
          })
          return
        }

        /* MOBILE → principios apilados, reveal una vez al entrar (once:true), sin pin */
        if (conds.isMobile) {
          articles.forEach((art, i) => {
            const number = q(art, '.manifesto-number')
            const label  = q(art, '.manifesto-label')
            const title  = q(art, '.manifesto-title')
            const sub    = q(art, '.manifesto-sub')
            const body   = q(art, '.manifesto-body')

            const tl = gsap.timeline({
              scrollTrigger: { trigger: art, start: 'top 75%', once: true },
            })
            tl.to(number, { opacity: 0.08, scale: i === 2 ? 1.3 : 1, duration: 0.9, ease: 'power2.out' }, 0)
              .fromTo(label, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1)
              .to(title, { clipPath: CLIP_OPEN, duration: 0.8, ease: 'power3.out' }, 0.2)
              .to(sub,   { clipPath: CLIP_OPEN, duration: 0.7, ease: 'power3.out' }, 0.45)
              .fromTo(body, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.7)
          })
          return
        }

        /* DESKTOP → pin + scrub. El end se calcula dinámicamente desde el height
           del outer section (establecido con min-h-[550vh]) para garantizar que
           el pin se libera exactamente cuando el outer termina. */
        const master = gsap.timeline({
          scrollTrigger: {
            trigger:             section,
            start:               'top top',
            end:                 () => `+=${section.offsetHeight - window.innerHeight}`,
            pin:                 stage,
            scrub:               1,
            anticipatePin:       1,
            invalidateOnRefresh: true,
          },
        })
        master.to({}, { duration: 100 }, 0) // columna vertebral 0 → 100

        articles.forEach((art, i) => buildPrinciple(master, art, i * 33, i))
      },
      section,
    )

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      data-section="manifesto"
      className="relative md:min-h-[550vh]"
      style={{ zIndex: 20 }}
      aria-label="Manifiesto VYZON"
    >
      {/* El stage es lo que se pinea en desktop (h-screen). En mobile fluye normal. */}
      <div
        ref={stageRef}
        className="manifesto-stage relative md:h-screen md:overflow-hidden"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Ambient — fondo #080B12 + líneas de interferencia (variant manifesto) */}
        <SectionBackground variant="manifesto" />

        {/* Marcador de sección persistente durante el pin */}
        <div className="hidden md:block absolute top-10 left-0 right-0 z-20 pointer-events-none">
          <div className="container-site">
            <p className="font-mono text-label uppercase tracking-[0.3em] text-cyan/60">
              {t('label')}
            </p>
          </div>
        </div>

        {principles.map((p, i) => (
          <article
            key={p.num}
            data-index={i}
            className="manifesto-principle relative md:absolute md:inset-0 md:flex md:items-center py-24 md:py-0"
          >
            <div className="container-site relative w-full">
              {/* Número gigante decorativo — esqueleto espacial de la sección */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span
                  aria-hidden="true"
                  className="manifesto-number font-sans font-bold text-bone leading-none select-none"
                  style={{ fontSize: 'clamp(8rem, 20vw, 18rem)', opacity: 0, willChange: 'transform, opacity' }}
                >
                  {p.num}
                </span>
              </div>

              {/* Contenido del principio */}
              <div className="manifesto-content relative z-10" style={{ maxWidth: '52rem' }}>
                {/* Label — "01 — PRINCIPIO" */}
                <p
                  className="manifesto-label font-mono text-cyan"
                  style={{ opacity: 0, fontSize: '12px', letterSpacing: '0.3em', marginBottom: '24px' }}
                >
                  {p.num}
                  <span className="text-bone-subtle"> — {t('principleLabel')}</span>
                </p>

                {/* Título — clip-path reveal izquierda → derecha */}
                <h3
                  className="manifesto-title font-sans font-bold text-bone"
                  style={{
                    clipPath:      CLIP_HIDDEN_L,
                    fontSize:      'clamp(40px, 6vw, 84px)',
                    lineHeight:    1.02,
                    letterSpacing: '-0.03em',
                    marginBottom:  '6px',
                  }}
                >
                  {p.title}
                </h3>

                {/* Subtítulo — clip-path reveal derecha → izquierda */}
                <p
                  className="manifesto-sub font-sans italic text-bone/45"
                  style={{
                    clipPath:      CLIP_HIDDEN_R,
                    fontSize:      'clamp(28px, 4vw, 56px)',
                    fontWeight:    300,
                    lineHeight:    1.05,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {p.sub}
                </p>

                {/* Body — párrafo de expansión (apogeo) */}
                <p
                  className="manifesto-body font-mono text-bone/55"
                  style={{ opacity: 0, fontSize: '15px', lineHeight: 1.7, marginTop: '28px', maxWidth: '52ch' }}
                >
                  {p.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
