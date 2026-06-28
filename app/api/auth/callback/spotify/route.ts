import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exchangeSpotifyCode } from '@/lib/spotify-api'
import { saveSpotifyIntegration } from '@/lib/auth-service'

export const GET = auth(async function GET(request: any) {
  try {
    console.log('Spotify callback started...')
    const session = request.auth
    console.log('Session user ID:', session?.user?.id)

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const userId = state || session?.user?.id
    console.log('Resolved user ID in callback:', userId)

    if (!userId) {
      console.error('No session or state user ID found in Spotify callback')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (error) {
      console.error('Spotify error param:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${error}`, request.url)
      )
    }

    if (!code) {
      console.error('No code found in Spotify callback')
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=no_code', request.url)
      )
    }

    console.log('Exchanging code for token...')
    const tokenResponse = await exchangeSpotifyCode(code)
    console.log('Token response received')

    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)
    console.log('Saving integration for user:', userId)
    
    await saveSpotifyIntegration(
      userId,
      tokenResponse.access_token,
      tokenResponse.refresh_token || '',
      expiresAt
    )
    console.log('Integration saved successfully')

    return NextResponse.redirect(
      new URL('/dashboard/integrations?spotify=connected', request.url)
    )
  } catch (error) {
    console.error('Spotify callback exception:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=callback_failed', request.url)
    )
  }
})
