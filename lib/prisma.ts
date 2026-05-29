import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Neon's WebSocket driver needs a WebSocket implementation in Node.
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  // Use the WebSocket pool adapter rather than the HTTP adapter: the HTTP
  // driver mis-parses `timestamp` columns ("expected a string ... found {}"),
  // which crashes any query that reads createdAt/updatedAt.
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
