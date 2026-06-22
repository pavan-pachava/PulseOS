'use client'

import { Badge } from '@/components/ui/Badge'

interface InsightCardProps {
  title: string
  description: string
  badge: string
  icon: string
  correlation?: number | null
}

export function InsightCard({ title, description, badge, icon, correlation }: InsightCardProps) {
  return (
    <div className="bg-white text-black rounded-none p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className="flex items-start gap-4">
        <span className="text-3xl sm:text-4xl">{icon}</span>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black mb-2">{title}</h3>
          <p className="text-slate-700 text-xs sm:text-sm font-bold leading-relaxed mb-4">{description}</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant="info">{badge}</Badge>
            {correlation !== null && correlation !== undefined && (
              <span className="text-xs font-black uppercase bg-[#FFE600] border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                r = {correlation.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
