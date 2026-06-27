import { NextResponse } from 'next/server';
import { processNotificationQueue } from '@/lib/notifications/queue';

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

  const result = await processNotificationQueue();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ...result,
  });
}
