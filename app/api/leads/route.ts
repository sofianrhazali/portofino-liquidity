import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { detectSegment } from '@/lib/segmentation'
import { sendTermSheetEmail } from '@/lib/email'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
}

async function generateTermSheet(
  ticker: string,
  projectName: string,
  marketCap: number,
  exchanges: { name: string }[],
  segment: string,
  termSheetType: string
) {
  const exchangeNames = exchanges.map(e => e.name).join(', ')
  const marketCapM = (marketCap / 1_000_000).toFixed(2)

  let userPrompt = ''

  if (termSheetType === 'retainer') {
    userPrompt = `Generate a market making retainer term sheet for this token.

Token: ${ticker}
Project: ${projectName}
Market Cap: $${marketCapM}M
Currently listed on: ${exchangeNames}
Segment: ${segment}

Portofino standard retainer terms:
- First exchange: $7,500/month
- Each additional: $2,500/month
- Spread: 200bps maximum
- Depth: $2,500 minimum per side
- Uptime: 95% guaranteed
- Profit share: 50% of market making revenues to client
- No loan, no token options
- Client retains full custody via restricted API
- Reporting: monthly

Pick 2-3 exchanges from their listings that make most commercial sense (prioritise highest volume exchanges).

Return only this JSON:
{
  "type": "retainer",
  "parties": { "marketMaker": "Portofino Technologies", "tokenIssuer": "${projectName}" },
  "exchanges": [{ "name": "string", "spreadBps": 200, "depthUSDT": 2500 }],
  "monthlyFee": 0,
  "feeBreakdown": { "firstExchange": 7500, "additionalExchanges": 0, "total": 0 },
  "kpis": { "uptimePercent": 95, "spreadBps": 200, "depthUSDT": 2500 },
  "profitShare": "50% of market making revenues",
  "custody": "Restricted API access only. Zero withdrawal rights.",
  "highlights": ["string", "string", "string", "string", "string"],
  "validDays": 14,
  "nextStep": "Book a discovery call to confirm terms and begin onboarding."
}`
  } else {
    userPrompt = `Generate a market making call option term sheet for this token.

Token: ${ticker}
Project: ${projectName}
Market Cap: $${marketCapM}M
Currently listed on: ${exchangeNames}
Segment: ${segment}

Return only this JSON:
{
  "type": "call_option",
  "parties": { "marketMaker": "Portofino Technologies", "tokenIssuer": "${projectName}" },
  "exchanges": [{ "name": "string", "spreadBps": 200, "depthUSDT": 2500 }],
  "loanTokens": "TBD — to be agreed based on circulating supply",
  "optionStrikes": [
    { "ratio": 1.0, "allocation": "50%", "duration": "12 month rolling" },
    { "ratio": 1.5, "allocation": "25%", "duration": "12 month rolling" },
    { "ratio": 2.0, "allocation": "25%", "duration": "12 month rolling" }
  ],
  "setupFee": 10000,
  "monthlyRetainer": 0,
  "highlights": ["string", "string", "string", "string"],
  "note": "Retainer waived in exchange for option structure.",
  "validDays": 14,
  "nextStep": "Book a discovery call to confirm terms and begin onboarding."
}`
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: 'You are a commercial analyst at Portofino Technologies generating precise, professional market making term sheets. Output only valid JSON.',
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, projectName, ticker, termSheetType, tokenData } = await request.json()

    if (!name || !email || !ticker || !termSheetType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exchangeNames = (tokenData.exchanges || []).map((e: any) => e.name)
    const segment = detectSegment(tokenData.marketCap || 0, exchangeNames)

    // Generate term sheet
    const termSheet = await generateTermSheet(
      ticker,
      projectName || ticker,
      tokenData.marketCap || 0,
      tokenData.exchanges || [],
      segment,
      termSheetType
    )

    const supabase = getSupabase()

    // Save lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        email,
        name,
        project_name: projectName || ticker,
        ticker,
        market_cap_usd: tokenData.marketCap || 0,
        segment,
        term_sheet_type: termSheetType,
      })
      .select()
      .single()

    if (leadError) {
      console.error('Supabase lead error:', leadError)
    }

    // Save term sheet
    if (lead?.id) {
      await supabase.from('term_sheets').insert({
        lead_id: lead.id,
        ticker,
        content_json: termSheet,
      })
    }

    // Send emails
    const leadData = {
      name,
      email,
      projectName: projectName || ticker,
      ticker,
      marketCap: tokenData.marketCap || 0,
      segment,
      termSheetType,
    }

    try {
      await sendTermSheetEmail(leadData, termSheet)

      if (lead?.id) {
        await supabase
          .from('leads')
          .update({ emailed_at: new Date().toISOString() })
          .eq('id', lead.id)
      }
    } catch (emailErr) {
      console.error('Email error:', emailErr)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, segment, termSheetType })
  } catch (err) {
    console.error('Leads API error:', err)
    return NextResponse.json({ error: 'Failed to process lead' }, { status: 500 })
  }
}
