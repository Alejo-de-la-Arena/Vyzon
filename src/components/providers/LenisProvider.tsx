'use client'

import { useEffect } from 'react'
import { createLenis, startLenisRaf, destroyLenis } from '@/lib/lenis'

interface LenisProviderProps {
  children: React.ReactNode
}

/**
 * LenisProvider — inicializa Lenis smooth scroll.
 * Debe envolver el contenido del layout, después del NextIntlClientProvider.
 */
export function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const lenis = createLenis()
    const stopRaf = startLenisRaf(lenis)

    return () => {
      stopRaf()
      destroyLenis()
    }
  }, [])

  return <>{children}</>
}
