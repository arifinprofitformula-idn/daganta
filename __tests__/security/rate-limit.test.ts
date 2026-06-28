import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimitByIP, rateLimitByUser } from '@/lib/rate-limit';

describe('rate limiter', () => {
  it('blocks an IP after the configured threshold', async () => {
    const ip = `test-ip-${Date.now()}-${Math.random()}`;

    const first = await rateLimitByIP(ip, 2, 60);
    const second = await rateLimitByIP(ip, 2, 60);
    const third = await rateLimitByIP(ip, 2, 60);

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    assert.equal(third.success, false);
  });

  it('tracks user buckets separately from IP buckets', async () => {
    const identifier = `test-user-${Date.now()}-${Math.random()}`;

    const first = await rateLimitByUser(identifier, 1, 60);
    const second = await rateLimitByUser(identifier, 1, 60);

    assert.equal(first.success, true);
    assert.equal(second.success, false);
  });
});
