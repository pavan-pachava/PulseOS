import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getGitHubCommits } from '@/lib/github-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let commits = []
    try {
      commits = await getGitHubCommits(session.user.id, 20)
    } catch (e) {
      console.error('Failed to fetch github history:', e)
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({
      items: (commits || []).map((c: any) => ({
        message: c.message,
        repo: c.repo,
        time: c.time,
        lines: c.lines,
      })),
    })
  } catch (error) {
    console.error('Get github commits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
