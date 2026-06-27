import { NextResponse } from 'next/server';
import { TenantStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkAndUpdateTenantStatus } from '@/lib/tenant/lifecycle';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return request.headers.get('x-cron-secret') === cronSecret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const lifecycleWindow = new Date(now);
  lifecycleWindow.setDate(lifecycleWindow.getDate() + 30);

  const tenants = await prisma.tenant.findMany({
    where: {
      subscriptionEndsAt: {
        lt: lifecycleWindow,
      },
      status: {
        notIn: [TenantStatus.ARCHIVED],
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      subscriptionEndsAt: true,
    },
  });

  const results = await Promise.all(
    tenants.map(async (tenant) => {
      try {
        const result = await checkAndUpdateTenantStatus(tenant.id, now);

        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          previousStatus: result.previousStatus,
          nextStatus: result.nextStatus,
          changed: result.changed,
          error: null,
        };
      } catch (error: unknown) {
        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          previousStatus: tenant.status,
          nextStatus: tenant.status,
          changed: false,
          error: error instanceof Error ? error.message : 'Tenant lifecycle update failed.',
        };
      }
    })
  );

  console.info('Tenant lifecycle cron completed', {
    checked: results.length,
    changed: results.filter((result) => result.changed).length,
  });

  return NextResponse.json({
    status: 'ok',
    timestamp: now.toISOString(),
    checked: results.length,
    changed: results.filter((result) => result.changed).length,
    results,
  });
}
