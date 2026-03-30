'use client'

import { useEffect, useState } from 'react'

interface Insight {
  title: string
  insight: string
  portofino: string
  severity: 'high' | 'medium' | 'low'
}

const severityConfig = {
  high: { color: '#C0392B', label: 'HIGH SEVERITY' },
  medium: { color: '#C47A1A', label: 'MEDIUM' },
  low: { color: '#0099CC', label: 'LOW' },
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
      <h2 className="text-white text-2xl font-bold mb-6">3 Actionable Insights</h2>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0099CC', borderTopColor: 'transparent' }} />
          <span>Generating AI insights...</span>
        </div>
      )}

      {error && (
        <p className="text-red-400">Could not generate insights. Please check your Anthropic API key.</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, i) => {
            const config = severityConfig[insight.severity] || severityConfig.low
            return (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col"
                style={{
                  backgroundColor: '#1E2436',
                  borderLeft: `4px solid ${config.color}`,
                }}
              >
                <span
                  className="text-xs font-bold tracking-widest uppercase mb-2 block"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                <h3 className="text-white font-bold text-base mb-2">{insight.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{insight.insight}</p>
                <div className="mt-auto pt-3 border-t border-white/10">
                  <p className="text-xs font-medium" style={{ color: '#0099CC' }}>
                    → {insight.portofino}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-gray-500 text-xs mt-4">
        These insights are generated from live market data by Portofino's analysis engine.
      </p>
    </div>
  )
}
