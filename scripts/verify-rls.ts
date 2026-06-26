import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(fileName: string) {
  const envPath = path.resolve(process.cwd(), fileName);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

async function queryProductCount(prisma: PrismaClient, tenantId?: string) {
  const rows = tenantId
    ? await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "Product"
        WHERE "tenantId" = ${tenantId}
      `
    : await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "Product"
      `;

  return Number(rows[0]?.count ?? 0n);
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const databaseUrl = process.env.RLS_VERIFY_DATABASE_URL ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('RLS verification failed: RLS_VERIFY_DATABASE_URL, DIRECT_URL, or DATABASE_URL is required.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  let failed = false;

  try {
    const rlsRows = await prisma.$queryRaw<
      Array<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>
    >`
      SELECT relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE oid = '"Product"'::regclass
    `;

    const productRls = rlsRows[0];
    console.log(`Product RLS enabled: ${productRls?.relrowsecurity === true ? 'yes' : 'no'}`);

    if (!productRls?.relrowsecurity) {
      console.error('FAIL: Product RLS is not enabled.');
      failed = true;
    }

    try {
      const count = await queryProductCount(prisma);
      console.log(`Product query without tenant context returned ${count} rows.`);

      if (count > 0) {
        console.error('FAIL: Product query without tenant context returned data.');
        console.error(
          'Hint: run this script with a non-owner app role. Table owners and service roles can bypass RLS.'
        );
        failed = true;
      }
    } catch (error) {
      console.log(`PASS: Product query without tenant context was blocked: ${getErrorMessage(error)}`);
    }

    const authUserId = process.env.RLS_VERIFY_AUTH_USER_ID;

    if (!authUserId) {
      console.log('Skipped cross-tenant check: set RLS_VERIFY_AUTH_USER_ID to test with an auth user.');
    } else {
      const currentMembership = await prisma.tenantMember.findFirst({
        where: {
          user: {
            authUserId,
          },
        },
        select: {
          tenantId: true,
        },
      });

      const otherTenant = await prisma.tenant.findFirst({
        where: {
          id: {
            not: currentMembership?.tenantId ?? '',
          },
        },
        select: {
          id: true,
        },
      });

      if (!currentMembership || !otherTenant) {
        console.log('Skipped cross-tenant check: at least two tenants and one matching auth user are required.');
      } else {
        await prisma.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${authUserId}, false)`;
        const otherTenantCount = await queryProductCount(prisma, otherTenant.id);
        console.log(`Product query for another tenant returned ${otherTenantCount} rows.`);

        if (otherTenantCount > 0) {
          console.error('FAIL: Cross-tenant Product query returned data.');
          failed = true;
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  if (failed) {
    process.exit(1);
  }

  console.log('RLS verification completed successfully.');
}

main().catch((error: unknown) => {
  console.error(`RLS verification failed: ${getErrorMessage(error)}`);
  process.exit(1);
});
