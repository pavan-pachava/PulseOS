/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/MetricCard'
import { HeatmapGrid } from '@/components/charts/HeatmapGrid'
import { Badge } from '@/components/ui/Badge'
import { LoadingCard } from '@/components/LoadingSpinner'
import { ErrorAlert } from '@/components/ErrorAlert'
import { useEffect, useState, useRef } from 'react'
import { mockDailyMetrics } from '@/lib/mockData'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'

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
  const [controlError, setControlError] = useState<string | null>(null)

  // Web Audio Visualizer references
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [audioAvg, setAudioAvg] = useState<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const [barHistory, setBarHistory] = useState<number[]>(new Array(24).fill(0))
  const historyRef = useRef<number[]>(new Array(24).fill(0))

  const initAudioCtx = () => {
    if (audioCtxRef.current) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      
      const ctx = new AudioContextClass()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      
      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.loop = true
      audio.volume = 0.3
      audio.muted = true
      
      const source = ctx.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      
      audioRef.current = audio
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e)
    }
  }

  const toggleMute = () => {
    initAudioCtx()
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(audioRef.current.muted)
    }
  }

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

  const [localProgress, setLocalProgress] = useState<number>(0)

  useEffect(() => {
    if (!currentlyPlaying?.is_playing) {
      setLocalProgress(currentlyPlaying?.progress_ms || 0)
      return
    }

    setLocalProgress(currentlyPlaying.progress_ms || 0)

    const interval = setInterval(() => {
      setLocalProgress(prev => {
        const total = currentlyPlaying.item?.duration_ms || 0
        if (prev + 1000 >= total) {
          clearInterval(interval)
          return total
        }
        return prev + 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentlyPlaying])

  // Sync preview audio playback
  useEffect(() => {
    const previewUrl = currentlyPlaying?.item?.preview_url
    const isPlaying = currentlyPlaying?.is_playing

    if (isPlaying && previewUrl) {
      initAudioCtx()
      
      const audio = audioRef.current
      if (audio) {
        if (audio.src !== previewUrl) {
          audio.src = previewUrl
          audio.load()
        }
        
        // Loop the 30-sec preview in alignment with progress
        const offset = ((localProgress || currentlyPlaying.progress_ms || 0) / 1000) % 30
        if (Math.abs(audio.currentTime - offset) > 1.5) {
          audio.currentTime = offset
        }
        
        if (audio.paused) {
          audio.play().catch(e => console.warn('Audio playback start blocked or failed:', e))
        }
      }
    } else {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
      }
    }
  }, [currentlyPlaying, localProgress])

  // Dynamic animation loop for visualizer
  useEffect(() => {
    let frameId: number
    const dataArray = analyserRef.current ? new Uint8Array(analyserRef.current.frequencyBinCount) : null

    const animate = () => {
      let avg = 0
      if (currentlyPlaying?.is_playing) {
        let realAvg = 0
        if (analyserRef.current && dataArray && audioRef.current && !audioRef.current.paused) {
          analyserRef.current.getByteFrequencyData(dataArray)
          realAvg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        }
        
        if (realAvg > 1) {
          // Emphasize bass/mid range spikes for high visual bounce
          const bass = dataArray ? (dataArray[1] || 0) : 0
          const subBass = dataArray ? (dataArray[2] || 0) : 0
          const mid = dataArray ? (dataArray[4] || 0) : 0
          avg = Math.max(bass, subBass, mid) * 1.3
        } else {
          // Dynamic simulated visualizer wave (synth undulations + drum beat spikes)
          const now = Date.now()
          const period = 750 // 80 BPM
          const phase = (now % period) / period
          
          const base = Math.abs(Math.sin(now / 120)) * 45 // Fast synth wave line
          let beat = 0
          if (phase < 0.12) {
            beat = Math.sin((phase / 0.12) * Math.PI) * 165 // Bass beat hit
          } else if (phase > 0.18 && phase < 0.28) {
            beat = Math.sin(((phase - 0.18) / 0.10) * Math.PI) * 85 // Snare double tap
          }
          avg = Math.max(base, beat) + (Math.random() * 15) // Blend with high-frequency noise
        }
      } else {
        avg = 0
      }
      setAudioAvg(avg)

      // Update scrolling history
      historyRef.current.push(avg)
      historyRef.current.shift()
      setBarHistory([...historyRef.current])

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [currentlyPlaying?.is_playing])

  const duration = currentlyPlaying?.item?.duration_ms || 0
  const progressPercent = duration ? Math.min(100, (localProgress / duration) * 100) : 0
  
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSpotifyControl = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    setControlError(null)
    try {
      const res = await fetch('/api/data/spotify/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to control playback')
      }
      
      // Instantly fetch current track to update state
      const currentRes = await fetch('/api/data/spotify/current-playing')
      if (currentRes.ok) {
        const currentData = await currentRes.json()
        setCurrentlyPlaying(currentData)
      }
    } catch (err: any) {
      console.error(err)
      setControlError(err.message || 'Player control error')
      setTimeout(() => setControlError(null), 4000)
    }
  }

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
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-1">Currently Playing</p>
                {currentlyPlaying?.is_playing ? (
                  <div className="flex flex-col items-center text-center mt-3 p-4 border-2 border-black bg-[#FAF9F3] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none relative">
                    {currentlyPlaying.item?.preview_url && (
                      <button
                        onClick={toggleMute}
                        className="absolute top-2 right-2 px-1.5 py-0.5 bg-white border border-black hover:bg-[#FFE600] active:translate-x-[0.5px] active:translate-y-[0.5px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-none text-[9px] font-black uppercase flex items-center gap-0.5 z-10"
                        title={isMuted ? "Unmute Preview" : "Mute Preview"}
                      >
                        {isMuted ? "🔈 Muted" : "🔊 Live"}
                      </button>
                    )}

                    {currentlyPlaying.item?.album?.images[0]?.url && (
                      <img
                        src={currentlyPlaying.item.album.images[0].url}
                        alt="Album Art"
                        className="w-36 h-36 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4 object-cover select-none transition-transform duration-75"
                        style={{ transform: `scale(${1 + audioAvg / 1000})` }}
                      />
                    )}
                    <div className="w-full">
                      <p className="text-black text-xs sm:text-sm font-black truncate">{currentlyPlaying.item?.name}</p>
                      <p className="text-[10px] sm:text-xs font-extrabold text-slate-700 truncate mt-1">
                        {currentlyPlaying.item?.artists?.map((a: any) => a.name).join(', ')}
                      </p>
                    </div>

                    {/* Progress Bar (between name and controls) */}
                    <div className="w-full mt-4">
                      <div className="w-full bg-white border-2 border-black rounded-none h-2.5 overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <div
                          className="bg-[#00E5FF] h-full"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-600 mt-1 font-mono">
                        <span>{formatTime(localProgress)}</span>
                        <span>-{formatTime(Math.max(0, duration - localProgress))}</span>
                      </div>
                    </div>

                    {/* Controls (inside the box) */}
                    {metrics.live_now?.spotify_connected && (
                      <div className="flex items-center justify-center gap-3 mt-3 w-full">
                        <button
                          onClick={() => handleSpotifyControl('previous')}
                          className="p-1.5 bg-white border-2 border-black hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-none flex items-center justify-center"
                          title="Previous"
                        >
                          <SkipBack className="w-3.5 h-3.5 text-black" />
                        </button>
                        <button
                          onClick={() => handleSpotifyControl(currentlyPlaying?.is_playing ? 'pause' : 'play')}
                          className="p-1.5 bg-white border-2 border-black hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-none flex items-center justify-center"
                          title={currentlyPlaying?.is_playing ? 'Pause' : 'Play'}
                        >
                          {currentlyPlaying?.is_playing ? (
                            <Pause className="w-3.5 h-3.5 text-black" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-black" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSpotifyControl('next')}
                          className="p-1.5 bg-white border-2 border-black hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-none flex items-center justify-center"
                          title="Skip Next"
                        >
                          <SkipForward className="w-3.5 h-3.5 text-black" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center mt-3 p-4 border-2 border-black bg-[#FAF9F3] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
                    <p className="text-slate-600 font-bold text-xs italic">Nothing playing</p>
                    {metrics.live_now?.spotify_connected && (
                      <button
                        onClick={() => handleSpotifyControl('play')}
                        className="mt-3 p-1.5 bg-white border-2 border-black hover:bg-[#FFE600] active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-none flex items-center justify-center text-xs font-black uppercase gap-1"
                        title="Resume Playback"
                      >
                        <Play className="w-3 h-3 text-black" /> Play
                      </button>
                    )}
                  </div>
                )}

                {/* Scrolling Audio Visualizer */}
                {currentlyPlaying?.is_playing && (
                  <div className="flex justify-center mt-4 w-full">
                    <div className="flex items-end justify-between h-10 w-full overflow-hidden px-1">
                      {barHistory.map((val, idx) => {
                        const heightPercent = Math.max(10, Math.min(100, (val / 150) * 100))
                        return (
                          <div
                            key={idx}
                            className="w-2 bg-[#FF5EA6] border-t-2 border-x border-black transition-all duration-75"
                            style={{ height: `${heightPercent}%` }}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {controlError && (
                  <p className="text-[10px] text-[#FF5EA6] font-extrabold uppercase mt-2 animate-pulse leading-snug text-center">
                    ⚠️ {controlError}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</p>
                <div className="mt-1">
                  {currentlyPlaying?.is_playing ? (
                    <Badge variant="success">Listening</Badge>
                  ) : (
                    <Badge variant="default">Idle Mode</Badge>
                  )}
                </div>
              </div>

            </div>
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
