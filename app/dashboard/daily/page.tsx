/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/MetricCard'
import { HeatmapGrid } from '@/components/charts/HeatmapGrid'
import { Badge } from '@/components/ui/Badge'
import { LoadingCard } from '@/components/LoadingSpinner'
import { ErrorAlert } from '@/components/ErrorAlert'
import { useEffect, useState } from 'react'
import { mockDailyMetrics } from '@/lib/mockData'

interface Metrics {
  today_at_glance: Array<{ label: string; value: number | string; unit: string }>
  focus_score: number | { score: number; components: Array<{ label: string; value: number }> }
  live_now: {
    spotify_connected: boolean
  }
}

export default function DailyDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/dashboard/metrics')
        if (!res.ok) throw new Error('Failed to fetch metrics')
        const data = await res.json()
        setMetrics(data)
      } catch (err) {
        console.error('Error fetching metrics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
        setMetrics(mockDailyMetrics as any)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  useEffect(() => {
    if (!metrics?.live_now?.spotify_connected) return

    async function fetchCurrentlyPlaying() {
      try {
        const res = await fetch('/api/data/spotify/current-playing')
        if (res.ok) {
          const data = await res.json()
          setCurrentlyPlaying(data)
        }
      } catch (err) {
        console.error('Error fetching current track:', err)
      }
    }

    fetchCurrentlyPlaying()
    const interval = setInterval(fetchCurrentlyPlaying, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [metrics?.live_now.spotify_connected])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Daily Dashboard</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading telemetry...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Daily Dashboard</h1>
          <ErrorAlert message="Unable to load metrics from kernel node." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-black">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Daily Dashboard</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">What you see every morning</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Today at a Glance */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight">Today at a Glance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {metrics.today_at_glance.map((metric, idx) => (
            <MetricCard
              key={idx}
              title={metric.label}
              value={metric.value}
              unit={metric.unit}
            />
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Morning Briefing */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Morning Briefing</h3>
            <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">
              {(mockDailyMetrics as any).morning_briefing}
            </p>
          </div>
          <div>
            <Badge variant="info">AI Agent</Badge>
          </div>
        </Card>

        {/* Live Now Widget */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Live Telemetry</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Currently Playing</p>
                {currentlyPlaying?.is_playing ? (
                  <div className="flex items-center gap-3 mt-1.5 p-2 border-2 border-black bg-[#FAF9F3] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {currentlyPlaying.item?.album?.images[0]?.url && (
                      <img src={currentlyPlaying.item.album.images[0].url} alt="Album" className="w-8 h-8 rounded-none border border-black animate-pulse" />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-black text-xs font-black truncate max-w-[150px]">{currentlyPlaying.item?.name}</p>
                      <p className="text-[10px] text-slate-700 font-bold truncate max-w-[150px]">{currentlyPlaying.item?.artists?.map((a: any) => a.name).join(', ')}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 font-bold text-xs italic mt-1.5">Nothing playing</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</p>
                <div className="mt-1">
                  {currentlyPlaying?.is_playing ? (
                    <Badge variant="success">Listening</Badge>
                  ) : (
                    <Badge variant="default">Idle Mode</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Next Meeting</p>
                <p className="text-xs font-extrabold text-black mt-1">{(mockDailyMetrics as any).live_now.next_meeting}</p>
                <p className="text-[10px] text-slate-700 font-bold mt-0.5">{(mockDailyMetrics as any).live_now.time_until}</p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Badge variant="success">Real-Time</Badge>
          </div>
        </Card>

        {/* Focus Score */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Focus Score</h3>
            <div className="text-center mb-6 bg-[#FFE600] border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-5xl font-black text-black">
                {typeof metrics.focus_score === 'number' ? metrics.focus_score : metrics.focus_score.score}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-black mt-1">out of 100</p>
            </div>
            <div className="space-y-3">
              {(typeof metrics.focus_score === 'number' ? (mockDailyMetrics as any).focus_score.components : metrics.focus_score.components).map((comp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs font-bold uppercase text-slate-800">
                  <span>{comp.label}</span>
                  <span className="font-extrabold text-black bg-white border border-black px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{comp.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <Badge variant="default">ML Engine</Badge>
          </div>
        </Card>
      </div>

      {/* Streaks */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight">Streak Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(mockDailyMetrics as any).streaks.map((streak: any, idx: number) => (
            <Card key={idx} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black uppercase tracking-tight text-sm">{streak.icon} {streak.name}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">Current Consistency</p>
                  <div className="w-full bg-white border-2 border-black rounded-none h-4 overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <div
                      className="bg-[#FFE600] border-r-2 border-black h-full"
                      style={{ width: `${Math.max(4, (streak.current / streak.best) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-black text-black mt-1">{streak.current} Days active</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Best Streak: {streak.best} Days</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Week Heatmap */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight">Week Heatmap</h2>
        <Card className="flex flex-col justify-between">
          <div>
            <HeatmapGrid data={(mockDailyMetrics as any).week_heatmap} />
          </div>
          <div className="pt-4">
            <Badge variant="default">Visualizer</Badge>
          </div>
        </Card>
      </section>
    </div>
  )
}
