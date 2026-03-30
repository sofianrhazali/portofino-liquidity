'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  Cell,
} from 'recharts'

interface VolumePoint { date: string; volume: number }
interface Exchange { name: string; volume: number; depth2Percent: number }

function formatM(val: number) {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

function ChartCard({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#1E2436' }}>
      <h3 className="text-white font-semibold text-base mb-4">{title}</h3>
      {children}
      {note && <p className="text-gray-500 text-xs mt-2">{note}</p>}
    </div>
  )
}

// Chart 1: Trading Volume
export function TradingVolumeChart({ data }: { data: VolumePoint[] }) {
  const filtered = data.filter((_, i) => i % 7 === 0)
  return (
    <ChartCard title="Trading Volume">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickFormatter={(v, i) => (i % 14 === 0 ? v.slice(5) : '')}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickFormatter={formatM}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v: number) => [formatM(v), 'Volume']}
            contentStyle={{ backgroundColor: '#161B28', border: '1px solid #0099CC', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#0099CC' }}
          />
          <Bar dataKey="volume" fill="#0099CC" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// Chart 2: Liquidity by Exchange
export function LiquidityByExchangeChart({ data }: { data: Exchange[] }) {
  return (
    <ChartCard title="Liquidity by Exchange (Current)">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={formatM} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            formatter={(v: number) => [formatM(v), 'Depth']}
            contentStyle={{ backgroundColor: '#161B28', border: '1px solid #0099CC', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#0099CC' }}
          />
          <Bar dataKey="depth2Percent" fill="#161B28" stroke="#0099CC" strokeWidth={1} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// Chart 3: Volume by Exchange
export function VolumeByExchangeChart({ data }: { data: Exchange[] }) {
  return (
    <ChartCard title="Volume Distribution by Exchange">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={formatM} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            formatter={(v: number) => [formatM(v), 'Volume']}
            contentStyle={{ backgroundColor: '#161B28', border: '1px solid #0099CC', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#22543d' }}
          />
          <Bar dataKey="volume" fill="#166534" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// Chart 4: Order Book Depth Evolution (indicative)
export function OrderBookChart({ data }: { data: VolumePoint[] }) {
  const seeded = data.map((d, i) => {
    const bid = 5000 + ((i * 7919) % 20000)
    const ask = -(bid * (0.8 + ((i * 1337) % 400) / 1000))
    return { date: d.date, bid, ask }
  })

  return (
    <ChartCard
      title="Order Book Depth Evolution"
      note="* Indicative values. Contact us for live order book data."
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={seeded}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickFormatter={(v, i) => (i % 14 === 0 ? v.slice(5) : '')}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickFormatter={(v) => `$${Math.abs(v / 1000).toFixed(0)}K`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v: number) => [`$${Math.abs(v).toLocaleString()}`, v > 0 ? 'Bid Depth' : 'Ask Depth']}
            contentStyle={{ backgroundColor: '#161B28', border: '1px solid #0099CC', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Bar dataKey="bid" fill="#0099CC" radius={[2, 2, 0, 0]} />
          <Bar dataKey="ask" fill="#C0392B" radius={[0, 0, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// Chart 5: Peer Radar
export function PeerRadarChart({
  ticker,
  volMcapRatio,
  exchanges,
}: {
  ticker: string
  volMcapRatio: number
  exchanges: Exchange[]
}) {
  const totalDepth = exchanges.reduce((sum, e) => sum + e.depth2Percent, 0)
  const volumeIntensity = Math.min(volMcapRatio * 10, 100)
  const liquidityDepth = Math.min((totalDepth / 100000) * 100, 100)

  const radarData = [
    { axis: 'Spread Tightness', token: 35, peer: 45 },
    { axis: 'Volume Intensity', token: volumeIntensity, peer: 40 },
    { axis: 'Liquidity Depth', token: liquidityDepth, peer: 35 },
    { axis: 'Price Stability', token: 35, peer: 50 },
    { axis: 'MCap Efficiency', token: 35, peer: 45 },
  ]

  return (
    <ChartCard title="Peer Efficiency Profile">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#1e3a5f" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 9 }} />
          <Radar name={ticker} dataKey="token" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Radar name="Peer Median" dataKey="peer" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} strokeDasharray="4 4" />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#161B28', border: '1px solid #0099CC', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
