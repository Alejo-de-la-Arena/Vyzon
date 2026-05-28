export type Locale = 'es' | 'en'

export interface Project {
  id:            string
  slug:          string
  number:        string
  name:          string
  accentColor:   string
  year:          string
  tags:          string[]
  siteUrl?:      string
  previewUrl?:   string  // URL para iframe preview (puede ser distinta a siteUrl o estática)
  deliveryDays?: number  // Días reales de entrega — usado en el modal
  es: ProjectContent
  en: ProjectContent
}

export interface ProjectContent {
  category:    string
  type:        string
  description: string
  challenge:   string
  solution:    string
  result:      string
}

export interface NavItem {
  label: string
  href:  string
  id:    string
}
