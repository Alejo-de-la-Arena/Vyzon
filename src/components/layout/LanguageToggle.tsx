'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

/**
 * LanguageToggle — ES / EN switcher
 *
 * Swaps the locale prefix in the URL and navigates.
 * Fully functional from Fase 3.
 */
export function LanguageToggle() {
  const locale  = useLocale()
  const router  = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const targetLocale = locale === 'es' ? 'en' : 'es'
  const targetLabel  = locale === 'es' ? 'EN' : 'ES'

  function handleSwitch() {
    startTransition(() => {
      // Swap the locale segment in the current path
      let newPath = pathname

      if (locale === 'es') {
        // Currently on ES (no prefix) → add /en prefix
        newPath = `/en${pathname}`
      } else {
        // Currently on EN → remove /en prefix
        newPath = pathname.replace(/^\/en/, '') || '/'
      }

      router.push(newPath)
    })
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch to ${targetLocale.toUpperCase()}`}
      className={`
        font-mono text-label uppercase tracking-widest
        border border-bone-subtle/30
        text-bone
        px-3 py-1.5
        rounded-sm
        transition-all duration-250
        hover:border-bone-subtle/60
        focus-visible:outline-2 focus-visible:outline-cyan focus-visible:outline-offset-4
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isPending ? '···' : `[${targetLabel}]`}
    </button>
  )
}
