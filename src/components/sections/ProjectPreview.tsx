'use client'

import { useState, useRef, useEffect } from 'react'
import type { Project } from '@/types'

interface Props {
  project:      Project
  exploreLabel: string
}

/**
 * ProjectPreview — render an iframe of the live project if siteUrl/previewUrl exists.
 * Falls back to a "faux browser" mock chrome with the project name as visual.
 *
 * Hover: iframe scales to 1.04, overlay fades, "Explorar →" button appears.
 * The iframe stays pointer-events:none by default (no interaction) so it acts
 * like a live preview without trapping the cursor or scroll.
 */
export function ProjectPreview({ project, exploreLabel }: Props) {
  const previewUrl = project.previewUrl || project.siteUrl || null
  const [hovered, setHovered] = useState(false)
  const [iframeOk, setIframeOk] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Detect iframe load failure (CORS / X-Frame-Options).
  // Iframes silently fail on X-Frame-Options, so we use a load timeout heuristic.
  useEffect(() => {
    if (!previewUrl) return
    const iframe = iframeRef.current
    if (!iframe) return
    let loaded = false
    const onLoad = () => { loaded = true }
    iframe.addEventListener('load', onLoad)
    const timer = setTimeout(() => {
      if (!loaded) setIframeOk(false)
    }, 5000)
    return () => {
      iframe.removeEventListener('load', onLoad)
      clearTimeout(timer)
    }
  }, [previewUrl])

  const showIframe = previewUrl && iframeOk

  return (
    <div
      className="project-preview-container relative w-full overflow-hidden rounded-md transition-transform duration-500 ease-out"
      style={{
        aspectRatio: '16/9',
        border: `1px solid ${project.accentColor}33`,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Iframe (when URL exists and loads) */}
      {showIframe && (
        <iframe
          ref={iframeRef}
          src={previewUrl!}
          loading="lazy"
          title={project.name}
          style={{
            width:           '200%',
            height:          '200%',
            transform:       'scale(0.5)',
            transformOrigin: 'top left',
            pointerEvents:   'none',
            border:          'none',
            background:      '#fff',
          }}
        />
      )}

      {/* Fallback "faux browser" chrome — used when no URL or iframe fails */}
      {!showIframe && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${project.accentColor}22 0%, ${project.accentColor}06 100%)`,
          }}
        >
          {/* Mock browser top bar */}
          <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center gap-2 border-b border-bone-faint/[0.06]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-50" />
            <span
              className="ml-4 font-mono text-[10px] text-bone-faint tracking-[0.15em] uppercase"
            >
              vyzon.dev/work/{project.slug}
            </span>
          </div>
          {/* Big project name */}
          <div className="absolute inset-0 flex items-center justify-center pt-8">
            <span
              className="font-sans font-bold select-none text-center"
              style={{
                fontSize:      'clamp(60px, 9vw, 160px)',
                color:         `${project.accentColor}1f`,
                lineHeight:    0.9,
                letterSpacing: '-0.04em',
              }}
            >
              {project.name}
            </span>
          </div>
        </div>
      )}

      {/* Overlay — gradient + meta + name */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(to top,
            rgba(0,0,0,0.75) 0%,
            rgba(0,0,0,0) 40%,
            rgba(0,0,0,0) 60%,
            rgba(0,0,0,0.35) 100%)`,
          opacity: hovered ? 0.4 : 1,
        }}
      >
        {/* Top: number + year + type */}
        <div
          className="absolute top-4 left-5 flex items-center gap-4 font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}
        >
          <span>{project.number}</span>
          <span>·</span>
          <span>{project.year}</span>
        </div>

        {/* Bottom: project name */}
        <div className="absolute bottom-5 left-5 right-5">
          <div
            className="font-sans font-bold text-white"
            style={{
              fontSize:      'clamp(24px, 2.6vw, 40px)',
              letterSpacing: '-0.02em',
              lineHeight:    1,
            }}
          >
            {project.name}
          </div>
        </div>
      </div>

      {/* Hover CTA — centered explore button */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <span
          className="font-mono text-label uppercase tracking-widest px-6 py-3 bg-black/60 backdrop-blur-md border border-cyan/60 text-cyan"
        >
          {exploreLabel} ↗
        </span>
      </div>
    </div>
  )
}
