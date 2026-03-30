'use client'

interface TokenData {
  ticker: string
  price: number
  marketCap: number
  fdv: number
  volume24h: number
  circulatingSupply: number
  change24h: number
  change1y: number
  avgHourlyVol: number
  volMcapRatio: number
  mcapVolRatio: number
  mcapRank: number
  athChangePercent: number
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(4)}`
}

function formatPrice(value: number): string {
  if (value >= 1000) return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (value >= 1) return `$${value.toFixed(4)}`
  if (value >= 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(8)}`
}

function formatPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

interface KPICardProps {
  label: string
  value: string
  isPercent?: boolean
  rawValue?: number
}

function KPICard({ label, value, isPercent, rawValue }: KPICardProps) {
  const color =
    isPercent && rawValue !== undefined
      ? rawValue >= 0
        ? '#22c55e'
        : '#ef4444'
      : 'white'

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ backgroundColor: '#1E2436' }}
    >
      <span className="text-xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-gray-400">{label}</span>
    </div>
  )
}

export default function KPIGrid({ data }: { data: TokenData }) {
  const cards = [
    { label: 'Current Price', value: formatPrice(data.price) },
    { label: 'Market Cap', value: formatUSD(data.marketCap) },
    { label: 'FDV', value: formatUSD(data.fdv) },
    { label: '24h Volume', value: formatUSD(data.volume24h) },
    { label: 'Circulating Supply', value: Number(data.circulatingSupply.toFixed(0)).toLocaleString() },
    { label: '24h Change', value: formatPct(data.change24h), isPercent: true, rawValue: data.change24h },
    { label: '1Y Change', value: formatPct(data.change1y), isPercent: true, rawValue: data.change1y },
    { label: 'Avg Hourly Vol', value: formatUSD(data.avgHourlyVol) },
    { label: 'Vol / MCap', value: `${data.volMcapRatio.toFixed(2)}%` },
    { label: 'MCap / Vol Ratio', value: data.mcapVolRatio.toFixed(1) },
    { label: 'MCap Rank', value: `#${data.mcapRank}` },
    { label: '% from ATH', value: formatPct(data.athChangePercent), isPercent: true, rawValue: data.athChangePercent },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  )
}
