import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exchangeWakaTimeCode } from '@/lib/wakatime-api'
import { saveIntegration } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    console.log('WakaTime callback started...')
    const session = await auth()
    
    if (!session?.user?.id) {
      console.error('No session found in WakaTime callback')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('WakaTime error param:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${error}`, request.url)
      )
    }

    if (!code) {
      console.error('No code found in WakaTime callback')
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=no_code', request.url)
      )
    }

    console.log('Exchanging WakaTime code for token...')
    const tokenResponse = await exchangeWakaTimeCode(code)
    
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)
    
    await saveIntegration(
      session.user.id,
      'wakatime',
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      expiresAt
    )

    return NextResponse.redirect(
      new URL('/dashboard/integrations?wakatime=connected', request.url)
    )
  } catch (error) {
    console.error('WakaTime callback exception:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=callback_failed', request.url)
    )
  }
}
