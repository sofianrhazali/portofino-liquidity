'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D1B3E' }}>
      {/* Nav */}
      <nav className="px-8 py-6">
        <span className="text-white text-xl font-semibold tracking-widest uppercase">
          Portofino
        </span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-3xl leading-tight">
          Check Your Token's Liquidity
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl">
          Get an institutional-grade analysis of your token's market health — free, in seconds.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter ticker (e.g. OSMO, AXL, ONDO)"
            className="w-full px-5 py-4 rounded-xl text-navy bg-white text-lg mb-4 outline-none focus:ring-2 focus:ring-teal-500"
            style={{ color: '#0D1B3E' }}
          />
          <button
            type="submit"
            className="w-full md:w-auto px-10 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1D6E73' }}
          >
            Analyse My Token
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-5">
          No signup required. Report delivered instantly.
        </p>
      </div>
    </main>
  )
}
