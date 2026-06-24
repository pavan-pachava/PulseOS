import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSpotifyCurrentlyPlaying, getSpotifyRecentlyPlayed } from '@/lib/spotify-api'
import { getGitHubCommits } from '@/lib/github-api'
import { getWakaTimeSummaries } from '@/lib/wakatime-api'
import { getSpotifyIntegration, getIntegrationByProvider } from '@/lib/auth-service'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const [spotifyIntegration, githubIntegration, wakatimeIntegration] = await Promise.all([
      getSpotifyIntegration(userId),
      getIntegrationByProvider(userId, 'github'),
      getIntegrationByProvider(userId, 'wakatime')
    ])
    
    let currentMood = 'Unknown'
    let tracksToday = 0
    let commitsToday = 0
    let codingMinutesToday = 0

    // Filter metrics for the current day (from 12:00 AM)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const startOfDayTimestamp = startOfDay.getTime()
    const todayStr = startOfDay.toISOString().split('T')[0]

    if (spotifyIntegration) {
      try {
        const [currentPlaying, recentTracks] = await Promise.all([
          getSpotifyCurrentlyPlaying(userId).catch(e => {
            console.error('Spotify current playing fetch failed:', e)
            return null
          }),
          getSpotifyRecentlyPlayed(userId, 50).catch(e => {
            console.error('Spotify recently played fetch failed:', e)
            return []
          })
        ])

        if (currentPlaying?.item) {
          currentMood = 'Musical'
        }

        if (Array.isArray(recentTracks)) {
          tracksToday = recentTracks.filter((item: any) => 
            item?.played_at && new Date(item.played_at).getTime() > startOfDayTimestamp
          ).length
        }
      } catch (spotifyError) {
        console.error('Spotify data aggregation failed:', spotifyError)
      }
    }

    if (githubIntegration) {
      try {
        const commits = await getGitHubCommits(userId, 100).catch(e => {
          console.error('GitHub commits fetch failed:', e)
          return []
        })
        
        if (Array.isArray(commits)) {
          commitsToday = commits.filter((c: any) => 
            c?.time && new Date(c.time).getTime() > startOfDayTimestamp
          ).length
        }
      } catch (githubError) {
        console.error('GitHub data aggregation failed:', githubError)
      }
    }

    if (wakatimeIntegration) {
      try {
        const summaries = await getWakaTimeSummaries(userId, todayStr, todayStr).catch(e => {
          console.error('WakaTime summaries fetch failed:', e)
          return null
        })
        if (summaries) {
          const codingSeconds = summaries.reduce((acc: number, day: any) => acc + (day.grand_total?.total_seconds || 0), 0)
          codingMinutesToday = Math.round(codingSeconds / 60)
        }
      } catch (wakatimeError) {
        console.error('WakaTime data aggregation failed:', wakatimeError)
      }
    }

    const todayAtGlance: Array<{ label: string; value: string | number; unit: string }> = [
      { label: 'Energy Level', value: 78, unit: '%' },
      { label: 'Current Streak', value: 12, unit: 'days' },
      { label: 'Tracks Today', value: spotifyIntegration ? tracksToday : '-', unit: 'songs' },
      { label: 'Commits Today', value: githubIntegration ? commitsToday : '-', unit: 'commits' },
      { label: 'Coding Time', value: wakatimeIntegration ? codingMinutesToday : '-', unit: 'min' }
    ]

    const metrics = {
      today_at_glance: todayAtGlance,
      focus_score: 76,
      live_now: {
        spotify_connected: !!spotifyIntegration,
        github_connected: !!githubIntegration,
        wakatime_connected: !!wakatimeIntegration
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Get dashboard metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
