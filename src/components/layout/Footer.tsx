import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { projects } from '@/data/projects'

/**
 * Footer — componente de servidor.
 * Usa getTranslations / getLocale de next-intl/server.
 */
export async function Footer() {
  const t      = await getTranslations('footer')
  const locale = await getLocale()
  const localePath = locale === 'en' ? '/en' : ''

  const studioLinks = t.raw('studioLinks') as string[]

  return (
    <footer className="bg-[#050505] border-t border-bone-faint/[0.06] pt-16 pb-10">
      <div className="container-site">
        {/* Grid superior */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <p className="font-sans font-bold text-bone tracking-[0.15em] text-[22px] mb-4">
              VYZON
            </p>
            <p className="font-mono text-[11px] tracking-[0.1em] text-bone-faint leading-[1.8]">
              {t('tagline')}
            </p>
          </div>

          {/* Trabajos */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone-subtle mb-6">
              {t('colWork')}
            </p>
            {projects.map(p => (
              <Link
                key={p.id}
                href={`${localePath}/work/${p.slug}`}
                className="link-animated block text-[13px] text-bone-muted/70 hover:text-bone mb-3 transition-colors duration-250"
              >
                {p.name}
              </Link>
            ))}
          </div>

          {/* Estudio */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone-subtle mb-6">
              {t('colStudio')}
            </p>
            {(['services', 'process', 'contact'] as const).map((key, i) => (
              <a
                key={key}
                href={`${localePath}/#${key}`}
                className="link-animated block text-[13px] text-bone-muted/70 hover:text-bone mb-3 transition-colors duration-250"
              >
                {studioLinks[i]}
              </a>
            ))}
          </div>

          {/* Contacto */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone-subtle mb-6">
              {t('colContact')}
            </p>
            <a
              href={`mailto:${t('email')}`}
              className="link-animated block text-[13px] text-cyan hover:text-cyan-muted mb-3 transition-colors duration-250"
            >
              {t('email')}
            </a>
            <p className="text-[13px] text-bone-muted/50">
              {t('location')}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-bone-faint/[0.06] pt-8 flex justify-between items-center">
          <p className="font-mono text-[11px] text-bone-faint">
            {t('copyright')}
          </p>
          <p className="font-mono text-[11px] tracking-[0.2em] text-bone-faint">
            {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
