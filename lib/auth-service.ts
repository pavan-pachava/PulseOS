import bcrypt from 'bcryptjs'
import { db } from './db'

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: Date
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 12)

  const result = await db`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${hashedPassword}, ${name || null})
    RETURNING id, email, name, avatar_url, created_at
  `

  return result[0] as User
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string | null }) | null> {
  const result = await db`
    SELECT id, email, name, avatar_url, password_hash, created_at
    FROM users
    WHERE email = ${email}
  `

  return result[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await db`
    SELECT id, email, name, avatar_url, created_at
    FROM users
    WHERE id = ${id}
  `

  return result[0] || null
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function updateUserProfile(userId: string, name: string, avatar_url?: string): Promise<User> {
  const result = await db`
    UPDATE users
    SET name = ${name}, avatar_url = ${avatar_url || null}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING id, email, name, avatar_url, created_at
  `

  return result[0] as User
}

export async function saveIntegration(
  userId: string,
  provider: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date | null
): Promise<void> {
  await db`
    INSERT INTO integrations (user_id, provider, access_token, refresh_token, expires_at)
    VALUES (${userId}, ${provider}, ${accessToken}, ${refreshToken}, ${expiresAt})
    ON CONFLICT (user_id, provider)
    DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `
}

export async function getIntegrationByProvider(userId: string, provider: string) {
  const result = await db`
    SELECT id, access_token, refresh_token, expires_at
    FROM integrations
    WHERE user_id = ${userId} AND provider = ${provider}
  `

  return result[0] || null
}

export async function saveSpotifyIntegration(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> {
  return saveIntegration(userId, 'spotify', accessToken, refreshToken, expiresAt)
}

export async function getSpotifyIntegration(userId: string) {
  return getIntegrationByProvider(userId, 'spotify')
}

export async function getUserIntegrations(userId: string) {
  const result = await db`
    SELECT id, provider, connected_at, updated_at, expires_at
    FROM integrations
    WHERE user_id = ${userId}
  `

  return result || []
}
