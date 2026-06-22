import { getIntegrationByProvider } from './auth-service'

const WAKATIME_API_BASE = 'https://api.wakatime.com/api/v1'

export interface WakaTimeTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  scope: string
  uid: string
}

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.WAKATIME_ID || '',
    client_secret: process.env.WAKATIME_SECRET || '',
    redirect_uri: process.env.WAKATIME_CALLBACK_URL || '',
  })

  const response = await fetch('https://wakatime.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh WakaTime token')
  }

  const data = (await response.json()) as WakaTimeTokenResponse
  return data.access_token
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const integration = await getIntegrationByProvider(userId, 'wakatime')
  if (!integration) return null

  // Check if token is expired (WakaTime tokens expire in 10 years, but let's be safe)
  if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
    return await refreshAccessToken(userId, integration.refresh_token)
  }

  return integration.access_token
}

export async function getWakaTimeStats(userId: string, range = 'last_7_days') {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return null

  const response = await fetch(`${WAKATIME_API_BASE}/users/current/stats/${range}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch WakaTime stats')
  }

  const data = await response.json()
  return data.data
}

export async function getWakaTimeSummaries(userId: string, start: string, end: string) {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return null

  const response = await fetch(
    `${WAKATIME_API_BASE}/users/current/summaries?start=${start}&end=${end}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch WakaTime summaries')
  }

  const data = await response.json()
  return data.data
}

export function buildWakaTimeAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.WAKATIME_ID || '',
    response_type: 'code',
    redirect_uri: process.env.WAKATIME_CALLBACK_URL || '',
    scope: 'email,read_stats,read_summaries',
  })

  return `https://wakatime.com/oauth/authorize?${params.toString()}`
}

export async function exchangeWakaTimeCode(code: string): Promise<WakaTimeTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.WAKATIME_ID || '',
    client_secret: process.env.WAKATIME_SECRET || '',
    redirect_uri: process.env.WAKATIME_CALLBACK_URL || '',
  })

  const response = await fetch('https://wakatime.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('WakaTime token exchange error:', errorBody)
    throw new Error('Failed to exchange WakaTime code for token')
  }

  return (await response.json()) as WakaTimeTokenResponse
}
