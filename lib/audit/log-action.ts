import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

function toJsonValue(metadata: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue;
}

export async function logAuditAction(data: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        actorId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata ? toJsonValue(data.metadata) : undefined,
      },
    });
  } catch (error: unknown) {
    console.error(
      'Failed to write audit log:',
      error instanceof Error ? error.message : 'Unknown audit log error'
    );
  }
}
