'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/LoadingSpinner'
import { ErrorAlert } from '@/components/ErrorAlert'
import { integrationsConfig } from '@/lib/integrations-config'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Integration {
  id: string
  provider: string
  connected_at: string
  updated_at: string
  expires_at: string
  access_token?: string
  refresh_token?: string
  tracks_today?: number
  commits_today?: number
  coding_minutes_today?: number
  temp_avg?: string
  humidity?: number
  rain?: string
}

interface City {
  name: string
  city: string
  lat: number
  lng: number
  pop: number
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const spotifySuccess = searchParams.get('spotify') === 'connected'
  const githubSuccess = searchParams.get('github') === 'connected'
  const wakatimeSuccess = searchParams.get('wakatime') === 'connected'

  // Autocomplete UI states for Weather integration
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [citySearch, setCitySearch] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<City[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const [refreshingWeather, setRefreshingWeather] = useState(false)

  const refreshWeatherData = async () => {
    setRefreshingWeather(true)
    try {
      const res = await fetch(`/api/integrations?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setIntegrations(data.integrations)
      }
    } catch (err) {
      console.error('Failed to refresh weather data:', err)
    } finally {
      setRefreshingWeather(false)
    }
  }

  const formatLastUpdated = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  useEffect(() => {
    async function fetchIntegrations() {
      try {
        const res = await fetch(`/api/integrations?t=${Date.now()}`, { cache: 'no-store' })
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

  useEffect(() => {
    if (connectingProvider !== 'weather') return

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(citySearch)}`)
        if (res.ok) {
          const data = await res.json()
          setCitySuggestions(data)
        }
      } catch (err) {
        console.error('Error searching cities:', err)
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [citySearch, connectingProvider])

  const connectIntegration = async (provider: string) => {
    try {
      if (provider === 'weather') {
        setConnectingProvider('weather')
        setCitySearch('')
        setCitySuggestions([])
        return
      }

      const body = { provider }
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to connect integration')
      }
      
      const data = await res.json()
      if (data.auth_url) {
        window.location.href = data.auth_url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }

  const handleSelectCity = async (city: City) => {
    try {
      setLoading(true)
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'weather',
          city: city.city,
          latitude: city.lat,
          longitude: city.lng,
          fullName: city.name
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to connect weather integration')
      }

      setConnectingProvider(null)
      setCitySearch('')
      setCitySuggestions([])

      const resInt = await fetch(`/api/integrations?t=${Date.now()}`, { cache: 'no-store' })
      if (resInt.ok) {
        const dataInt = await resInt.json()
        setIntegrations(dataInt.integrations)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  const disconnectIntegration = async (provider: string) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (!res.ok) throw new Error('Failed to disconnect integration')
      
      setIntegrations(prev => prev.filter(i => i.provider !== provider))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
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
          ✅ {spotifySuccess 
                ? 'Spotify' 
                : githubSuccess 
                  ? 'GitHub' 
                  : 'WakaTime'} connected successfully to the core kernel!
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationsConfig.map((integration) => {
          const connectedInfo = integrations.find(i => i.provider === integration.id)
          const isConnected = !!connectedInfo

          return (
            <Card key={integration.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-[#FAF9F3] border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none flex items-center justify-center w-12 h-12 shrink-0">
                      {integration.id === 'spotify' ? (
                        <img src="/spotify.png" alt="Spotify" className="w-8 h-8 object-contain" />
                      ) : integration.id === 'github' ? (
                        <img src="/github.png" alt="GitHub" className="w-8 h-8 object-contain" />
                      ) : (
                        integration.icon
                      )}
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

                {/* Metrics Grid or Connection Form */}
                {integration.id === 'weather' && connectingProvider === 'weather' ? (
                  <div className="mt-4 p-4 border-2 border-black bg-[#FAF9F3] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-4 mb-6 rounded-none relative">
                    <p className="text-xs font-black uppercase tracking-wider text-black">Select City Location</p>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type to search city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-none text-xs font-bold uppercase text-black bg-white focus:outline-none"
                        autoFocus
                      />
                      
                      {/* Suggestions list */}
                      {(citySuggestions.length > 0 || loadingSuggestions) && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-30 max-h-48 overflow-y-auto divide-y-2 divide-black">
                          {loadingSuggestions && (
                            <div className="p-3 text-[10px] font-black uppercase text-slate-500 text-center">
                              Searching database...
                            </div>
                          )}
                          {!loadingSuggestions && citySuggestions.map((city) => (
                            <button
                              key={city.name}
                              type="button"
                              onClick={() => handleSelectCity(city)}
                              className="w-full text-left px-3 py-2 text-xs font-bold uppercase hover:bg-[#FFE600] transition-colors block text-black border-none cursor-pointer"
                            >
                              {city.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-[#FF5EA6] text-black hover:bg-[#FF3E8B]"
                        onClick={() => {
                          setConnectingProvider(null)
                          setCitySearch('')
                          setCitySuggestions([])
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF9F3] border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6 rounded-none">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {integration.id === 'spotify' && isConnected ? (
                        <>
                          <div>
                            <p className="text-lg font-black text-black">Live</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-black">{connectedInfo?.tracks_today ?? 0}</p>
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
                            <p className="text-lg font-black text-black">{connectedInfo?.commits_today ?? 0}</p>
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
                            <p className="text-lg font-black text-black">{connectedInfo?.coding_minutes_today ?? 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Min Today</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-black">Active</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sync</p>
                          </div>
                        </>
                      ) : integration.id === 'weather' && isConnected ? (
                        <>
                          <div>
                            <p className="text-lg font-black text-black">{connectedInfo?.temp_avg ?? '-'}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Temp Avg</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-black">{connectedInfo?.humidity ? `${connectedInfo.humidity}%` : '-'}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Humidity</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-black">{connectedInfo?.rain ?? '-'}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Rainfall</p>
                          </div>
                        </>
                      ) : (
                        (integration.id === 'spotify' ? [
                          { label: 'Listening Hours', val: '-' },
                          { label: 'Top Tracks', val: '-' },
                          { label: 'Playlists', val: '-' }
                        ] : integration.id === 'github' ? [
                          { label: 'Commits', val: '-' },
                          { label: 'PRs', val: '-' },
                          { label: 'Reviews', val: '-' }
                        ] : integration.id === 'wakatime' ? [
                          { label: 'Coding Hours', val: '-' },
                          { label: 'Languages', val: '-' }
                        ] : [
                          { label: 'Temp Avg', val: '-' },
                          { label: 'Humidity', val: '-' },
                          { label: 'Rainfall', val: '-' }
                        ]).map((metric, idx) => (
                          <div key={idx}>
                            <p className="text-lg font-black text-black">{metric.val}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{metric.label}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between mt-auto flex-wrap gap-2">
                {integration.id === 'weather' ? (
                  isConnected && connectedInfo ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-black font-black uppercase text-[10px] tracking-wider select-none">
                        📍 Location: {connectedInfo?.access_token || 'San Francisco'}
                      </span>
                      <button
                        onClick={refreshWeatherData}
                        disabled={refreshingWeather}
                        className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center h-6 w-6 hover:scale-110 active:scale-95 transition-all"
                        title="Refresh Weather Data"
                      >
                        <img 
                          src="/reload.png" 
                          alt="Reload" 
                          className={`w-4 h-4 object-contain ${refreshingWeather ? 'animate-spin' : ''}`}
                        />
                      </button>
                      <span className="text-[9px] font-bold text-slate-600 uppercase select-none tracking-wider ml-1 bg-[#FAF9F3] border border-black/15 px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] rounded-none">
                        Updated {formatLastUpdated(connectedInfo?.updated_at)}
                      </span>
                    </div>
                  ) : null
                ) : (
                  <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isConnected ? 'text-[#10B981]' : 'text-slate-500'
                  }`}>
                    <span className={`w-2 h-2 border border-black rounded-none ${isConnected ? 'bg-[#10B981]' : 'bg-slate-400'}`}></span>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                )}
                
                {/* Action Buttons */}
                {integration.id === 'weather' ? (
                  connectingProvider !== 'weather' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="ml-auto"
                      onClick={() => connectIntegration('weather')}
                    >
                      Choose City
                    </Button>
                  )
                ) : (
                  <>
                    {/* Connect Button */}
                    {!isConnected && connectingProvider !== integration.id && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => connectIntegration(integration.id)}
                      >
                        Connect
                      </Button>
                    )}
                    
                    {/* Disconnect Button */}
                    {isConnected && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-[#FF5EA6] text-black hover:bg-[#FF3E8B]"
                        onClick={() => disconnectIntegration(integration.id)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </>
                )}


              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
