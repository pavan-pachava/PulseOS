import { getSpotifyIntegration } from './auth-service'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_ID || '',
    client_secret: process.env.SPOTIFY_SECRET || '',
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Spotify token')
  }

  const data = (await response.json()) as SpotifyTokenResponse
  return data.access_token
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const integration = await getSpotifyIntegration(userId)
  if (!integration) return null

  // Check if token is expired
  if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
    // Refresh token
    const newAccessToken = await refreshAccessToken(userId, integration.refresh_token)
    return newAccessToken
  }

  return integration.access_token
}

export async function getSpotifyCurrentlyPlaying(userId: string) {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return null

  const response = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    if (response.status === 204) return null // No content playing
    throw new Error('Failed to fetch currently playing')
  }

  return await response.json()
}

export async function getSpotifyRecentlyPlayed(userId: string, limit = 50) {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return []

  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch recently played')
  }

  const data = await response.json()
  return data.items || []
}

export async function getSpotifyTopTracks(userId: string, timeRange = 'medium_term', limit = 50) {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return []

  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch top tracks')
  }

  const data = await response.json()
  return data.items || []
}

export async function getSpotifyAudioFeatures(userId: string, trackIds: string[]) {
  if (trackIds.length === 0) return []

  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return []

  const ids = trackIds.slice(0, 100).join(',')
  const response = await fetch(
    `${SPOTIFY_API_BASE}/audio-features?ids=${ids}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch audio features')
  }

  const data = await response.json()
  return data.audio_features || []
}

export function buildSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_ID || '',
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_CALLBACK_URL || '',
    scope: [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'user-library-read',
      'user-modify-playback-state',
    ].join(' '),
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function exchangeSpotifyCode(code: string): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SPOTIFY_CALLBACK_URL || '',
    client_id: process.env.SPOTIFY_ID || '',
    client_secret: process.env.SPOTIFY_SECRET || '',
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Spotify code for token')
  }

  return (await response.json()) as SpotifyTokenResponse
}

export async function spotifyControlPlayback(userId: string, action: 'play' | 'pause' | 'next' | 'previous') {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) throw new Error('Spotify not integrated')

  let url = ''
  let method = 'POST'

  if (action === 'play') {
    url = `${SPOTIFY_API_BASE}/me/player/play`
    method = 'PUT'
  } else if (action === 'pause') {
    url = `${SPOTIFY_API_BASE}/me/player/pause`
    method = 'PUT'
  } else if (action === 'next') {
    url = `${SPOTIFY_API_BASE}/me/player/next`
    method = 'POST'
  } else if (action === 'previous') {
    url = `${SPOTIFY_API_BASE}/me/player/previous`
    method = 'POST'
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No active Spotify player found. Open Spotify and play a track first!')
    }
    const errData = await response.json().catch(() => ({}))
    const msg = errData?.error?.message || 'Failed to control playback'
    throw new Error(msg)
  }

  return { success: true }
}
