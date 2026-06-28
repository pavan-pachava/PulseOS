import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { spotifyControlPlayback } from '@/lib/spotify-api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (!action || !['play', 'pause', 'next', 'previous'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }

    const result = await spotifyControlPlayback(session.user.id, action)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Spotify control API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to control playback' },
      { status: 500 }
    )
  }
}
