import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id:          'taskflow',
    slug:        'taskflow',
    number:      '01',
    name:        'TaskFlow',
    accentColor: '#7C3AED',
    year:        '2025',
    tags:        ['Next.js', 'TypeScript', 'Framer Motion', 'TailwindCSS', 'Supabase', 'Vercel'],
    siteUrl:     undefined,
    deliveryDays: 9,
    es: {
      category:    'SaaS / Gestión de Tareas',
      type:        'Landing SaaS',
      description: 'Plataforma de gestión de tareas para equipos remotos. Diseño minimalista, animaciones precisas, conversión optimizada.',
      challenge:   'El cliente gestionaba proyectos con una combinación de Notion, hojas de cálculo y mensajes de Slack que nadie leía dos veces. El equipo era pequeño pero distribuido en tres husos horarios. Necesitaban una herramienta propia: simple de usar, sin la sobrecarga de Jira ni la informalidad de los chats.\n\nEl desafío de diseño era claro: máxima funcionalidad con mínima fricción visual. Cada elemento en pantalla tenía que ganar su lugar.',
      solution:    'Construimos una aplicación web en Next.js con un modelo de datos simple: proyectos, tareas, estados. Sin jerarquías complejas ni configuraciones que abrumen.\n\nLas animaciones con Framer Motion hacen el trabajo invisiblemente: confirman cada acción del usuario sin distraer del flujo. La interfaz en dark mode reduce la fatiga visual en sesiones largas. El diseño responsivo prioriza desktop con una experiencia mobile completa.\n\nDeploy en Vercel con actualización en tiempo real. De brief a producción: 9 días.',
      result:      'El equipo adoptó TaskFlow en la primera semana sin onboarding formal. La claridad visual redujo el tiempo de coordinación en reuniones. El cliente reportó que por primera vez todos usaban la misma herramienta sin que nadie tuviera que recordárselo.',
    },
    en: {
      category:    'SaaS / Task Management',
      type:        'SaaS Landing',
      description: 'Task management platform for remote teams. Minimalist design, precise animations, optimized conversion.',
      challenge:   'The client managed projects with a combination of Notion, spreadsheets, and Slack messages no one read twice. The team was small but distributed across three time zones. They needed their own tool: simple to use, without Jira\'s overhead or the informality of chat.\n\nThe design challenge was clear: maximum functionality with minimum visual friction. Every element on screen had to earn its place.',
      solution:    'We built a Next.js web application with a simple data model: projects, tasks, states. No complex hierarchies or configurations that overwhelm.\n\nFramer Motion animations do the work invisibly — confirming every user action without disrupting flow. The dark mode interface reduces visual fatigue in long sessions. Responsive design prioritizes desktop with a complete mobile experience.\n\nDeploy on Vercel with real-time updates. From brief to production: 9 days.',
      result:      'The team adopted TaskFlow in the first week without formal onboarding. The visual clarity reduced coordination time in meetings. The client reported that for the first time everyone used the same tool without anyone having to remind them.',
    },
  },
  {
    id:          'aura-ai',
    slug:        'aura-ai',
    number:      '02',
    name:        'AURA AI',
    accentColor: '#00E5FF',
    year:        '2026',
    tags:        ['Next.js', 'TypeScript', 'GSAP', 'Three.js', 'TailwindCSS', 'Framer Motion', 'Vercel'],
    siteUrl:     undefined,
    deliveryDays: 14,
    es: {
      category:    'Inteligencia Artificial / Dashboard',
      type:        'Plataforma IA',
      description: 'Landing para plataforma enterprise de IA. Animaciones técnicas, demos interactivas, narrativa de producto.',
      challenge:   'AURA AI es una plataforma de análisis de datos para empresas medianas. Su producto es técnicamente sofisticado y difícil de explicar en una landing page sin caer en jerga que aleja a los decisores de negocio.\n\nEl cliente tenía un producto funcional pero sin identidad visual fuerte. La competencia en el espacio enterprise de IA es densa y homogénea — todos los sitios parecen iguales: azul, corporate, aburrido. El desafío era posicionar AURA AI como la alternativa premium y legible.',
      solution:    'Diseñamos la narrativa visual en torno a la idea de "datos que tienen sentido": animaciones que simulan análisis en tiempo real, demos interactivas que el usuario puede manipular, y una jerarquía visual que guía al visitante de "qué es" a "por qué me importa" a "cómo empiezo".\n\nEl stack técnico (Next.js + GSAP + Three.js) permitió animaciones complejas sin sacrificar performance. Lighthouse score: 95+. Las demos interactivas son componentes React puros, sin dependencias pesadas de visualización de datos.',
      result:      'El tiempo de sesión promedio aumentó significativamente tras el rediseño. Los demos interactivos se convirtieron en el elemento más compartido por el equipo de ventas en presentaciones. El cliente cerró dos contratos enterprise en las semanas siguientes al lanzamiento.',
    },
    en: {
      category:    'Artificial Intelligence / Dashboard',
      type:        'AI Platform',
      description: 'Landing for an enterprise AI platform. Technical animations, interactive demos, product narrative.',
      challenge:   'AURA AI is a data analytics platform for mid-size companies. Their product is technically sophisticated and hard to explain on a landing page without jargon that distances business decision-makers.\n\nThe client had a functional product but no strong visual identity. The competition in enterprise AI is dense and homogeneous — every site looks the same: blue, corporate, boring. The challenge was positioning AURA AI as the premium, legible alternative.',
      solution:    'We designed the visual narrative around the idea of "data that makes sense": animations that simulate real-time analysis, interactive demos users can manipulate, and a visual hierarchy that guides visitors from "what is this" to "why should I care" to "how do I start".\n\nThe tech stack (Next.js + GSAP + Three.js) enabled complex animations without sacrificing performance. Lighthouse score: 95+. The interactive demos are pure React components, without heavy data visualization dependencies.',
      result:      'Average session time increased significantly after the redesign. The interactive demos became the most shared element by the sales team in presentations. The client closed two enterprise contracts in the weeks following launch.',
    },
  },
  {
    id:          'obsidian',
    slug:        'obsidian',
    number:      '03',
    name:        'OBSIDIAN',
    accentColor: '#00FF88',
    year:        '2026',
    tags:        ['Next.js', 'Three.js', 'GSAP', 'ScrollTrigger', 'WebGL', 'R3F', 'TailwindCSS', 'TypeScript', 'Vercel'],
    siteUrl:     undefined,
    deliveryDays: 18,
    es: {
      category:    'Marca de Lujo / Fashion Tech',
      type:        'Marca de Lujo',
      description: 'Marca de relojes mecánicos de edición limitada. Experiencia cinematográfica, modelos 3D, scroll storytelling.',
      challenge:   'OBSIDIAN es una marca de relojes mecánicos artesanales con producción limitada a 200 unidades por año. El producto justifica un precio premium, pero el sitio anterior era genérico — podría haber sido de cualquier marca de moda de precio medio.\n\nEl desafío: construir una presencia digital que justifique el valor percibido del producto. El visitante tiene que sentir que está accediendo a algo exclusivo antes de ver el primer precio. El sitio es parte del producto, no solo su presentación.',
      solution:    'Construimos una experiencia full-scroll donde cada sección se revela cinematográficamente. Los modelos 3D de los relojes (Three.js / WebGL) rotan y responden al scroll del usuario — el visitante puede examinar el producto desde todos los ángulos sin imágenes estáticas.\n\nGSAP maneja todas las transiciones: el timing es deliberadamente lento para crear peso y presencia. No hay prisa. El sitio respeta el ritmo del lujo. La paleta negra absoluta con acentos verdes refuerza la sensación de exclusividad en cada scroll.',
      result:      'La tasa de rebote cayó a la mitad comparada con el sitio anterior. Los visitantes pasan en promedio 4 minutos en la experiencia de producto. OBSIDIAN agotó su edición de 200 unidades en 3 semanas post-lanzamiento. El sitio fue mencionado en dos publicaciones especializadas de diseño web.',
    },
    en: {
      category:    'Luxury Brand / Fashion Tech',
      type:        'Luxury Brand',
      description: 'Limited edition mechanical watch brand. Cinematic experience, 3D models, scroll storytelling.',
      challenge:   'OBSIDIAN is a mechanical watch brand with production limited to 200 units per year. The product justifies a premium price, but the previous site was generic — it could have been any mid-price fashion brand.\n\nThe challenge: build a digital presence that justifies the product\'s perceived value. The visitor must feel they\'re accessing something exclusive before seeing the first price. The site is part of the product, not just its presentation.',
      solution:    'We built a full-scroll experience where each section reveals cinematically. 3D watch models (Three.js / WebGL) rotate and respond to user scroll — visitors can examine the product from all angles without static images.\n\nGSAP handles all transitions: timing is deliberately slow to create weight and presence. No rush. The site respects the pace of luxury. The absolute black palette with green accents reinforces the sense of exclusivity at every scroll.',
      result:      'Bounce rate dropped by half compared to the previous site. Visitors spend an average of 4 minutes in the product experience. OBSIDIAN sold out its 200-unit edition three weeks after launch. The site was featured in two specialized web design publications.',
    },
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}

export function getAdjacentProjects(slug: string): {
  prev: Project | null
  next: Project | null
} {
  const index = projects.findIndex(p => p.slug === slug)
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  }
}
