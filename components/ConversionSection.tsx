'use client'

import { useState } from 'react'

interface Props {
  ticker: string
  tokenData: any
}

export default function ConversionSection({ ticker, tokenData }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [projectName, setProjectName] = useState(ticker)
  const [loading, setLoading] = useState<'retainer' | 'call_option' | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Detect segment client-side for UI
  const marketCap = tokenData?.marketCap || 0
  const exchangeNames: string[] = (tokenData?.exchanges || []).map((e: any) => e.name)
  const tier2 = ['binance', 'coinbase', 'okx', 'kraken', 'bybit', 'gate', 'kucoin', 'mexc', 'huobi', 'htx']
  const tier2Count = exchangeNames.filter(e => tier2.some(t => e.toLowerCase().includes(t))).length
  const segment =
    marketCap >= 50_000_000 && tier2Count >= 3 ? 'enterprise' :
    marketCap >= 20_000_000 && tier2Count >= 2 ? 'smb' :
    marketCap > 0 ? 'small' : 'pre-tge'

  async function handleSubmit(termSheetType: 'retainer' | 'call_option') {
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email.')
      return
    }
    setError('')
    setLoading(termSheetType)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          projectName,
          ticker,
          termSheetType,
          tokenData,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl p-10 text-center" style={{ backgroundColor: '#162040' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#1D6E73' }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-bold mb-3">Your report is on its way.</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          We've sent your liquidity analysis and indicative term sheet to <strong className="text-white">{email}</strong>. 
          Check your inbox — it should arrive within 60 seconds. Check your spam folder if you don't see it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://calendly.com/portofino"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: '#1D6E73' }}
          >
            Book a Call Now
          </a>
          <a href="/" className="px-8 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
            Analyse another token →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Part A — Retainer Offer */}
      {(segment === 'smb' || segment === 'small') && (
        <div className="rounded-xl p-8" style={{ backgroundColor: '#162040' }}>
          <h2 className="text-white text-2xl font-bold mb-6">Liquidity Without Compromise</h2>
          <div className="space-y-3 mb-8">
            {[
              'Deep two-way order books on your key exchanges',
              '95% uptime guarantee with monthly reporting',
              '50% profit share on market making revenues',
              'You control inventory — we never hold your tokens',
              'Restricted API only — zero withdrawal rights',
              'No loan, no options, no complexity',
              'No hidden fees',
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <span style={{ color: '#1D6E73' }} className="mt-0.5 text-lg">✓</span>
                <span className="text-gray-300">{point}</span>
              </div>
            ))}
          </div>

          {/* Fee box */}
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#1D6E73' }}>
            <p className="text-white font-bold text-lg">$7,500 / month — first exchange</p>
            <p className="text-white/80 mt-1">$2,500 / month — each additional exchange</p>
          </div>

          {/* Pull quote */}
          <p className="text-gray-400 italic text-sm border-l-2 pl-4" style={{ borderColor: '#1D6E73' }}>
            "Liquidity is more than numbers on a screen — it is confidence, credibility, and velocity."
          </p>
        </div>
      )}

      {/* Enterprise CTA */}
      {segment === 'enterprise' && (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#162040' }}>
          <h2 className="text-white text-2xl font-bold mb-3">Enterprise Programme</h2>
          <p className="text-gray-400 mb-6">
            Your token profile qualifies for our Enterprise programme.
          </p>
          <a
            href="https://calendly.com/portofino"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 font-semibold hover:underline"
            style={{ color: '#1D6E73' }}
          >
            Book a call →
          </a>
        </div>
      )}

      {/* Pre-TGE CTA */}
      {segment === 'pre-tge' && (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#162040' }}>
          <h2 className="text-white text-2xl font-bold mb-3">Launching Soon?</h2>
          <a
            href="https://calendly.com/portofino"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: '#1D6E73' }}
          >
            Talk to our Pre-TGE team →
          </a>
        </div>
      )}

      {/* Part B — Email Gate */}
      <div className="rounded-xl p-8" style={{ backgroundColor: '#162040' }}>
        <h2 className="text-white text-2xl font-bold mb-1">Get Your Full Report + Indicative Term Sheet</h2>
        <p className="text-gray-400 mb-6">Free. Sent to your inbox in under 60 seconds.</p>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2"
            style={{ backgroundColor: '#0D1B3E', border: '1px solid #1e3a5f' }}
          />
          <input
            type="email"
            placeholder="jane@yourproject.xyz"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#0D1B3E', border: '1px solid #1e3a5f' }}
          />
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#0D1B3E', border: '1px solid #1e3a5f' }}
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {segment !== 'enterprise' && segment !== 'pre-tge' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSubmit('retainer')}
              disabled={!!loading}
              className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1D6E73' }}
            >
              {loading === 'retainer' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Send Me the Retainer Term Sheet — $7,500/mo
            </button>
            <button
              onClick={() => handleSubmit('call_option')}
              disabled={!!loading}
              className="w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ border: '1px solid #1D6E73', backgroundColor: 'transparent' }}
            >
              {loading === 'call_option' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Send Me the Call Option Term Sheet
            </button>
          </div>
        )}

        <p className="text-gray-500 text-xs mt-4">
          By submitting, you agree to be contacted by Portofino Technologies. No spam, ever.
        </p>
      </div>
    </div>
  )
}
