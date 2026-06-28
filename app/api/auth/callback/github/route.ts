import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exchangeGitHubCode } from '@/lib/github-api'
import { saveIntegration } from '@/lib/auth-service'

export const GET = auth(async function GET(request: any) {
  try {
    const session = request.auth

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const userId = state || session?.user?.id

    if (!userId) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (error) {
      console.error('GitHub error param:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${error}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=no_code', request.url)
      )
    }

    const tokenResponse = await exchangeGitHubCode(code)

    await saveIntegration(
      userId,
      'github',
      tokenResponse.access_token,
      '', // GitHub OAuth tokens don't always provide a refresh token in the standard flow
      null // Tokens are often long-lived
    )

    return NextResponse.redirect(
      new URL('/dashboard/integrations?github=connected', request.url)
    )
  } catch (error) {
    console.error('GitHub callback exception:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=callback_failed', request.url)
    )
  }
})
