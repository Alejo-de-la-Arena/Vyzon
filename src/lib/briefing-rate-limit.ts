import { createHash } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const REQUEST_TIMEOUT_MS = 1_500

type LimitName = 'hourly' | 'daily' | 'global'

export type BriefingRateLimitResult =
  | { allowed: true }
  | { allowed: false; limit: LimitName }
  | { allowed: false; limit: 'unavailable' }

interface Limiters {
  hourly: Ratelimit
  daily: Ratelimit
  global: Ratelimit
}

let limiters: Limiters | undefined

function getLimiters(): Limiters | null {
  if (limiters) return limiters

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  const redis = Redis.fromEnv()
  const common = { redis, analytics: true, ephemeralCache: false }

  limiters = {
    hourly: new Ratelimit({ ...common, prefix: 'vyzon:briefing:ip:hourly', limiter: Ratelimit.slidingWindow(3, '1 h') }),
    daily: new Ratelimit({ ...common, prefix: 'vyzon:briefing:ip:daily', limiter: Ratelimit.slidingWindow(10, '24 h') }),
    global: new Ratelimit({ ...common, prefix: 'vyzon:briefing:global:daily', limiter: Ratelimit.slidingWindow(50, '24 h') }),
  }

  return limiters
}

function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-vercel-forwarded-for') ?? headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? headers.get('x-real-ip')?.trim()
  return ip || null
}

function toIdentifier(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

async function within<T>(promise: Promise<T>, durationMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Rate limit check timed out')), durationMs)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function checkBriefingRateLimit(headers: Headers): Promise<BriefingRateLimitResult> {
  const configuredLimiters = getLimiters()
  const ip = getClientIp(headers)

  if (!configuredLimiters || !ip) return { allowed: false, limit: 'unavailable' }

  try {
    const identifier = toIdentifier(ip)
    const hourly = await within(configuredLimiters.hourly.limit(identifier), REQUEST_TIMEOUT_MS)
    if (!hourly.success) return { allowed: false, limit: 'hourly' }

    const daily = await within(configuredLimiters.daily.limit(identifier), REQUEST_TIMEOUT_MS)
    if (!daily.success) return { allowed: false, limit: 'daily' }

    const global = await within(configuredLimiters.global.limit('all-visitors'), REQUEST_TIMEOUT_MS)
    if (!global.success) return { allowed: false, limit: 'global' }

    return { allowed: true }
  } catch {
    // Fail closed: a Redis outage must not create an unmetered Gemini path.
    return { allowed: false, limit: 'unavailable' }
  }
}
