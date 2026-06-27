import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardStats } from '@/lib/data-access/dashboard-stats';
import {
  getCategoriesByTenantId,
  getCategoryById,
  getDashboardProductsByTenantId,
  getFeaturedProductsByTenantId,
  getProductById,
  getProductBySlug,
  getProductsByTenantId,
} from '@/lib/data-access/products';
import { getDashboardSummaryByTenantId } from '@/lib/data-access/dashboard';
import {
  getOrderById,
  getOrdersByTenant,
  getOrderTimeline,
  updateOrderStatus,
} from '@/lib/data-access/orders';
import { OrderStatus } from '@prisma/client';

describe('tenant-scoped data access guards', () => {
  it('throws when dashboard stats are requested without tenantId', async () => {
    await assert.rejects(() => getDashboardStats(''), /tenantId is required/i);
  });

  it('throws when product list is requested without tenantId', async () => {
    await assert.rejects(() => getProductsByTenantId(''), /tenantId is required/i);
    await assert.rejects(() => getFeaturedProductsByTenantId(''), /tenantId is required/i);
    await assert.rejects(() => getDashboardProductsByTenantId(''), /tenantId is required/i);
  });

  it('throws when product/category detail lookups are requested without tenantId', async () => {
    await assert.rejects(() => getProductBySlug('', 'sample'), /tenantId/i);
    await assert.rejects(() => getProductById('', 'sample'), /tenantId/i);
    await assert.rejects(() => getCategoryById('', 'sample'), /tenantId/i);
  });

  it('throws when categories or dashboard summary are requested without tenantId', async () => {
    await assert.rejects(() => getCategoriesByTenantId(''), /tenantId is required/i);
    await assert.rejects(() => getDashboardSummaryByTenantId(''), /tenant id is required/i);
  });

  it('throws when order data access is requested without tenantId', async () => {
    await assert.rejects(() => getOrdersByTenant(''), /tenantId is required/i);
    await assert.rejects(() => getOrderById('', 'order-a'), /tenantId/i);
    await assert.rejects(() => getOrderTimeline('', 'order-a'), /tenantId/i);
    await assert.rejects(() => updateOrderStatus('', 'order-a', OrderStatus.PROCESSING), /tenantId/i);
  });
});
