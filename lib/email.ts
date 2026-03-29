import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface LeadData {
  name: string
  email: string
  projectName: string
  ticker: string
  marketCap: number
  segment: string
  termSheetType: string
}

export interface TermSheetData {
  type: string
  exchanges?: { name: string; spreadBps: number; depthUSDT: number }[]
  monthlyFee?: number
  feeBreakdown?: { firstExchange: number; additionalExchanges: number; total: number }
  kpis?: { uptimePercent: number; spreadBps: number; depthUSDT: number }
  profitShare?: string
  custody?: string
  highlights?: string[]
  optionStrikes?: { ratio: number; allocation: string; duration: string }[]
  setupFee?: number
  validDays?: number
  nextStep?: string
}

function formatUSD(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

function buildProspectEmail(lead: LeadData, termSheet: TermSheetData): string {
  const isRetainer = termSheet.type === 'retainer'
  const exchangeList = (termSheet.exchanges || []).map(e => e.name).join(', ')
  const highlights = (termSheet.highlights || []).slice(0, 4)
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">
        
        <!-- Header -->
        <tr>
          <td style="background:#0D1B3E;padding:24px 32px;border-bottom:3px solid #0099CC;">
            <span style="color:white;font-size:22px;font-weight:700;letter-spacing:6px;font-family:Georgia,serif;">PORTOFINO<sup style="font-size:11px;color:#0099CC;">s</sup></span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="color:#0D1B3E;font-size:16px;margin:0 0 16px;">Hi ${lead.name},</p>
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Thank you for checking <strong>${lead.ticker}</strong>'s liquidity on Portofino's platform. 
              Based on your token's profile, here is our indicative term sheet.
            </p>

            <!-- Term sheet box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Term Sheet Summary</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#374151;font-size:14px;width:40%;">Type</td>
                    <td style="padding:6px 0;color:#0D1B3E;font-size:14px;font-weight:600;">${isRetainer ? 'Retainer Agreement' : 'Call Option Structure'}</td>
                  </tr>
                  ${exchangeList ? `<tr>
                    <td style="padding:6px 0;color:#374151;font-size:14px;">Proposed exchanges</td>
                    <td style="padding:6px 0;color:#0D1B3E;font-size:14px;font-weight:600;">${exchangeList}</td>
                  </tr>` : ''}
                  ${isRetainer && termSheet.feeBreakdown ? `<tr>
                    <td style="padding:6px 0;color:#374151;font-size:14px;">Monthly fee</td>
                    <td style="padding:6px 0;color:#0D1B3E;font-size:14px;font-weight:600;">$${termSheet.feeBreakdown.total?.toLocaleString()}/month</td>
                  </tr>` : ''}
                  ${!isRetainer && termSheet.setupFee ? `<tr>
                    <td style="padding:6px 0;color:#374151;font-size:14px;">Setup fee</td>
                    <td style="padding:6px 0;color:#0D1B3E;font-size:14px;font-weight:600;">$${termSheet.setupFee?.toLocaleString()}</td>
                  </tr>` : ''}
                </table>
                ${highlights.length > 0 ? `
                <div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:16px;">
                  ${highlights.map(h => `<p style="margin:4px 0;color:#374151;font-size:14px;">✓ ${h}</p>`).join('')}
                </div>` : ''}
              </td></tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <a href="https://calendly.com/portofino" style="display:inline-block;background:#0099CC;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
                  Book a 30-Min Call to Discuss
                </a>
              </td></tr>
            </table>

            <!-- Disclaimer -->
            <p style="color:#9ca3af;font-size:11px;line-height:1.6;border-top:1px solid #e5e7eb;padding-top:16px;">
              This term sheet is indicative and subject to full due diligence and legal review. 
              Valid for 14 days from ${today}. Portofino Technologies is regulated in the UK (FCA), 
              Switzerland (VQF/FINMA), and BVI (VASP).
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:16px 32px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              contact@portofino.tech | <a href="https://portofino.tech" style="color:#0099CC;">portofino.tech</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendTermSheetEmail(lead: LeadData, termSheet: TermSheetData): Promise<void> {
  const timestamp = new Date().toISOString()

  // Email 1: Prospect
  await resend.emails.send({
    from: 'Portofino <contact@portofino.tech>',
    to: lead.email,
    subject: `Your ${lead.ticker} Liquidity Analysis + Indicative Term Sheet — Portofino`,
    html: buildProspectEmail(lead, termSheet),
  })

  // Email 2: Internal alert
  await resend.emails.send({
    from: 'Portofino Leads <contact@portofino.tech>',
    to: 'contact@portofino.tech',
    subject: `🔔 New Lead: ${lead.ticker} — ${lead.segment} — ${lead.termSheetType}`,
    text: `New Liquidity Check lead:
Name: ${lead.name}
Email: ${lead.email}
Project: ${lead.projectName}
Ticker: ${lead.ticker}
Market Cap: ${formatUSD(lead.marketCap)}
Segment: ${lead.segment}
Term sheet type: ${lead.termSheetType}
Submitted: ${timestamp}

→ Respond within 24 hours.`,
  })
}
