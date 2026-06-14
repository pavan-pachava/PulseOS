import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSpotifyCurrentlyPlaying, getSpotifyRecentlyPlayed } from '@/lib/spotify-api'
import { getGitHubCommits } from '@/lib/github-api'
import { getSpotifyIntegration, getIntegrationByProvider } from '@/lib/auth-service'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const [spotifyIntegration, githubIntegration] = await Promise.all([
      getSpotifyIntegration(userId),
      getIntegrationByProvider(userId, 'github')
    ])
    
    let currentMood = 'Unknown'
    let tracksToday = 0
    let commitsToday = 0

    // Use a 24-hour window for "today" metrics to account for timezone differences and late-night work
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000

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
            item?.played_at && new Date(item.played_at).getTime() > twentyFourHoursAgo
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
            c?.time && new Date(c.time).getTime() > twentyFourHoursAgo
          ).length
        }
      } catch (githubError) {
        console.error('GitHub data aggregation failed:', githubError)
      }
    }

    const todayAtGlance = [
      { label: 'Energy Level', value: 78, unit: '%' },
      { label: 'Meeting Load', value: 5, unit: 'meetings' },
      { label: 'Current Streak', value: 12, unit: 'days' },
    ]

    if (spotifyIntegration) {
      todayAtGlance.push({ label: 'Tracks Today', value: tracksToday, unit: 'songs' })
      todayAtGlance.push({ label: 'Listening Mood', value: currentMood, unit: 'mood' })
    }

    if (githubIntegration) {
      todayAtGlance.push({ label: 'Commits Today', value: commitsToday, unit: 'commits' })
    }

    const metrics = {
      today_at_glance: todayAtGlance,
      focus_score: 76,
      live_now: {
        spotify_connected: !!spotifyIntegration,
        github_connected: !!githubIntegration
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
