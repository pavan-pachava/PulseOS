'use client'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  change?: { value: number; trend: 'up' | 'down' }
  icon?: string
}

export function MetricCard({ title, value, unit, change, icon }: MetricCardProps) {
  return (
    <div className="bg-white text-black rounded-none p-4 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider">{title}</p>
          <p className="text-xl sm:text-2xl font-extrabold text-black mt-2">
            {value}
            {unit && <span className="text-base text-slate-700 ml-1">{unit}</span>}
          </p>
        </div>
        {icon && <span className="text-2xl sm:text-3xl">{icon}</span>}
      </div>
      {change && (
        <div className={`mt-3 text-xs sm:text-sm inline-block px-2 py-0.5 border-2 border-black font-bold ${
          change.trend === 'up' ? 'bg-[#00E5FF] text-black' : 'bg-[#FF5EA6] text-black'
        }`}>
          {change.trend === 'up' ? '▲' : '▼'} {change.value}%
        </div>
      )}
    </div>
  )
}
