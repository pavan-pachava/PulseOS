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
    const now = new Date()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const startOfDayTimestamp = startOfDay.getTime()
    const todayStr = startOfDay.toISOString().split('T')[0]

    // Calculate dates list for the last 30 days (including today)
    const dates: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }
    const startDateStr = dates[0]
    const endDateStr = dates[dates.length - 1]

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

    let commits: any[] = []
    if (githubIntegration) {
      try {
        commits = await getGitHubCommits(userId, 100).catch(e => {
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

    let wakatimeSummaries: any[] | null = null
    if (wakatimeIntegration) {
      try {
        wakatimeSummaries = await getWakaTimeSummaries(userId, startDateStr, endDateStr).catch(e => {
          console.error('WakaTime summaries fetch failed:', e)
          return null
        })
      } catch (wakatimeError) {
        console.error('WakaTime data aggregation failed:', wakatimeError)
      }
    }

    const wakaDaysMap: { [date: string]: number } = {}
    if (wakatimeSummaries) {
      for (const day of wakatimeSummaries) {
        const dateKey = day.range?.date
        const codingSeconds = day.grand_total?.total_seconds || 0
        if (dateKey) {
          wakaDaysMap[dateKey] = Math.round(codingSeconds / 60)
        }
      }
    }
    codingMinutesToday = wakaDaysMap[todayStr] || 0

    const githubDaysMap: { [date: string]: number } = {}
    if (githubIntegration && Array.isArray(commits)) {
      for (const commit of commits) {
        if (commit.time) {
          const dateKey = new Date(commit.time).toISOString().split('T')[0]
          githubDaysMap[dateKey] = (githubDaysMap[dateKey] || 0) + 1
        }
      }
    }

    // Build daily activity log for streak and heatmap calculation
    const dailyActivity = dates.map(date => {
      const codingMinutes = wakaDaysMap[date] || 0
      const commitsCount = githubDaysMap[date] || 0
      const isActive = codingMinutes > 0 || commitsCount > 0
      
      let score = 0
      if (wakatimeIntegration) {
        score = Math.min(100, Math.round((codingMinutes / 120) * 100))
      } else if (githubIntegration) {
        score = Math.min(100, Math.round((commitsCount / 5) * 100))
      }
      
      return {
        date,
        codingMinutes,
        commitsCount,
        isActive,
        score
      }
    })

    // Calculate Week Heatmap (last 7 days)
    const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekHeatmap = dailyActivity.slice(-7).map(day => {
      const d = new Date(day.date)
      const dayName = dayOfWeekNames[d.getDay()]
      
      let label = 'Inactive'
      if (day.score >= 85) label = 'Excellent'
      else if (day.score >= 70) label = 'Good'
      else if (day.score >= 50) label = 'Moderate'
      else if (day.score >= 30) label = 'Low'
      else if (day.score > 0) label = 'Very Low'
      
      return {
        day: dayName,
        score: day.score,
        label
      }
    })

    // Calculate Streaks
    function getStreakStats(activeDays: boolean[]) {
      let currentStreak = 0
      let bestStreak = 0
      
      const lastIdx = activeDays.length - 1
      let checkIndex = lastIdx
      if (lastIdx >= 0 && !activeDays[lastIdx] && activeDays[lastIdx - 1]) {
        checkIndex = lastIdx - 1
      }
      
      while (checkIndex >= 0 && activeDays[checkIndex]) {
        currentStreak++
        checkIndex--
      }
      
      let runningStreak = 0
      for (let i = 0; i < activeDays.length; i++) {
        if (activeDays[i]) {
          runningStreak++
          if (runningStreak > bestStreak) {
            bestStreak = runningStreak
          }
        } else {
          runningStreak = 0
        }
      }
      
      return {
        current: currentStreak,
        best: Math.max(currentStreak, bestStreak)
      }
    }

    const streaksList: Array<{ name: string; current: number; best: number; icon: string }> = []
    
    if (wakatimeIntegration) {
      const activeCoding = dailyActivity.map(day => day.codingMinutes > 0)
      const codingStats = getStreakStats(activeCoding)
      streaksList.push({
        name: 'Coding Days',
        current: codingStats.current,
        best: codingStats.best,
        icon: '💻'
      })
    }
    
    if (githubIntegration) {
      const activeCommits = dailyActivity.map(day => day.commitsCount > 0)
      const commitStats = getStreakStats(activeCommits)
      streaksList.push({
        name: 'Commit Days',
        current: commitStats.current,
        best: commitStats.best,
        icon: '🚀'
      })
    }
    
    if (streaksList.length === 0) {
      streaksList.push({
        name: 'Coding & Commits',
        current: 0,
        best: 0,
        icon: '⚡'
      })
    }

    const activeOverall = dailyActivity.map(day => day.isActive)
    const overallStats = getStreakStats(activeOverall)

    // Calculate dynamic focus score components
    let commitScore = 0
    let codingScore = 0
    let musicScore = 0
    
    if (githubIntegration) {
      commitScore = Math.min(100, commitsToday * 20) // e.g. 5 commits = 100%
    }
    if (wakatimeIntegration) {
      codingScore = Math.min(100, Math.round((codingMinutesToday / 120) * 100)) // 2 hours = 100%
    }
    if (spotifyIntegration) {
      musicScore = Math.min(100, tracksToday * 5) // e.g. 20 tracks = 100%
    }
    
    const focusScoreComponents = [
      { label: 'Commit Quality', value: commitScore },
      { label: 'Deep Work Blocks', value: codingScore },
      { label: 'Music Sync Ratio', value: musicScore }
    ]
    
    const activeComponents = focusScoreComponents.filter((c, idx) => {
      if (idx === 0) return !!githubIntegration
      if (idx === 1) return !!wakatimeIntegration
      if (idx === 2) return !!spotifyIntegration
      return false
    })
    
    const averageScore = activeComponents.length > 0 
      ? Math.round(activeComponents.reduce((acc, c) => acc + c.value, 0) / activeComponents.length)
      : 0

    // Calculate dynamic morning briefing text
    let morningBriefing = 'No Data Available'
    if (githubIntegration || wakatimeIntegration) {
      if (commitsToday > 0 && codingMinutesToday > 0) {
        morningBriefing = `You are highly focused today. You logged ${codingMinutesToday} minutes of coding and pushed ${commitsToday} commits.`
      } else if (commitsToday > 0) {
        morningBriefing = `Great progress on GitHub today! You pushed ${commitsToday} commits.`
      } else if (codingMinutesToday > 0) {
        morningBriefing = `Good work logging ${codingMinutesToday} minutes of coding via WakaTime.`
      } else {
        morningBriefing = 'No activity recorded yet today. Start coding or committing to log metrics.'
      }
    }
    if (spotifyIntegration && tracksToday > 0) {
      if (morningBriefing === 'No Data Available' || morningBriefing.startsWith('No activity')) {
        morningBriefing = `You listened to ${tracksToday} songs on Spotify today.`
      } else {
        morningBriefing += ` You listened to ${tracksToday} songs on Spotify today.`
      }
    }

    const todayAtGlance: Array<{ label: string; value: string | number; unit: string }> = [
      { label: 'Energy Level', value: 78, unit: '%' },
      { label: 'Current Streak', value: overallStats.current, unit: 'days' },
      { label: 'Tracks Today', value: spotifyIntegration ? tracksToday : '-', unit: 'songs' },
      { label: 'Commits Today', value: githubIntegration ? commitsToday : '-', unit: 'commits' },
      { label: 'Coding Time', value: wakatimeIntegration ? codingMinutesToday : '-', unit: 'min' }
    ]

    const metrics = {
      today_at_glance: todayAtGlance,
      focus_score: {
        score: averageScore || 0,
        components: focusScoreComponents
      },
      live_now: {
        spotify_connected: !!spotifyIntegration,
        github_connected: !!githubIntegration,
        wakatime_connected: !!wakatimeIntegration
      },
      week_heatmap: weekHeatmap,
      streaks: streaksList,
      morning_briefing: morningBriefing
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
