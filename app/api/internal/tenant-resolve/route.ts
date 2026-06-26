import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromHost } from '@/lib/tenant/resolve-tenant';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get('host') ?? request.headers.get('host') ?? '';
  const result = await resolveTenantFromHost(host);

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'private, max-age=60',
    },
  });
}
