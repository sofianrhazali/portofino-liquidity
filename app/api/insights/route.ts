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

Tone rules — strictly follow these:
- Never use dramatic or alarming language. No words like "catastrophic", "death spiral", "crisis", "collapse", "drought", "dire".
- Use measured, institutional language. Examples: "Increased Selling Pressure" not "Death Spiral", "Significant Liquidity Gap" not "Catastrophic Liquidity Drought".
- The audience is a token team, not a retail investor. Be direct and professional.

Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation, just the JSON:
[
  {
    "title": "4 words max. Measured, institutional problem label.",
    "insight": "One sentence only. One specific number. One commercial consequence. No fluff. No dramatic language.",
    "portofino": "One sentence, max 15 words. Must start with 'By' and follow the format: 'By [specific action], Portofino will [specific outcome for the token].'",
    "severity": "high" or "medium" or "low",
    "actionability": "high" or "medium" or "low"
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
