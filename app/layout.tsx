import type { Metadata } from 'next'
import { Poppins, Playfair_Display } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans' 
})
const playfair = Playfair_Display({ 
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
      <body className={`${poppins.variable} ${playfair.variable} ${poppins.className}`}>{children}</body>
    </html>
  )
}
