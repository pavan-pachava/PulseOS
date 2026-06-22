'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingCard } from '@/components/LoadingSpinner'
import { ErrorAlert } from '@/components/ErrorAlert'
import { mockAnalyticsData } from '@/lib/mockData'
import { useEffect, useState } from 'react'

interface SpotifyTrack {
  track: {
    id: string
    name: string
    artist: string
    album: string
    image: string
    duration_ms: number
  }
  played_at: string
}

interface GitHubCommit {
  message: string
  repo: string
  time: string
  lines: number
}

export default function AnalyticsPage() {
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([])
  const [recentCommits, setRecentCommits] = useState<GitHubCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockSpotify, setIsUsingMockSpotify] = useState(false)
  const [isUsingMockGitHub, setIsUsingMockGitHub] = useState(false)

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      setError(null)
      
      // Fetch Spotify
      try {
        const res = await fetch('/api/data/spotify/history?limit=20')
        const data = await res.json()
        if (data.items) {
          setRecentTracks(data.items)
          setIsUsingMockSpotify(false)
        } else {
          throw new Error('Invalid response')
        }
      } catch (err) {
        console.error('Spotify fetch failed, using mock:', err)
        setIsUsingMockSpotify(true)
        setRecentTracks(mockAnalyticsData.listening_timeline.recent.map(item => ({
          track: {
            id: '',
            name: item.track,
            artist: item.artist,
            album: 'Mock Album',
            image: '',
            duration_ms: item.duration * 60000,
          },
          played_at: item.time,
        })))
      }

      // Fetch GitHub
      try {
        const res = await fetch('/api/data/github/history?limit=10')
        const data = await res.json()
        if (data.items) {
          setRecentCommits(data.items)
          setIsUsingMockGitHub(false)
        } else {
          throw new Error('Invalid response')
        }
      } catch (err) {
        console.error('GitHub fetch failed, using mock:', err)
        setIsUsingMockGitHub(true)
        setRecentCommits(mockAnalyticsData.coding_timeline.recent)
      }

      setLoading(false)
    }

    fetchAnalytics()
  }, [])

  const totalCodingTime = mockAnalyticsData.time_allocation.deep_work
  const totalMeetingTime = mockAnalyticsData.time_allocation.meetings
  const totalBuffer = mockAnalyticsData.time_allocation.buffer

  if (loading) {
    return (
      <div className="space-y-8 text-black">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Deep Analytics</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading your history...</p>
        </div>
        <LoadingCard />
      </div>
    )
  }

  return (
    <div className="space-y-8 text-black animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-4xl font-black uppercase tracking-tight text-black">Deep Analytics</h1>
          {(isUsingMockSpotify || isUsingMockGitHub) && (
            <Badge variant="warning">
              {isUsingMockSpotify && isUsingMockGitHub ? 'Mock Telemetry' : isUsingMockSpotify ? 'Mock Spotify' : 'Mock GitHub'}
            </Badge>
          )}
          {(!isUsingMockSpotify && !isUsingMockGitHub) && (
            <Badge variant="success">Live Telemetry</Badge>
          )}
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Charts and breakdowns for the data-curious</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Listening Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Listening Timeline</h2>
          {!isUsingMockSpotify && (
            <span className="text-xs font-black uppercase bg-[#FFE600] border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {recentTracks.length} tracks sync&apos;d
            </span>
          )}
        </div>
        <Card>
          <p className="text-xs sm:text-sm font-bold text-slate-700 mb-4">Full log telemetry of listened music, duration, and timestamps.</p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border-t-[3px] border-black pt-4">
            {recentTracks.length > 0 ? (
              recentTracks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.track.image ? (
                      <img src={item.track.image} alt="Album" className="w-10 h-10 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none" />
                    ) : (
                      <div className="w-10 h-10 bg-[#FAF9F3] border-2 border-black flex items-center justify-center font-bold text-lg select-none">🎵</div>
                    )}
                    <div className="overflow-hidden">
                      <p className="font-extrabold text-black text-sm truncate leading-tight">{item.track.name}</p>
                      <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">{item.track.artist}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xs text-black font-extrabold font-mono">
                      {Math.floor(item.track.duration_ms / 60000)}:{(Math.floor((item.track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                      {isNaN(new Date(item.played_at).getTime()) 
                        ? item.played_at 
                        : new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-700 font-bold text-center py-4">
                Connect Spotify to visualize telemetry history.
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Coding Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Coding Timeline</h2>
          {!isUsingMockGitHub && (
            <span className="text-xs font-black uppercase bg-[#FF5EA6] border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {recentCommits.length} commits sync&apos;d
            </span>
          )}
        </div>
        <Card>
          <p className="text-xs sm:text-sm font-bold text-slate-700 mb-4">Commit logs, repository loads, language indicators, and volume changes.</p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border-t-[3px] border-black pt-4">
            {recentCommits.length > 0 ? (
              recentCommits.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-black text-sm truncate leading-tight">{item.message}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider truncate">
                      {item.repo} • {
                        isNaN(new Date(item.time).getTime()) 
                          ? item.time 
                          : new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      }
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <span className="text-xs font-black uppercase bg-[#B2FF00] border-2 border-black px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      +{item.lines} lines
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-700 font-bold text-center py-4">
                Connect GitHub to visualize coding activity logs.
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Time Allocation Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Time Allocation Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-between p-6">
            <div>
              <h3 className="font-black uppercase text-sm mb-2">Calendar Telemetry</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed mb-6">
                Allocation spent in focus slots versus meetings vs. buffer windows. Sync status tracks Google Calendar events.
              </p>
            </div>
            <div>
              <Badge variant="info">Calendar API Sync</Badge>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5 font-black uppercase text-xs">
                  <span>Deep Work</span>
                  <span className="bg-white border border-black px-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{totalCodingTime}%</span>
                </div>
                <div className="w-full bg-white border-2 border-black rounded-none h-4 overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <div
                    className="bg-[#00E5FF] border-r-2 border-black h-full"
                    style={{ width: `${totalCodingTime}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 font-black uppercase text-xs">
                  <span>Meetings</span>
                  <span className="bg-white border border-black px-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{totalMeetingTime}%</span>
                </div>
                <div className="w-full bg-white border-2 border-black rounded-none h-4 overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <div
                    className="bg-[#FF5EA6] border-r-2 border-black h-full"
                    style={{ width: `${totalMeetingTime}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 font-black uppercase text-xs">
                  <span>Buffer / Switch</span>
                  <span className="bg-white border border-black px-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{totalBuffer}%</span>
                </div>
                <div className="w-full bg-white border-2 border-black rounded-none h-4 overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <div
                    className="bg-[#FFE600] border-r-2 border-black h-full"
                    style={{ width: `${totalBuffer}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Retrospectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-black mb-1">Monthly Retrospective</h3>
            <p className="text-[10px] font-black uppercase text-slate-500 mb-4">Quantified review</p>
            <div className="space-y-3 font-bold text-xs sm:text-sm text-slate-880">
              <p>✨ <strong>Top 5 moments:</strong> Deep focus sessions, completed project launch</p>
              <p>📈 <strong>Biggest change:</strong> 30% increase in evening commits</p>
              <p>🎯 <strong>Goal progress:</strong> 85% on Q2 targets</p>
              <p>🔥 <strong>Streak records:</strong> Best coding streak: 8 days</p>
            </div>
          </div>
          <div className="pt-6">
            <Badge variant="success">AI-Generated</Badge>
          </div>
        </Card>

        {/* Yearly */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-black mb-1">Year in Review</h3>
            <p className="text-[10px] font-black uppercase text-slate-500 mb-4">Telemetry wrap</p>
            <div className="space-y-3 font-bold text-xs sm:text-sm text-slate-800">
              <p className="font-extrabold text-black uppercase text-xs">Wrapped analytics summary</p>
              <p>💻 <strong>Coding telemetry:</strong> 1,200 commits across 45 repos</p>
              <p>🎵 <strong>Music telemetry:</strong> 2,400 hours, top genre: Synthwave</p>
              <p>📊 <strong>Productivity telemetry:</strong> 847 focus scores calculated</p>
              <p>🏆 <strong>Best period:</strong> March with 92 average focus score</p>
            </div>
          </div>
          <div className="pt-6">
            <Badge variant="default">Annual Wrap</Badge>
          </div>
        </Card>
      </div>

      {/* Custom Metric Builder */}
      <Card className="p-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-black mb-2">Custom Metric Builder</h3>
        <p className="text-xs sm:text-sm font-bold text-slate-700 mb-4">
          Composite index compiler: construct unique telemetry variables from combined input logs.
        </p>
        <div className="bg-white border-2 border-black p-4 font-mono font-bold text-xs text-[#FF5EA6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
          <p className="uppercase tracking-wide">Calculated Index Formula</p>
          <p className="mt-1 text-black font-extrabold">Focus_Score = commits × (1.0 - meeting_ratio) × music_tempo_energy</p>
        </div>
        <div>
          <Badge variant="info">Advanced Node Config</Badge>
        </div>
      </Card>
    </div>
  )
}
