'use client'

import { InsightCard } from '@/components/InsightCard'
import { mockCorrelationInsights } from '@/lib/mockData'
import { Badge } from '@/components/ui/Badge'

export default function InsightsPage() {
  return (
    <div className="space-y-8 text-black animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Correlation Insights</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">The meaningful ML — patterns across your data</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCorrelationInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            title={insight.title}
            description={insight.description}
            badge={insight.badge}
            icon={insight.icon}
            correlation={insight.correlation}
          />
        ))}
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-none border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">This Week&apos;s Key Insights</h2>
          <Badge variant="success">Active</Badge>
        </div>
        <div className="space-y-6">
          
          <div className="flex items-start gap-4 p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-3xl bg-white border border-black p-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] leading-none select-none">📈</span>
            <div>
              <p className="font-black text-black uppercase tracking-wide text-sm">Synth & Electronic genres boost productivity by 34%</p>
              <p className="text-xs text-slate-800 font-bold mt-1">Your best 3-hour deep work blocks correlate with Lo-Fi and Synthwave tracks (120-140 BPM)</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-3xl bg-white border border-black p-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] leading-none select-none">🌧️</span>
            <div>
              <p className="font-black text-black uppercase tracking-wide text-sm">Rain increases commit frequency</p>
              <p className="text-xs text-slate-800 font-bold mt-1">Rainy days show 22% more commits, possibly due to reduced meeting scheduling</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-3xl bg-white border border-black p-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] leading-none select-none">📅</span>
            <div>
              <p className="font-black text-black uppercase tracking-wide text-sm">Meeting density predicts code quality</p>
              <p className="text-xs text-slate-800 font-bold mt-1">High meeting days (5+) correlate with 15% shorter commit messages and higher bug-fix ratio</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
