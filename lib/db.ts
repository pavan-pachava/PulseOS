import postgres from 'postgres'

let client: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
    })
  }
  return client
}

export const db = getDb()
