'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner, LoadingCard } from '@/components/LoadingSpinner'
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
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const spotifySuccess = searchParams.get('spotify') === 'connected'
  const githubSuccess = searchParams.get('github') === 'connected'

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
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [spotifySuccess, githubSuccess])

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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Data Integrations</h1>
          <p className="text-slate-400">Loading...</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Data Integrations</h1>
        <p className="text-slate-400">What PulseOS plugs into</p>
      </div>

      {error && <ErrorAlert message={error} />}
      {(spotifySuccess || githubSuccess) && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <p className="text-green-300">✅ {spotifySuccess ? 'Spotify' : 'GitHub'} connected successfully!</p>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockIntegrations.map((integration) => {
          const connectedInfo = integrations.find(i => i.provider === integration.id)
          const isConnected = !!connectedInfo

          return (
            <Card key={integration.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{integration.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{integration.name}</h3>
                    <Badge>{integration.badge}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 flex-1">
                {integration.description}
              </p>

              {/* Metrics */}
              <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {integration.id === 'spotify' && isConnected ? (
                    <>
                      <div>
                        <p className="text-xl font-bold text-white">Live</p>
                        <p className="text-xs text-slate-400">Status</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">{connectedInfo.tracks_today || '-'}</p>
                        <p className="text-xs text-slate-400">Songs Today</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">Active</p>
                        <p className="text-xs text-slate-400">Sync</p>
                      </div>
                    </>
                  ) : integration.id === 'github' && isConnected ? (
                    <>
                      <div>
                        <p className="text-xl font-bold text-white">Live</p>
                        <p className="text-xs text-slate-400">Status</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">{connectedInfo.commits_today || '-'}</p>
                        <p className="text-xs text-slate-400">Commits Today</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">Active</p>
                        <p className="text-xs text-slate-400">Sync</p>
                      </div>
                    </>
                  ) : (
                    Object.entries(integration.metrics).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xl font-bold text-white">{value as string}</p>
                        <p className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold flex items-center gap-2 ${
                  isConnected ? 'text-green-400' : 'text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-slate-600'}`}></span>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                {(integration.id === 'spotify' || integration.id === 'github') && !isConnected && (
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
