import type { Metadata } from 'next'
import type { Locale } from '@/types'
import { HeroSection }     from '@/components/sections/HeroSection'
import { ManifestoSection } from '@/components/sections/ManifestoSection'
import { BriefingSection }  from '@/components/sections/BriefingSection'
import { WorksSection }     from '@/components/sections/WorksSection'
import { ServicesSection }  from '@/components/sections/ServicesSection'
import { ProcesoSection }   from '@/components/sections/ProcesoSection'
import { CierreSection }    from '@/components/sections/CierreSection'
import { Footer }           from '@/components/layout/Footer'

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
