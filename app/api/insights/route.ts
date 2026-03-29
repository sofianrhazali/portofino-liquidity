import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { tokenData } = await request.json()

    const top3Exchanges = (tokenData.exchanges || [])
      .slice(0, 3)
      .map((e: any) => e.name)
      .join(', ')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are a senior market making analyst at Portofino Technologies, an institutional crypto market maker with clients including Axelar, Arkham, and Polymarket. You write sharp, specific, commercially-minded liquidity assessments. Never be vague. Always reference specific numbers from the data. Always connect findings to commercial consequences — investor perception, price impact, arbitrage risk, or institutional access barriers.`,
      messages: [
        {
          role: 'user',
          content: `Analyse this token's liquidity profile and write exactly 3 actionable insights for the token team.

Token: ${tokenData.ticker}
Market Cap: $${tokenData.marketCap?.toLocaleString()}
24h Volume: $${tokenData.volume24h?.toLocaleString()}
Vol/MCap ratio: ${tokenData.volMcapRatio?.toFixed(2)}%
Top exchanges by depth: ${top3Exchanges}
MCap Rank: ${tokenData.mcapRank}
1Y price change: ${tokenData.change1y?.toFixed(2)}%
Distance from ATH: ${tokenData.athChangePercent?.toFixed(2)}%

Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation, just the JSON:
[
  {
    "title": "5 words max, punchy problem statement",
    "insight": "Two sentences. First sentence states the specific problem with numbers. Second sentence states the commercial consequence.",
    "severity": "high" or "medium" or "low"
  }
]`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(cleaned)

    return NextResponse.json(insights)
  } catch (err) {
    console.error('Insights API error:', err)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
