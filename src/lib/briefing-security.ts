import { z } from 'zod'

const configuredOrigins = process.env.BRIEFING_ALLOWED_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean) ?? []

const developmentOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']

export const briefingRequestSchema = z.object({
  message: z.string().trim().min(10).max(2_000),
  history: z.string().max(1_600).optional().default(''),
  locale: z.enum(['es', 'en']).optional().default('es'),
  step: z.enum(['validate', 'generate']),
}).strict()

export type BriefingRequest = z.infer<typeof briefingRequestSchema>

function getOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function hasAllowedOrigin(headers: Headers): boolean {
  const allowedOrigins = configuredOrigins.length > 0
    ? configuredOrigins
    : process.env.NODE_ENV === 'production'
      ? []
      : developmentOrigins
  const origin = headers.get('origin')
  const referer = headers.get('referer')
  const origins = [origin, referer ? getOrigin(referer) : null].filter(
    (value): value is string => Boolean(value),
  )

  return origins.length > 0 && origins.every((value) => allowedOrigins.includes(value))
}
