import { PrismaClient } from '@/app/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString || connectionString.includes('USER:PASSWORD')) {
    // Return a client that will gracefully fail on queries (no real DB configured)
    try {
      const adapter = new PrismaPg({ connectionString: connectionString ?? 'postgresql://localhost:5432/fallback' })
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    } catch {
      const adapter = new PrismaPg({ connectionString: 'postgresql://localhost:5432/fallback' })
      return new PrismaClient({ adapter })
    }
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
