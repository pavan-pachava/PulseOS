import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSpotifyRecentlyPlayed } from '@/lib/spotify-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    let recentlyPlayed = []
    try {
      recentlyPlayed = await getSpotifyRecentlyPlayed(session.user.id, Math.min(limit, 50))
    } catch (e) {
      console.error('Failed to fetch spotify history:', e)
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({
      items: (recentlyPlayed || []).map((item: any) => ({
        track: {
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name,
          album: item.track.album.name,
          image: item.track.album.images[0]?.url,
          duration_ms: item.track.duration_ms,
        },
        played_at: item.played_at,
      })),
    })
  } catch (error) {
    console.error('Get recently played error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recently played tracks' },
      { status: 500 }
    )
  }
}
