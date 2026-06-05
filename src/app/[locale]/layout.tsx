import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { LenisProvider }       from '@/components/providers/LenisProvider'
import { Navigation }          from '@/components/layout/Navigation'
import { CustomCursor }        from '@/components/ui/CustomCursor'
import { ScrollColorManager }  from '@/components/ui/ScrollColorManager'
import { ScrollProgressBar }   from '@/components/ui/ScrollProgressBar'
import type { Locale } from '@/types'
import '../globals.css'

// ── Fuentes ────────────────────────────────────────────────────────
const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display:  'swap',
})

const geistMono = localFont({
  src:      '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight:   '100 900',
  display:  'swap',
})

// ── Metadata base ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default:  'VYZON — Agencia de Tecnología Premium',
    template: '%s | VYZON',
  },
  description:
    'Construimos software, webs y automatizaciones para startups y emprendedores de LATAM. Velocidad real, calidad premium.',
  keywords:  ['agencia web', 'desarrollo software', 'automatizaciones', 'startups', 'LATAM', 'Next.js', 'Buenos Aires'],
  authors:   [{ name: 'VYZON' }],
  creator:   'VYZON',
  metadataBase: new URL('https://vyzon.dev'),
  openGraph: {
    type:        'website',
    siteName:    'VYZON',
    title:       'VYZON — Agencia de Tecnología Premium',
    description: 'Construimos software, webs y automatizaciones para startups y emprendedores de LATAM.',
    locale:      'es_AR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'VYZON — Agencia de Tecnología Premium',
    description: 'Construimos software, webs y automatizaciones para startups y emprendedores de LATAM.',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

// ── Layout ─────────────────────────────────────────────────────────
interface LocaleLayoutProps {
  children: React.ReactNode
  params:   Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`
          ${spaceGrotesk.variable}
          ${geistMono.variable}
          font-sans
          bg-black
          text-bone
          antialiased
        `}
      >
        <NextIntlClientProvider messages={messages}>
          <LenisProvider>
            <CustomCursor />
            <ScrollProgressBar />
            <ScrollColorManager />
            <Navigation />
            {children}
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

// ── Static params ──────────────────────────────────────────────────
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}
