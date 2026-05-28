import { redirect } from 'next/navigation'

/**
 * Root / → redirect to default locale (es).
 * next-intl middleware handles this for most cases,
 * but this ensures the root is never blank.
 */
export default function RootPage() {
  redirect('/es')
}
