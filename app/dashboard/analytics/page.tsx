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
  const [isUsingMockSpotify, setIsUsingMockSpotify] = useState(false)
  const [isUsingMockGitHub, setIsUsingMockGitHub] = useState(false)

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      
      // Fetch Spotify
      try {
        const res = await fetch('/api/data/spotify/history?limit=20')
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          setRecentTracks(data.items)
          setIsUsingMockSpotify(false)
        } else {
          throw new Error('No tracks')
        }
      } catch (err) {
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
        if (data.items && data.items.length > 0) {
          setRecentCommits(data.items)
          setIsUsingMockGitHub(false)
        } else {
          throw new Error('No commits')
        }
      } catch (err) {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Deep Analytics</h1>
          <p className="text-slate-400">Loading your history...</p>
        </div>
        <LoadingCard />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-white">Deep Analytics</h1>
          {(isUsingMockSpotify || isUsingMockGitHub) && (
            <Badge variant="warning">
              {isUsingMockSpotify && isUsingMockGitHub ? 'Mock Data' : isUsingMockSpotify ? 'Mock Spotify' : 'Mock GitHub'}
            </Badge>
          )}
          {(!isUsingMockSpotify && !isUsingMockGitHub) && (
            <Badge variant="success">Live Data</Badge>
          )}
        </div>
        <p className="text-slate-400">Charts and breakdowns for the data-curious</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Listening Timeline */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Listening Timeline</h2>
          {!isUsingMockSpotify && <span className="text-sm text-slate-400">{recentTracks.length} recent tracks</span>}
        </div>
        <Card>
          <p className="text-sm text-slate-400 mb-4">Full history of what you listened to, when, for how long.</p>
          <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {recentTracks.length > 0 ? (
              recentTracks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.track.image && (
                      <img src={item.track.image} alt="Album" className="w-10 h-10 rounded shadow" />
                    )}
                    <div>
                      <p className="font-semibold text-white leading-tight">{item.track.name}</p>
                      <p className="text-xs text-slate-400">{item.track.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white font-mono">{Math.floor(item.track.duration_ms / 60000)}:{(Math.floor((item.track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}</p>
                    <p className="text-[10px] text-slate-500">
                      {isNaN(new Date(item.played_at).getTime()) 
                        ? item.played_at 
                        : new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">Connect Spotify to see your listening history</p>
            )}
          </div>
        </Card>
      </section>

      {/* Coding Timeline */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Coding Timeline</h2>
          {!isUsingMockGitHub && <span className="text-sm text-slate-400">{recentCommits.length} recent commits</span>}
        </div>
        <Card>
          <p className="text-sm text-slate-400 mb-4">Commit frequency over time, language breakdown per month, most productive repos, commit message tone trend</p>
          <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {recentCommits.length > 0 ? (
              recentCommits.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div>
                    <p className="font-semibold text-white leading-tight">{item.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.repo} • {
                      isNaN(new Date(item.time).getTime()) 
                        ? item.time 
                        : new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    }</p>
                  </div>
                  <p className="text-sm font-mono text-green-400">+{item.lines}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">Connect GitHub to see your coding history</p>
            )}
          </div>
        </Card>
      </section>

      {/* Time Allocation Breakdown */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Time Allocation Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <p className="text-sm text-slate-400 mb-4">How your calendar time is actually spent: meetings vs deep work vs buffer. Weekly and monthly views.</p>
            <Badge>Calendar API</Badge>
          </Card>

          <Card>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Deep Work</span>
                  <span className="font-bold text-white">{totalCodingTime}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-full rounded-full"
                    style={{ width: `${totalCodingTime}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Meetings</span>
                  <span className="font-bold text-white">{totalMeetingTime}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-red-600 h-full rounded-full"
                    style={{ width: `${totalMeetingTime}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Buffer</span>
                  <span className="font-bold text-white">{totalBuffer}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
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
        <Card>
          <h3 className="text-lg font-bold text-white mb-3">Monthly Retrospective</h3>
          <Badge className="mb-4">AI-generated</Badge>
          <div className="space-y-3 text-slate-300 text-sm">
            <p>✨ <strong>Top 5 moments:</strong> Deep focus sessions, completed project launch</p>
            <p>📈 <strong>Biggest change:</strong> 30% increase in evening commits</p>
            <p>🎯 <strong>Goal progress:</strong> 85% on Q2 targets</p>
            <p>🔥 <strong>Streak records:</strong> Best coding streak: 8 days</p>
          </div>
        </Card>

        {/* Yearly */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-3">Year in Review</h3>
          <Badge className="mb-4">annual</Badge>
          <div className="space-y-3 text-slate-300 text-sm">
            <p className="font-semibold text-white">Like Spotify Wrapped but for your entire life</p>
            <p>💻 <strong>Coding Year:</strong> 1,200 commits across 45 repos</p>
            <p>🎵 <strong>Music Year:</strong> 2,400 hours, top genre: Synthwave</p>
            <p>📊 <strong>Productivity Year:</strong> 847 focused days, 120 correlation discoveries</p>
            <p>🏆 <strong>Best Month:</strong> March with 92 average focus score</p>
          </div>
        </Card>
      </div>

      {/* Custom Metric Builder */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-2">Custom Metric Builder</h3>
        <p className="text-slate-300 text-sm mb-4">
          Power-user feature: define your own composite metric from any data sources.
        </p>
        <div className="bg-slate-700/50 p-4 rounded-lg font-mono text-xs text-slate-300 mb-4">
          <p className="text-purple-400">Focus Score = commits × (1 - meeting_ratio) × music_energy</p>
        </div>
        <Badge>advanced</Badge>
      </Card>
    </div>
  )
}
