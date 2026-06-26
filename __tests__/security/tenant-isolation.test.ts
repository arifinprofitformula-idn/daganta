import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { prisma } from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit/log-action';
import { TenantAccessError, validateTenantAccess } from '@/lib/auth/validate-tenant-access';

const originalTenantMemberFindFirst = prisma.tenantMember.findFirst;
const originalAuditLogCreate = prisma.auditLog.create;
const originalConsoleError = console.error;

afterEach(() => {
  prisma.tenantMember.findFirst = originalTenantMemberFindFirst;
  prisma.auditLog.create = originalAuditLogCreate;
  console.error = originalConsoleError;
});

describe('product tenant isolation security', () => {
  it('throws TenantAccessError when a user is not a member of another tenant', async () => {
    prisma.tenantMember.findFirst = (() => Promise.resolve(null)) as typeof prisma.tenantMember.findFirst;

    await assert.rejects(
      () => validateTenantAccess('user-tenant-a', 'tenant-b'),
      TenantAccessError
    );
  });

  it('blocks server actions when no authenticated tenant context is available', async () => {
    const actionsSource = await readFile(
      join(process.cwd(), 'app/dashboard/products/actions.ts'),
      'utf8'
    );

    assert.match(actionsSource, /getActiveTenantContext\(\)/);
    assert.match(actionsSource, /Sesi tidak valid/);
    assert.match(actionsSource, /ensureTenantWriteAccess\(actorId, tenantId\)/);
  });

  it('keeps product writes tenant-scoped in Prisma where clauses', async () => {
    const productsDataAccess = await readFile(
      join(process.cwd(), 'lib/data-access/products.ts'),
      'utf8'
    );
    const productActions = await readFile(
      join(process.cwd(), 'app/dashboard/products/actions.ts'),
      'utf8'
    );

    assert.match(productsDataAccess, /where:\s*\{\s*id:\s*productId,\s*tenantId/s);
    assert.match(productsDataAccess, /where:\s*\{\s*productId,\s*tenantId/s);
    assert.match(productActions, /where:\s*\{\s*id:\s*productId,\s*tenantId/s);
    assert.doesNotMatch(productActions, /tx\.product\.update\(\{\s*where:\s*\{\s*id:\s*productId\s*\}/s);
  });

  it('does not block the main mutation flow when audit logging fails', async () => {
    prisma.auditLog.create = (() => {
      throw new Error('audit unavailable');
    }) as typeof prisma.auditLog.create;
    console.error = (() => undefined) as typeof console.error;

    await assert.doesNotReject(() =>
      logAuditAction({
        tenantId: 'tenant-a',
        userId: 'user-a',
        action: 'UPDATE_PRODUCT',
        entityType: 'Product',
        entityId: 'product-a',
        metadata: {
          source: 'security-test',
        },
      })
    );
  });
});
