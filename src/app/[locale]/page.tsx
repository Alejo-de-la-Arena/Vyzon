import type { Metadata } from 'next'
import type { Locale } from '@/types'
import dynamic from 'next/dynamic'
import { HeroSection }     from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { Footer }          from '@/components/layout/Footer'

// Secciones pesadas (canvas, GSAP pins, scrub) — carga diferida, cliente-only.
// No bloquean el bundle inicial; Hero y Nav hidratán primero.
const ManifestoSection = dynamic(
  () => import('@/components/sections/ManifestoSection').then(m => m.ManifestoSection),
  { ssr: false }
)
const BriefingSection = dynamic(
  () => import('@/components/sections/BriefingSection').then(m => m.BriefingSection),
  { ssr: false }
)
const WorksSection = dynamic(
  () => import('@/components/sections/WorksSection').then(m => m.WorksSection),
  { ssr: false }
)
const ProcesoSection = dynamic(
  () => import('@/components/sections/ProcesoSection').then(m => m.ProcesoSection),
  { ssr: false }
)
const CierreSection = dynamic(
  () => import('@/components/sections/CierreSection').then(m => m.CierreSection),
  { ssr: false }
)

interface HomePageProps {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'
  return {
    title: isEn
      ? 'VYZON — Premium Technology Agency'
      : 'VYZON — Agencia de Tecnología Premium',
    description: isEn
      ? 'We build software, web and automations for startups and entrepreneurs across LATAM.'
      : 'Construimos software, webs y automatizaciones para startups y emprendedores de LATAM.',
  }
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ManifestoSection />
      <BriefingSection />
      <WorksSection />
      <ServicesSection />
      <ProcesoSection />
      <CierreSection />
      <Footer />
    </main>
  )
}
