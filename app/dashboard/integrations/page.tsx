'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/LoadingSpinner'
import { ErrorAlert } from '@/components/ErrorAlert'
import { mockIntegrations } from '@/lib/mockData'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Integration {
  id: string
  provider: string
  connected_at: string
  updated_at: string
  expires_at: string
  tracks_today?: number
  commits_today?: number
  coding_minutes_today?: number
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const spotifySuccess = searchParams.get('spotify') === 'connected'
  const githubSuccess = searchParams.get('github') === 'connected'
  const wakatimeSuccess = searchParams.get('wakatime') === 'connected'

  useEffect(() => {
    async function fetchIntegrations() {
      try {
        const res = await fetch('/api/integrations')
        if (!res.ok) throw new Error('Failed to fetch integrations')
        const data = await res.json()
        setIntegrations(data.integrations)
      } catch (err) {
        console.error('Error fetching integrations:', err)
        setError(err instanceof Error ? err.message : 'Failed to load integrations')
        setIntegrations([])
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [spotifySuccess, githubSuccess, wakatimeSuccess])

  const connectIntegration = async (provider: string) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (!res.ok) throw new Error('Failed to get auth URL')
      const data = await res.json()
      window.location.href = data.auth_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 text-black">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Data Integrations</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading telemetry...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-black animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Data Integrations</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">What PulseOS plugs into</p>
      </div>

      {error && <ErrorAlert message={error} />}
      {(spotifySuccess || githubSuccess || wakatimeSuccess) && (
        <div className="bg-[#00E5FF] border-[3px] border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-extrabold uppercase text-xs tracking-wider">
          ✅ {spotifySuccess ? 'Spotify' : githubSuccess ? 'GitHub' : 'WakaTime'} connected successfully to the core kernel!
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockIntegrations.map((integration) => {
          const connectedInfo = integrations.find(i => i.provider === integration.id)
          const isConnected = !!connectedInfo

          return (
            <Card key={integration.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-[#FAF9F3] border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
                      {integration.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-black">{integration.name}</h3>
                      <Badge variant={isConnected ? "success" : "default"}>{integration.badge}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-slate-800 font-bold text-xs sm:text-sm leading-relaxed mb-6">
                  {integration.description}
                </p>

                {/* Metrics Grid */}
                <div className="bg-[#FAF9F3] border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6 rounded-none">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {integration.id === 'spotify' && isConnected ? (
                      <>
                        <div>
                          <p className="text-lg font-black text-black">Live</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-black">{connectedInfo.tracks_today ?? 0}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Songs Today</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-black">Active</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sync</p>
                        </div>
                      </>
                    ) : integration.id === 'github' && isConnected ? (
                      <>
                        <div>
                          <p className="text-lg font-black text-black">Live</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-black">{connectedInfo.commits_today ?? 0}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Commits Today</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-black">Active</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sync</p>
                        </div>
                      </>
                    ) : integration.id === 'wakatime' && isConnected ? (
                      <>
                        <div>
                          <p className="text-lg font-black text-black">Live</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-black">{connectedInfo.coding_minutes_today ?? 0}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Min Today</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-black">Active</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sync</p>
                        </div>
                      </>
                    ) : (
                      Object.entries(integration.metrics).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-lg font-black text-black">{value as string}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 capitalize">{key.replace(/_/g, ' ')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  isConnected ? 'text-[#10B981]' : 'text-slate-500'
                }`}>
                  <span className={`w-2 h-2 border border-black rounded-none ${isConnected ? 'bg-[#10B981]' : 'bg-slate-400'}`}></span>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                {(integration.id === 'spotify' || integration.id === 'github' || integration.id === 'wakatime') && !isConnected && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => connectIntegration(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
