import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type DashboardOrderListItem = Prisma.OrderGetPayload<{
  include: {
    customer: {
      select: {
        name: true;
        phone: true;
      };
    };
  };
}>;

export type DashboardOrderDetail = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: {
          select: {
            imageUrl: true;
          };
        };
      };
    };
    payment: true;
  };
}>;

export type CustomerOrderDetail = DashboardOrderDetail;

export type OrderAuditTimelineItem = Prisma.AuditLogGetPayload<object>;

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildOrderWhere(tenantId: string, filters: OrderFilters): Prisma.OrderWhereInput {
  const search = filters.search?.trim();
  const dateFrom = parseDate(filters.dateFrom);
  const dateTo = parseDate(filters.dateTo);

  if (dateTo) {
    dateTo.setHours(23, 59, 59, 999);
  }

  return {
    tenantId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              orderNumber: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              customer: {
                name: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
            {
              customer: {
                phone: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {}),
  };
}

function normalizePhone(phone: string) {
  let digits = phone.replace(/[^0-9]/g, '');

  if (digits.startsWith('08')) {
    digits = `628${digits.slice(2)}`;
  } else if (digits.startsWith('8')) {
    digits = `628${digits.slice(1)}`;
  } else if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`;
  }

  return digits;
}

function isPhoneMatch(inputPhone: string, storedPhone: string) {
  const normalizedInput = normalizePhone(inputPhone);
  const normalizedStored = normalizePhone(storedPhone);

  if (normalizedInput.length < 10 || normalizedStored.length < 10) {
    return false;
  }

  return normalizedInput === normalizedStored || normalizedInput.slice(-10) === normalizedStored.slice(-10);
}

/**
 * Returns dashboard orders for one tenant only.
 * Every order query in this function must include the provided tenantId.
 */
export async function getOrdersByTenant(
  tenantId: string,
  filters: OrderFilters = {}
): Promise<DashboardOrderListItem[]> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped order queries');
  }

  return prisma.order.findMany({
    where: buildOrderWhere(tenantId, filters),
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Returns one order detail for one tenant only.
 * The lookup must include both tenantId and orderId.
 */
export async function getOrderById(
  tenantId: string,
  orderId: string
): Promise<DashboardOrderDetail | null> {
  if (!tenantId || !orderId) {
    throw new Error('tenantId and orderId are required for tenant-scoped order queries');
  }

  return prisma.order.findFirst({
    where: {
      id: orderId,
      tenantId,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              imageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      payment: true,
    },
  });
}

/**
 * Returns one public storefront order for one tenant only after customer phone verification.
 * The lookup must include tenantId and must not expose data unless the phone matches Order.customer.phone.
 */
export async function getOrderForCustomer(
  tenantId: string,
  orderId: string,
  phone: string
): Promise<CustomerOrderDetail | null> {
  if (!tenantId || !orderId || !phone) {
    throw new Error('tenantId, orderId, and phone are required for public order tracking');
  }

  const order = await prisma.order.findFirst({
    where: {
      tenantId,
      OR: [
        {
          id: orderId,
        },
        {
          orderNumber: orderId,
        },
      ],
    },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              imageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      payment: true,
    },
  });

  if (!order?.customer || !isPhoneMatch(phone, order.customer.phone)) {
    return null;
  }

  return order;
}

/**
 * Returns audit timeline for one tenant order only.
 * The query must include tenantId and the order entity id.
 */
export async function getOrderTimeline(tenantId: string, orderId: string): Promise<OrderAuditTimelineItem[]> {
  if (!tenantId || !orderId) {
    throw new Error('tenantId and orderId are required for tenant-scoped order timeline queries');
  }

  return prisma.auditLog.findMany({
    where: {
      tenantId,
      entityId: orderId,
      entityType: {
        in: ['Order', 'ORDER'],
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

/**
 * Updates one order status for one tenant only.
 * The update mutation must include both tenantId and orderId.
 */
export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
) {
  if (!tenantId || !orderId) {
    throw new Error('tenantId and orderId are required for tenant-scoped order mutations');
  }

  return prisma.order.updateMany({
    where: {
      id: orderId,
      tenantId,
    },
    data: {
      status,
      ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || null } : {}),
    },
  });
}
