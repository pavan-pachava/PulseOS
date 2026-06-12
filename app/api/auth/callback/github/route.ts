import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exchangeGitHubCode } from '@/lib/github-api'
import { saveIntegration } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

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
      session.user.id,
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
}
