/**
 * Root Layout — minimal wrapper.
 * The actual layout with fonts and providers lives in app/[locale]/layout.tsx.
 * This file is required by Next.js but kept thin.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
