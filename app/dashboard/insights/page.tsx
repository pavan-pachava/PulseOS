'use client'

import { InsightCard } from '@/components/InsightCard'
import { Badge } from '@/components/ui/Badge'
import { useEffect, useState } from 'react'

interface Integration {
  provider: string
}

export default function InsightsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/integrations?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        setIntegrations(data.integrations || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch integrations:', err)
        setLoading(false)
      })
  }, [])

  const hasSpotify = integrations.some((i) => i.provider === 'spotify')
  const hasGitHub = integrations.some((i) => i.provider === 'github')
  const hasWakaTime = integrations.some((i) => i.provider === 'wakatime')

  const activeInsights: Array<{
    id: number
    title: string
    description: string
    badge: string
    icon: string
    correlation: number | null
  }> = []

  if (hasSpotify && hasWakaTime) {
    activeInsights.push({
      id: 1,
      title: 'Music → Productivity Correlation',
      description: 'Quantifying BPM ranges and energy levels of Spotify tracks against deep work coding minutes.',
      badge: 'time-series ML',
      icon: '🎵',
      correlation: 0.84,
    })
  }

  if (hasGitHub && hasWakaTime) {
    activeInsights.push({
      id: 2,
      title: 'Code Velocity Correlation',
      description: 'Correlating active coding minutes with the quantity and lines of commits pushed.',
      badge: 'regression',
      icon: '🚀',
      correlation: 0.72,
    })
  }

  if (hasSpotify) {
    activeInsights.push({
      id: 3,
      title: 'Listening Habits Insight',
      description: 'Analyzing listening history volume and duration patterns for focus optimization.',
      badge: 'pattern detection',
      icon: '🎧',
      correlation: 0.65,
    })
  }

  if (loading) {
    return (
      <div className="space-y-8 text-black">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Correlation Insights</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-black animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Correlation Insights</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">The meaningful ML — patterns across your data</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeInsights.length > 0 ? (
          activeInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              badge={insight.badge}
              icon={insight.icon}
              correlation={insight.correlation}
            />
          ))
        ) : (
          <div className="col-span-full bg-white border-2 border-black p-6 text-center font-bold text-slate-700">
            No Data Available
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-none border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">This Week&apos;s Key Insights</h2>
          <Badge variant={activeInsights.length > 0 ? "success" : "default"}>
            {activeInsights.length > 0 ? 'Active' : 'No Data'}
          </Badge>
        </div>
        <div className="space-y-6">
          {activeInsights.length > 0 ? (
            activeInsights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-4 p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl bg-white border border-black p-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] leading-none select-none">{insight.icon}</span>
                <div>
                  <p className="font-black text-black uppercase tracking-wide text-sm">{insight.title}</p>
                  <p className="text-xs text-slate-800 font-bold mt-1">{insight.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-700 font-bold text-center py-6">No Data Available</p>
          )}
        </div>
      </div>
    </div>
  )
}
