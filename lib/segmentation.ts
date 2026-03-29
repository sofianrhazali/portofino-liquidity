type Segment = 'enterprise' | 'smb' | 'small' | 'pre-tge'

export function detectSegment(marketCapUsd: number, exchanges: string[]): Segment {
  const tier2 = ['binance', 'coinbase', 'okx', 'kraken', 'bybit', 'gate', 'kucoin', 'mexc', 'huobi', 'htx']
  const listedOnTier2 = exchanges.filter(e =>
    tier2.some(t => e.toLowerCase().includes(t))
  ).length

  if (marketCapUsd >= 50_000_000 && listedOnTier2 >= 3) return 'enterprise'
  if (marketCapUsd >= 20_000_000 && listedOnTier2 >= 2) return 'smb'
  if (marketCapUsd > 0) return 'small'
  return 'pre-tge'
}
