import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSpotifyCurrentlyPlaying } from '@/lib/spotify-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentTrack = await getSpotifyCurrentlyPlaying(session.user.id)

    return NextResponse.json(currentTrack || { is_playing: false })
  } catch (error) {
    console.error('Get currently playing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch currently playing track' },
      { status: 500 }
    )
  }
}
