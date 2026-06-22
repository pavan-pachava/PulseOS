import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserIntegrations } from '@/lib/auth-service'
import { buildSpotifyAuthUrl, getSpotifyRecentlyPlayed } from '@/lib/spotify-api'
import { buildGitHubAuthUrl, getGitHubCommits } from '@/lib/github-api'
import { buildWakaTimeAuthUrl, getWakaTimeSummaries } from '@/lib/wakatime-api'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await getUserIntegrations(session.user.id)
    
    // Filter metrics for the current calendar day (from 12:00 AM)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const startOfDayTimestamp = startOfDay.getTime()
    const todayStr = startOfDay.toISOString().split('T')[0]
    
    const enrichedIntegrations = await Promise.all(integrations.map(async (integration: any) => {
      if (integration.provider === 'spotify') {
        try {
          const recent = await getSpotifyRecentlyPlayed(session.user.id, 50)
          const tracksToday = recent.filter((item: any) => new Date(item.played_at).getTime() > startOfDayTimestamp).length
          return { ...integration, tracks_today: tracksToday }
        } catch (e) {
          console.error('Failed to fetch spotify metrics:', e)
          return integration
        }
      }
      if (integration.provider === 'github') {
        try {
          const commits = await getGitHubCommits(session.user.id, 100)
          const commitsToday = commits.filter((c: any) => new Date(c.time).getTime() > startOfDayTimestamp).length
          return { ...integration, commits_today: commitsToday }
        } catch (e) {
          console.error('Failed to fetch github metrics:', e)
          return integration
        }
      }
      if (integration.provider === 'wakatime') {
        try {
          const summaries = await getWakaTimeSummaries(session.user.id, todayStr, todayStr)
          const codingSeconds = summaries?.reduce((acc: number, day: any) => acc + (day.grand_total?.total_seconds || 0), 0) || 0
          return { ...integration, coding_minutes_today: Math.round(codingSeconds / 60) }
        } catch (e) {
          console.error('Failed to fetch wakatime metrics:', e)
          return integration
        }
      }
      return integration
    }))

    return NextResponse.json({
      integrations: enrichedIntegrations.map((integration: any) => ({
        id: integration.id,
        provider: integration.provider,
        connected_at: integration.connected_at,
        updated_at: integration.updated_at,
        expires_at: integration.expires_at,
        tracks_today: integration.tracks_today,
        commits_today: integration.commits_today,
        coding_minutes_today: integration.coding_minutes_today,
      })),
    })
  } catch (error) {
    console.error('Get integrations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider } = body

    if (provider === 'spotify') {
      const authUrl = buildSpotifyAuthUrl()
      return NextResponse.json({ auth_url: authUrl })
    }

    if (provider === 'github') {
      const authUrl = buildGitHubAuthUrl()
      return NextResponse.json({ auth_url: authUrl })
    }

    if (provider === 'wakatime') {
      const authUrl = buildWakaTimeAuthUrl()
      return NextResponse.json({ auth_url: authUrl })
    }

    return NextResponse.json(
      { error: 'Unsupported provider' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Create integration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
