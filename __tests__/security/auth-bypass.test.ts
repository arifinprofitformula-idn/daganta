import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function readProjectFile(path: string) {
  return readFile(join(process.cwd(), path), 'utf8');
}

describe('auth bypass protections', () => {
  it('redirects unauthenticated dashboard and agent routes from middleware', async () => {
    const source = await readProjectFile('middleware.ts');

    assert.match(source, /isDashboardRoute && !user/);
    assert.match(source, /isAgentRoute/);
    assert.match(source, /resolveAgentAccessForMiddleware/);
    assert.match(source, /new URL\('\/login'/);
  });

  it('keeps sensitive cron endpoints protected by CRON_SECRET', async () => {
    const tenantLifecycle = await readProjectFile('app/api/cron/tenant-lifecycle/route.ts');
    const notifications = await readProjectFile('app/api/cron/process-notifications/route.ts');

    assert.match(tenantLifecycle, /CRON_SECRET/);
    assert.match(notifications, /CRON_SECRET/);
  });

  it('rate limits public write-like endpoints', async () => {
    const paymentCreate = await readProjectFile('app/api/payments/create/route.ts');
    const webhook = await readProjectFile('app/api/webhooks/[provider]/route.ts');
    const checkout = await readProjectFile('app/checkout/actions.ts');
    const login = await readProjectFile('app/login/actions.ts');

    assert.match(paymentCreate, /rateLimitByIP/);
    assert.match(webhook, /rateLimitByIP/);
    assert.match(checkout, /rateLimitByIP/);
    assert.match(login, /rateLimitByIP/);
  });
});
