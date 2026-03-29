import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'Portofino Liquidity Check',
  description: 'Get an institutional-grade analysis of your token\'s market health — free, in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} ${dmSans.className}`}>{children}</body>
    </html>
  )
}
