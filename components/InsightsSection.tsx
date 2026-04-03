'use client'

import { useEffect, useState } from 'react'

interface Insight {
  title: string
  insight: string
  portofino: string
  severity: 'high' | 'medium' | 'low'
  actionability: 'high' | 'medium' | 'low'
}

const severityConfig = {
  high: { color: '#C0392B', label: 'HIGH SEVERITY' },
  medium: { color: '#C47A1A', label: 'MEDIUM SEVERITY' },
  low: { color: '#0099CC', label: 'LOW SEVERITY' },
}

const actionabilityConfig = {
  high: { color: '#22c55e', label: 'HIGHLY ACTIONABLE' },
  medium: { color: '#0099CC', label: 'ACTIONABLE' },
  low: { color: '#6b7280', label: 'LONG-TERM ACTION' },
}

export default function InsightsSection({ tokenData }: { tokenData: any }) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenData }),
        })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setInsights(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [tokenData])

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
        Actionable Insights, with Portofino
      </h2>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0099CC', borderTopColor: 'transparent' }} />
          <span>Generating insights from live market data with Portofino's proprietary engine</span>
        </div>
      )}

      {error && (
        <p className="text-red-400">Could not generate insights. Please check your Anthropic API key.</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, i) => {
            const sev = severityConfig[insight.severity] || severityConfig.low
            const act = actionabilityConfig[insight.actionability] || actionabilityConfig.medium
            return (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col"
                style={{
                  backgroundColor: '#1E2436',
                  borderLeft: `4px solid ${sev.color}`,
                }}
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full" style={{ color: sev.color, backgroundColor: `${sev.color}18` }}>
                    {sev.label}
                  </span>
                  <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full" style={{ color: act.color, backgroundColor: `${act.color}18` }}>
                    {act.label}
                  </span>
                </div>

                {/* Title + insight */}
                <h3 className="text-white font-bold text-base mb-2">{insight.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{insight.insight}</p>

                {/* Portofino solution */}
                <div className="mt-auto pt-3 border-t border-white/10">
                  <p className="text-xs font-medium leading-relaxed" style={{ color: '#0099CC' }}>
                    → {insight.portofino}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
