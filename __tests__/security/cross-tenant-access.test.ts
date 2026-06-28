import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function readProjectFile(path: string) {
  return readFile(join(process.cwd(), path), 'utf8');
}

describe('cross tenant access guards', () => {
  it('keeps product data-access functions tenant scoped', async () => {
    const source = await readProjectFile('lib/data-access/products.ts');

    assert.match(source, /getProductsByTenant/);
    assert.match(source, /tenantId/);
    assert.match(source, /deleteProduct\([\s\S]*tenantId[\s\S]*productId/);
    assert.match(source, /toggleProductStatus\([\s\S]*tenantId[\s\S]*productId/);
    assert.doesNotMatch(source, /prisma\.product\.findMany\(\{\s*where:\s*\{\s*\}/);
  });

  it('requires tenant access validation before product write actions', async () => {
    const source = await readProjectFile('app/dashboard/products/actions.ts');

    assert.match(source, /validateTenantAccess/);
    assert.match(source, /ensureTenantWriteAccess\(actorId, tenantId\)/);
    assert.match(source, /CREATE_PRODUCT/);
    assert.match(source, /UPDATE_PRODUCT/);
    assert.match(source, /DELETE_PRODUCT/);
  });
});
