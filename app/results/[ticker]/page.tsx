'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import KPIGrid from '@/components/KPIGrid'
import {
  TradingVolumeChart,
  LiquidityByExchangeChart,
  VolumeByExchangeChart,
  OrderBookChart,
  PeerRadarChart,
} from '@/components/LiquidityCharts'
import InsightsSection from '@/components/InsightsSection'
import ConversionSection from '@/components/ConversionSection'

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: '#162040' }} />
        ))}
      </div>
      <div className="h-72 rounded-xl" style={{ backgroundColor: '#162040' }} />
      <div className="h-72 rounded-xl" style={{ backgroundColor: '#162040' }} />
    </div>
  )
}

export default function ResultsPage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/token?ticker=${params.ticker}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        setData(json)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.ticker])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0D1B3E' }}>
      {/* Nav */}
      <nav className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <span
          className="text-white text-2xl tracking-widest uppercase cursor-pointer"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, letterSpacing: '0.2em' }}
          onClick={() => router.push('/')}
        >
          PORTOFINO<sup className="text-xs" style={{ color: '#0099CC' }}>s</sup>
        </span>
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 text-sm hover:text-white transition-colors"
        >
          ← New analysis
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {loading && <Skeleton />}

        {!loading && notFound && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">
              We couldn't find data for <span className="text-white font-bold">{ticker}</span>.
            </p>
            <p className="text-gray-500 text-sm mb-8">Try a different ticker symbol.</p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#1D6E73' }}
            >
              Try another token
            </button>
          </div>
        )}

        {!loading && data && (
          <>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {ticker} — Liquidity Analysis
              </h1>
              <p className="text-gray-400 mt-1">Analysis period: last 180 days</p>
            </div>

            <section>
              <KPIGrid data={data} />
            </section>

            <section>
              <TradingVolumeChart data={data.volumeHistory} />
            </section>

            <section>
              <OrderBookChart data={data.volumeHistory} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LiquidityByExchangeChart data={data.exchanges} />
              <VolumeByExchangeChart data={data.exchanges} />
            </section>

            <section>
              <PeerRadarChart
                ticker={ticker}
                volMcapRatio={data.volMcapRatio}
                exchanges={data.exchanges}
              />
            </section>

            <section>
              <InsightsSection tokenData={data} />
            </section>

            <section>
              <ConversionSection ticker={ticker} tokenData={data} />
            </section>
          </>
        )}
      </div>
    </main>
  )
}
