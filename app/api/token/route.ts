import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

function cgHeaders() {
  return {
    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
    'Accept': 'application/json',
  }
}

function formatExchanges(tickers: any[]) {
  const exchangeMap: Record<string, { volume: number; depth2Percent: number }> = {}
  for (const t of tickers) {
    const name = t.market?.name || 'Unknown'
    const vol = t.converted_volume?.usd || 0
    const depth = t.cost_to_move_up_usd || 0
    if (!exchangeMap[name]) {
      exchangeMap[name] = { volume: 0, depth2Percent: 0 }
    }
    exchangeMap[name].volume += vol
    exchangeMap[name].depth2Percent += depth
  }
  return Object.entries(exchangeMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Step 1: Search for coin ID
    const searchRes = await fetch(
      `${COINGECKO_BASE}/search?query=${encodeURIComponent(ticker)}`,
      { headers: cgHeaders() }
    )
    if (!searchRes.ok) throw new Error('CoinGecko search failed')

    const searchData = await searchRes.json()
    const coins = searchData.coins || []
    if (coins.length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    const coinId = coins[0].id

    // Step 2: Fetch full coin data + chart in parallel
    const [coinRes, chartRes] = await Promise.all([
      fetch(
        `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false`,
        { headers: cgHeaders() }
      ),
      fetch(
        `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=180&interval=daily`,
        { headers: cgHeaders() }
      ),
    ])

    if (!coinRes.ok || !chartRes.ok) {
      return NextResponse.json({ error: 'Data unavailable' }, { status: 503 })
    }

    const coin = await coinRes.json()
    const chart = await chartRes.json()

    const md = coin.market_data || {}
    const price = md.current_price?.usd || 0
    const marketCap = md.market_cap?.usd || 0
    const fdv = md.fully_diluted_valuation?.usd || 0
    const volume24h = md.total_volume?.usd || 0
    const circulatingSupply = md.circulating_supply || 0
    const change24h = md.price_change_percentage_24h || 0
    const change1y = md.price_change_percentage_1y || 0
    const ath = md.ath?.usd || 0
    const athChangePercent = md.ath_change_percentage?.usd || 0
    const mcapRank = coin.market_cap_rank || 0
    const volMcapRatio = marketCap > 0 ? (volume24h / marketCap) * 100 : 0
    const mcapVolRatio = volume24h > 0 ? marketCap / volume24h : 0
    const avgHourlyVol = volume24h / 24

    const volumeHistory = (chart.total_volumes || []).map(([timestamp, volume]: [number, number]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      volume,
    }))

    const exchanges = formatExchanges(coin.tickers || [])

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      name: coin.name,
      coinId,
      price,
      marketCap,
      fdv,
      volume24h,
      circulatingSupply,
      change24h,
      change1y,
      ath,
      athChangePercent,
      mcapRank,
      volMcapRatio,
      mcapVolRatio,
      avgHourlyVol,
      exchanges,
      volumeHistory,
      rawTickers: coin.tickers || [],
    })
  } catch (err) {
    console.error('Token API error:', err)
    return NextResponse.json({ error: 'Data unavailable' }, { status: 503 })
  }
}
