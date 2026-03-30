'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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

const BG = '#161B28'
const CARD = '#1E2436'

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: CARD }} />
        ))}
      </div>
      <div className="h-72 rounded-xl" style={{ backgroundColor: CARD }} />
      <div className="h-72 rounded-xl" style={{ backgroundColor: CARD }} />
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
        if (res.status === 404) { setNotFound(true); return }
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
    <main className="min-h-screen" style={{ backgroundColor: BG }}>
      <nav className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <Image src="/logo.png" alt="Portofino" width={150} height={34} style={{ objectFit: 'contain', cursor: 'pointer' }} onClick={() => router.push('/')} />
        <button onClick={() => router.push('/')} className="text-gray-400 text-sm hover:text-white transition-colors">← New analysis</button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">
        {loading && <Skeleton />}

        {!loading && notFound && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">We couldn't find data for <span className="text-white font-bold">{ticker}</span>.</p>
            <p className="text-gray-500 text-sm mb-8">Try a different ticker symbol.</p>
            <button onClick={() => router.push('/')} className="px-8 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: '#0099CC' }}>Try another token</button>
          </div>
        )}

        {!loading && data && (
          <>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>{ticker} — Liquidity Analysis</h1>
              <p className="text-gray-400 mt-1">Analysis period: last 180 days</p>
            </div>
            <section><KPIGrid data={data} /></section>
            <section><TradingVolumeChart data={data.volumeHistory} /></section>
            <section><OrderBookChart data={data.volumeHistory} /></section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LiquidityByExchangeChart data={data.exchanges} />
              <VolumeByExchangeChart data={data.exchanges} />
            </section>
            <section><PeerRadarChart ticker={ticker} volMcapRatio={data.volMcapRatio} exchanges={data.exchanges} /></section>
            <section><InsightsSection tokenData={data} /></section>
            <section><ConversionSection ticker={ticker} tokenData={data} /></section>
          </>
        )}
      </div>
    </main>
  )
}
