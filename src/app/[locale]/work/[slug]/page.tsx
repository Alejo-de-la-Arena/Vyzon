import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getProjectBySlug, getAdjacentProjects, projects } from '@/data/projects'
import { routing } from '@/i18n/routing'
import { Footer } from '@/components/layout/Footer'
import type { Locale } from '@/types'

interface WorkPageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    projects.map(p => ({ locale, slug: p.slug }))
  )
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  const content = locale === 'en' ? project.en : project.es
  return {
    title: `${project.name} — ${content.category}`,
    description: content.description,
  }
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { locale, slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const t          = await getTranslations('work')
  const content    = locale === 'en' ? project.en : project.es
  const localePath = locale === 'en' ? '/en' : ''
  const { prev, next } = getAdjacentProjects(slug)

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[60vh] flex flex-col justify-end py-section pt-36 bg-black overflow-hidden"
        style={{ borderBottom: `1px solid ${project.accentColor}20` }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(800px circle at 30% 60%, ${project.accentColor}10, transparent 70%)`,
          }}
        />

        <div className="container-site relative z-10">
          <p className="font-mono text-label uppercase tracking-[0.2em] text-bone-faint mb-8">
            <Link href={`${localePath}/#work`} className="hover:text-bone transition-colors duration-250">
              {t('breadcrumbBase')}
            </Link>
            {' / '}
            <span style={{ color: project.accentColor }}>{project.name}</span>
          </p>

          <p
            className="font-mono text-label uppercase tracking-[0.2em] mb-4"
            style={{ color: project.accentColor }}
          >
            {content.category}
          </p>

          <h1 className="font-sans text-display-xl text-bone mb-8">
            {project.name}
          </h1>

          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span
                key={tag}
                className="font-mono text-mono-sm text-bone-subtle border border-bone-faint/15 px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-black py-section">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-16">
              <ContentBlock heading={t('challengeLabel')} text={content.challenge} />
              <ContentBlock heading={t('solutionLabel')}  text={content.solution} />

              {/* Result */}
              <div
                className="border border-bone-faint/[0.08] p-8"
                style={{ background: `${project.accentColor}06` }}
              >
                <h2
                  className="font-mono text-label uppercase tracking-[0.25em] mb-5"
                  style={{ color: project.accentColor }}
                >
                  {t('resultLabel')}
                </h2>
                <p className="font-sans text-body-lg text-bone-muted leading-relaxed">
                  {content.result}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              <div className="border border-bone-faint/[0.08] p-6 space-y-6">
                <SidebarItem label={t('yearLabel')}     value={project.year} />
                <SidebarItem label={t('categoryLabel')} value={content.category} />
                <SidebarItem label={t('clientLabel')}   value={t('clientValue')} />
                <SidebarItem label={t('stackLabel')}    value={project.tags.join(' · ')} />
              </div>

              {project.siteUrl && (
                <a
                  href={project.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-between
                    font-mono text-label uppercase tracking-widest
                    border border-bone/30 text-bone px-6 py-4 w-full
                    hover:border-bone/60 hover:bg-bone/5
                    transition-all duration-250
                  "
                >
                  {t('visitSite')} ↗
                </a>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Adjacent projects */}
      <nav
        aria-label="Proyectos adyacentes"
        className="border-t border-bone-faint/[0.08] bg-gray-900"
      >
        <div className="container-site grid grid-cols-2 divide-x divide-bone-faint/[0.08]">
          {prev ? (
            <Link
              href={`${localePath}/work/${prev.slug}`}
              className="flex flex-col gap-2 py-10 pr-8 hover:bg-bone/[0.02] transition-colors duration-250 group"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-faint">
                ← {t('prevProject')}
              </span>
              <span className="font-sans text-display-md text-bone group-hover:text-bone/80 transition-colors duration-250">
                {prev.name}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`${localePath}/work/${next.slug}`}
              className="flex flex-col gap-2 py-10 pl-8 text-right hover:bg-bone/[0.02] transition-colors duration-250 group"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-faint">
                {t('nextProject')} →
              </span>
              <span className="font-sans text-display-md text-bone group-hover:text-bone/80 transition-colors duration-250">
                {next.name}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>

      <Footer />
    </main>
  )
}

function ContentBlock({ heading, text }: { heading: string; text: string }) {
  return (
    <div>
      <h2 className="font-mono text-label uppercase tracking-[0.25em] text-cyan mb-6">
        {heading}
      </h2>
      <div className="space-y-4">
        {text.split('\n\n').map((para, i) => (
          <p key={i} className="font-sans text-body-lg text-bone-muted leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}

function SidebarItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-subtle mb-1">{label}</p>
      <p className="font-sans text-body-sm text-bone">{value}</p>
    </div>
  )
}
