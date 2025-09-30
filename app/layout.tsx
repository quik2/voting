import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry'

export const metadata: Metadata = {
  title: 'Voting System',
  description: 'Recruitment voting system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
