'use client'

interface HeatmapGridProps {
  data: { day: string; score: number; label: string }[]
}

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const getColor = (score: number) => {
    if (score >= 85) return 'bg-[#00E5FF]' // cyan
    if (score >= 70) return 'bg-[#B2FF00]' // lime
    if (score >= 50) return 'bg-[#FFE600]' // yellow
    if (score >= 30) return 'bg-[#FF9F00]' // orange
    return 'bg-[#FF5EA6]' // pink
  }

  return (
    <div className="space-y-4 text-black">
      <div className="grid grid-cols-7 gap-2">
        {data.map((item) => (
          <div key={item.day} className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 border-2 border-black rounded-none ${getColor(item.score)} flex items-center justify-center font-black text-black transition-all hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none`}
              title={`${item.day}: ${item.score} (${item.label})`}
            >
              {item.score}
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">{item.day}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-slate-800 pt-2 border-t-2 border-dashed border-black/10">
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#FF5EA6] border border-black"></div> &lt; 30
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#FF9F00] border border-black"></div> 30-50
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#FFE600] border border-black"></div> 50-70
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#B2FF00] border border-black"></div> 70-85
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#00E5FF] border border-black"></div> 85+
        </span>
      </div>
    </div>
  )
}
