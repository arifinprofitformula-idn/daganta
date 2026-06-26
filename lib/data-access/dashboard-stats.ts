import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { start, end };
}

/**
 * Returns dashboard stats for one tenant only.
 * Every database query in this function must include the provided tenantId.
 */
export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped dashboard stats queries');
  }

  const { start, end } = getCurrentMonthRange();

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    monthlyRevenueAggregate,
  ] = await Promise.all([
    prisma.product.count({
      where: {
        tenantId,
      },
    }),
    prisma.order.count({
      where: {
        tenantId,
      },
    }),
    prisma.customer.count({
      where: {
        tenantId,
      },
    }),
    prisma.orderPayment.aggregate({
      where: {
        tenantId,
        status: PaymentStatus.VERIFIED,
        verifiedAt: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    monthlyRevenue: Number(monthlyRevenueAggregate._sum.amount ?? 0),
  };
}
