import postgres from 'postgres'

let client: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    const isSslRequired = connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')

    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      ssl: isSslRequired ? 'require' : undefined,
    })
  }
  return client
}

export const db = getDb()
