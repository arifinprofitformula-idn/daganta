import { PrismaClient } from '@prisma/client';

function getRuntimeDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  try {
    const url = new URL(databaseUrl);
    const isPoolerUrl =
      url.port === '6432' ||
      url.hostname.includes('pooler') ||
      url.hostname.includes('pgbouncer');

    if (!isPoolerUrl) {
      return databaseUrl;
    }

    if (!url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }

    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '1');
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}

const prismaClientSingleton = () => {
  const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

  return new PrismaClient(
    runtimeDatabaseUrl
      ? {
          datasources: {
            db: {
              url: runtimeDatabaseUrl,
            },
          },
        }
      : undefined
  );
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
