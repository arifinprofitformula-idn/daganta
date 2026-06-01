import { resolveEffectiveSubscription, getSubscriptionAccessPolicy } from '../lib/billing/lifecycle';
import { SubscriptionStatus } from '@prisma/client';

function runTest() {
  const now = new Date('2026-06-02T12:00:00Z');
  console.log(`=== RUNTIME SMOKE TEST ===`);
  console.log(`Current Simulated Date: ${now.toISOString()}\n`);

  const testCases = [
    {
      name: '1. Active Trial (expires in 10 days)',
      sub: {
        status: 'TRIAL' as SubscriptionStatus,
        trialEndsAt: new Date('2026-06-12T12:00:00Z'),
        currentPeriodEnd: null,
        gracePeriodEndsAt: null,
      }
    },
    {
      name: '2. Expiring Trial (expires in 1 day)',
      sub: {
        status: 'TRIAL' as SubscriptionStatus,
        trialEndsAt: new Date('2026-06-03T12:00:00Z'),
        currentPeriodEnd: null,
        gracePeriodEndsAt: null,
      }
    },
    {
      name: '3. Trial Expired but in Grace Period',
      sub: {
        status: 'TRIAL' as SubscriptionStatus,
        trialEndsAt: new Date('2026-06-01T12:00:00Z'),
        currentPeriodEnd: null,
        gracePeriodEndsAt: new Date('2026-06-08T12:00:00Z'),
      }
    },
    {
      name: '4. Trial Expired and Grace Period Passed',
      sub: {
        status: 'TRIAL' as SubscriptionStatus,
        trialEndsAt: new Date('2026-06-01T12:00:00Z'),
        currentPeriodEnd: null,
        gracePeriodEndsAt: new Date('2026-06-01T15:00:00Z'),
      }
    },
    {
      name: '5. Active Paid Subscription (expires in 20 days)',
      sub: {
        status: 'ACTIVE' as SubscriptionStatus,
        trialEndsAt: null,
        currentPeriodEnd: new Date('2026-06-22T12:00:00Z'),
        gracePeriodEndsAt: null,
      }
    },
    {
      name: '6. Expiring Paid Subscription (expires in 2 days)',
      sub: {
        status: 'ACTIVE' as SubscriptionStatus,
        trialEndsAt: null,
        currentPeriodEnd: new Date('2026-06-04T12:00:00Z'),
        gracePeriodEndsAt: null,
      }
    },
    {
      name: '7. Paid Subscription Expired but in Grace Period',
      sub: {
        status: 'ACTIVE' as SubscriptionStatus,
        trialEndsAt: null,
        currentPeriodEnd: new Date('2026-06-01T12:00:00Z'),
        gracePeriodEndsAt: new Date('2026-06-08T12:00:00Z'),
      }
    },
    {
      name: '8. Paid Subscription Expired and Grace Period Passed',
      sub: {
        status: 'ACTIVE' as SubscriptionStatus,
        trialEndsAt: null,
        currentPeriodEnd: new Date('2026-06-01T12:00:00Z'),
        gracePeriodEndsAt: new Date('2026-06-01T15:00:00Z'),
      }
    },
    {
      name: '9. Explicitly Suspended in Database',
      sub: {
        status: 'SUSPENDED' as SubscriptionStatus,
        trialEndsAt: null,
        currentPeriodEnd: new Date('2026-06-22T12:00:00Z'),
        gracePeriodEndsAt: null,
      }
    },
    {
      name: '10. Explicitly Canceled in Database',
      sub: {
        status: 'CANCELED' as SubscriptionStatus,
        trialEndsAt: null,
        currentPeriodEnd: new Date('2026-06-22T12:00:00Z'),
        gracePeriodEndsAt: null,
      }
    }
  ];

  for (const tc of testCases) {
    const effective = resolveEffectiveSubscription(tc.sub, now);
    const policy = getSubscriptionAccessPolicy(effective);
    console.log(`[Test Case]: ${tc.name}`);
    console.log(`  - DB Status: ${tc.sub.status}`);
    console.log(`  - Resolved Effective Status: ${effective}`);
    console.log(`  - View Storefront Allowed: ${policy.canViewStorefront ? 'YES' : 'NO'}`);
    console.log(`  - Checkout Allowed: ${policy.canCheckout ? 'YES' : 'NO'}`);
    console.log(`  - Product Creation Allowed: ${policy.canCreateProduct ? 'YES' : 'NO'}`);
    console.log(`  - Warning Message: ${policy.shouldShowWarning ? `"${policy.warningTitle}"` : 'NONE'}\n`);
  }
}

runTest();
