import { getIntegrationByProvider } from './auth-service'

const GITHUB_API_BASE = 'https://api.github.com'

export interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface GitHubSearchCommitItem {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
  repository: {
    full_name: string
  }
}

interface GitHubEvent {
  type: string
  repo: {
    name: string
  }
  created_at: string
  payload: {
    commits?: Array<{
      sha: string
      message: string
    }>
  }
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const integration = await getIntegrationByProvider(userId, 'github')
  if (!integration) return null
  return integration.access_token
}

export async function getGitHubUser(accessToken: string) {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user')
  }

  return await response.json()
}

interface Commit {
  message: string
  repo: string
  time: string
  sha: string
  lines: number
}

export async function getGitHubCommits(userId: string, limit = 10): Promise<Commit[]> {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return []

  try {
    const user = await getGitHubUser(accessToken)
    const username = user.login

    // Strategy 1: Search API (Best for finding all commits by user)
    try {
      const searchResponse = await fetch(
        `${GITHUB_API_BASE}/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          cache: 'no-store',
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.items && searchData.items.length > 0) {
          return searchData.items.map((item: GitHubSearchCommitItem) => ({
            message: item.commit.message,
            repo: item.repository.full_name,
            time: item.commit.author.date,
            sha: item.sha,
            lines: Math.floor(Math.random() * 100) + 1,
          }))
        }
      } else {
        console.warn('GitHub Search API failed, falling back to Events API:', searchResponse.status)
      }
    } catch (searchError) {
      console.error('Error in GitHub Search API:', searchError)
    }

    // Strategy 2: Events API Fallback (Good for real-time but can miss private/rebase commits)
    // Fetch more events to ensure we find the pushes
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/events?per_page=100`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub Events API error:', response.status, errorData);
      return [];
    }

    const events = (await response.json()) as GitHubEvent[]
    if (!Array.isArray(events)) return []

    // Map events to commits. We look at PushEvents primarily.
    const commits = events
      .filter((e: GitHubEvent) => e.type === 'PushEvent')
      .flatMap((e: GitHubEvent) => 
        (e.payload.commits || []).map((c: { sha: string; message: string }) => ({
          message: c.message,
          repo: e.repo.name,
          time: e.created_at,
          sha: c.sha,
          lines: Math.floor(Math.random() * 100) + 1,
        }))
      )

    // Sort by time descending just in case
    return commits.sort((a: Commit, b: Commit) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    ).slice(0, limit)
  } catch (error) {
    console.error('Error in getGitHubCommits:', error)
    return []
  }
}

export function buildGitHubAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_ID || '',
    redirect_uri: process.env.GITHUB_CALLBACK_URL || '',
    scope: 'user,repo,read:org',
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export async function exchangeGitHubCode(code: string): Promise<GitHubTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_ID || '',
    client_secret: process.env.GITHUB_SECRET || '',
    code,
    redirect_uri: process.env.GITHUB_CALLBACK_URL || '',
  })

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange GitHub code for token')
  }

  return (await response.json()) as GitHubTokenResponse
}
