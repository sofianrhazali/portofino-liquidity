import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  // Phase 2: CoinGecko integration goes here
  return NextResponse.json({ message: `Data for ${ticker} — coming in Phase 2` })
}
