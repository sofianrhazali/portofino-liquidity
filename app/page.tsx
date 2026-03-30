'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const [ticker, setTicker] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticker.trim()) {
      router.push(`/results/${ticker.trim().toLowerCase()}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#161B28' }}>
      {/* Nav */}
      <nav className="px-8 py-6 flex items-center justify-between">
        <Image src="/logo.png" alt="Portofino" width={180} height={40} style={{ objectFit: 'contain' }} />
        <a href="https://portofino.tech" className="text-gray-400 text-sm hover:text-white transition-colors">
          portofino.tech →
        </a>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-xs uppercase tracking-widest mb-6 font-medium" style={{ color: '#0099CC' }}>
          Institutional Liquidity Analysis
        </p>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-3xl leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Check Your Token's Liquidity
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
          Get an institutional-grade analysis of your token's market health — free, in seconds.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter ticker (e.g. OSMO, AXL, ONDO)"
            className="w-full px-5 py-4 rounded-xl text-lg mb-4 outline-none text-white placeholder-gray-500"
            style={{ 
              backgroundColor: '#1E2436',
              border: '1px solid rgba(0,153,204,0.3)',
            }}
          />
          <button
            type="submit"
            className="w-full md:w-auto px-10 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0099CC' }}
          >
            Analyse My Token
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-5">
          No signup required. Report delivered instantly.
        </p>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-white/10 flex items-center justify-between">
        <p className="text-gray-600 text-xs">© 2025 Portofino Technologies. All rights reserved.</p>
        <p className="text-gray-600 text-xs">FCA · VQF/FINMA · BVI VASP</p>
      </footer>
    </main>
  )
}
