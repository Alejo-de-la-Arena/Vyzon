/**
 * Briefing IA — análisis local sin API.
 *
 * Detecta keywords del input (ES + EN) y devuelve un documento técnico
 * VYZON con tipo, stack, timeline, inversión, descripción y próximos pasos.
 */

export interface BriefingResult {
  tipo:        string
  stack:       string[]
  timeline:    string
  inversion:   string
  descripcion: string
  pasos:       string[]
}

export type Locale = 'es' | 'en'

export function analyzeProject(text: string, locale: Locale): BriefingResult {
  const input = text.toLowerCase()
  const isES  = locale === 'es'

  // ── Detección de tipo de proyecto ─────────────────────────────────
  const isEcommerce  = /tienda|ecommerce|e-commerce|shop|venta|producto|carrito|checkout|woocommerce|shopify/.test(input)
  const isApp        = /app|aplicaci[oó]n|dashboard|saas|plataforma|sistema|gesti[oó]n|crm|erp|inventario|admin/.test(input)
  const isAutomation = /automatiz|workflow|bot|scraping|integra|zapier|n8n|proceso|repetitiv|\bia\b|inteligencia/.test(input)
  const isSoftware   = /software|programa|mvp|startup|producto digital|desarrollo|backend/.test(input)
  const isPortfolio  = /portfolio|portafolio|agencia|estudio|creativ|dise[nñ]o|fotograf/.test(input)

  if (isEcommerce) {
    return isES ? {
      tipo:        'E-commerce Premium',
      stack:       ['Next.js 14', 'Shopify Hydrogen', 'Stripe', 'TailwindCSS'],
      timeline:    '15 a 25 días hábiles',
      inversion:   'USD 5.000 - 12.000',
      descripcion: 'Tienda online de alto rendimiento con experiencia de compra optimizada para conversión.',
      pasos: [
        'Definir catálogo, integraciones de pago y flujo de checkout',
        'Diseñar experiencia de producto y carrito con foco en conversión',
        'Conectar pasarela de pago, inventario y panel de administración',
      ],
    } : {
      tipo:        'Premium E-commerce',
      stack:       ['Next.js 14', 'Shopify Hydrogen', 'Stripe', 'TailwindCSS'],
      timeline:    '15 to 25 business days',
      inversion:   'USD 5,000 - 12,000',
      descripcion: 'High-performance online store with optimized shopping experience for conversion.',
      pasos: [
        'Define catalog, payment integrations and checkout flow',
        'Design product experience and cart focused on conversion',
        'Connect payment gateway, inventory and admin panel',
      ],
    }
  }

  if (isAutomation) {
    return isES ? {
      tipo:        'Automatización con IA',
      stack:       ['n8n', 'Claude API', 'Python', 'PostgreSQL'],
      timeline:    '10 a 20 días hábiles',
      inversion:   'USD 2.000 - 8.000',
      descripcion: 'Sistema de automatización inteligente que elimina tareas repetitivas y conecta herramientas existentes.',
      pasos: [
        'Mapear procesos actuales e identificar cuellos de botella automatizables',
        'Diseñar arquitectura de workflows e integraciones entre sistemas',
        'Implementar, testear y documentar los flujos automatizados',
      ],
    } : {
      tipo:        'AI Automation',
      stack:       ['n8n', 'Claude API', 'Python', 'PostgreSQL'],
      timeline:    '10 to 20 business days',
      inversion:   'USD 2,000 - 8,000',
      descripcion: 'Intelligent automation system that eliminates repetitive tasks and connects existing tools.',
      pasos: [
        'Map current processes and identify automatable bottlenecks',
        'Design workflow architecture and system integrations',
        'Implement, test and document automated flows',
      ],
    }
  }

  if (isApp || isSoftware) {
    return isES ? {
      tipo:        'Aplicación Web (MVP)',
      stack:       ['Next.js 14', 'TypeScript', 'Supabase', 'TailwindCSS'],
      timeline:    '20 a 35 días hábiles',
      inversion:   'USD 8.000 - 20.000',
      descripcion: 'Producto digital funcional con autenticación, base de datos y panel de administración incluidos.',
      pasos: [
        'Definir alcance del MVP y arquitectura de datos con el equipo',
        'Construir el core de la aplicación con autenticación y lógica de negocio',
        'QA exhaustivo, deploy en producción y documentación técnica',
      ],
    } : {
      tipo:        'Web Application (MVP)',
      stack:       ['Next.js 14', 'TypeScript', 'Supabase', 'TailwindCSS'],
      timeline:    '20 to 35 business days',
      inversion:   'USD 8,000 - 20,000',
      descripcion: 'Functional digital product with authentication, database and admin panel included.',
      pasos: [
        'Define MVP scope and data architecture with the team',
        'Build application core with authentication and business logic',
        'Exhaustive QA, production deploy and technical documentation',
      ],
    }
  }

  if (isPortfolio) {
    return isES ? {
      tipo:        'Portfolio Cinematográfico',
      stack:       ['Next.js 14', 'GSAP', 'Three.js', 'TailwindCSS'],
      timeline:    '12 a 18 días hábiles',
      inversion:   'USD 3.500 - 8.000',
      descripcion: 'Experiencia web inmersiva que convierte visitas en leads mediante animaciones de alto impacto.',
      pasos: [
        'Definir concepto visual, paleta y sistema de animaciones',
        'Desarrollar las secciones con GSAP y efectos cinematográficos',
        'Optimizar performance, SEO y deploy en producción',
      ],
    } : {
      tipo:        'Cinematic Portfolio',
      stack:       ['Next.js 14', 'GSAP', 'Three.js', 'TailwindCSS'],
      timeline:    '12 to 18 business days',
      inversion:   'USD 3,500 - 8,000',
      descripcion: 'Immersive web experience that converts visits into leads through high-impact animations.',
      pasos: [
        'Define visual concept, palette and animation system',
        'Develop sections with GSAP and cinematic effects',
        'Optimize performance, SEO and production deploy',
      ],
    }
  }

  // Default — Landing Premium
  return isES ? {
    tipo:        'Landing Premium',
    stack:       ['Next.js 14', 'TailwindCSS', 'Framer Motion', 'GSAP'],
    timeline:    '7 a 12 días hábiles',
    inversion:   'USD 1.500 - 4.000',
    descripcion: 'Landing page de alto impacto con animaciones premium, optimizada para conversión y posicionamiento.',
    pasos: [
      'Brief de marca, objetivos de conversión y referencias visuales',
      'Diseño y desarrollo de secciones con animaciones cinematográficas',
      'Deploy, configuración de analytics y optimización SEO on-page',
    ],
  } : {
    tipo:        'Premium Landing',
    stack:       ['Next.js 14', 'TailwindCSS', 'Framer Motion', 'GSAP'],
    timeline:    '7 to 12 business days',
    inversion:   'USD 1,500 - 4,000',
    descripcion: 'High-impact landing page with premium animations, optimized for conversion and positioning.',
    pasos: [
      'Brand brief, conversion goals and visual references',
      'Design and development of sections with cinematic animations',
      'Deploy, analytics setup and on-page SEO optimization',
    ],
  }
}
