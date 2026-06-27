import {
  NotificationChannel,
  NotificationEventStatus,
  NotificationEventType,
  Prisma,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { templates, type NotificationTemplateParams } from './templates';
import { sendNotification } from './send';

const MAX_BATCH_SIZE = 10;
const BASE_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

export interface EnqueueNotificationInput {
  tenantId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  payload?: NotificationTemplateParams;
  recipientId?: string | null;
  recipient?: string | null;
  orderId?: string | null;
  customerId?: string | null;
  subject?: string | null;
  message?: string | null;
  maxAttempts?: number;
  nextAttemptAt?: Date | null;
}

export interface NotificationQueueResult {
  processed: number;
  sent: number;
  retried: number;
  deadLetter: number;
  failed: number;
  results: Array<{
    id: string;
    status: NotificationEventStatus;
    error?: string;
  }>;
}

function getBackoffDate(attemptCount: number, now = new Date()) {
  const backoffMs = Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attemptCount - 1), MAX_BACKOFF_MS);
  return new Date(now.getTime() + backoffMs);
}

function toJsonValue(payload: NotificationTemplateParams | undefined) {
  return payload ? (payload as Prisma.InputJsonValue) : Prisma.JsonNull;
}

export async function enqueueNotification(data: EnqueueNotificationInput) {
  const template = templates[data.eventType];
  const rendered = template(data.payload ?? {});

  return prisma.notificationEvent.create({
    data: {
      tenantId: data.tenantId,
      orderId: data.orderId ?? null,
      customerId: data.customerId ?? null,
      channel: data.channel,
      type: data.eventType,
      status: NotificationEventStatus.PENDING,
      recipient: data.recipient ?? data.recipientId ?? null,
      subject: data.subject ?? rendered.subject,
      message: data.message ?? rendered.message,
      payload: toJsonValue(data.payload),
      maxAttempts: data.maxAttempts ?? 3,
      nextAttemptAt: data.nextAttemptAt ?? null,
    },
  });
}

export async function processNotificationQueue(now: Date = new Date()): Promise<NotificationQueueResult> {
  const events = await prisma.notificationEvent.findMany({
    where: {
      status: NotificationEventStatus.PENDING,
      OR: [
        {
          nextAttemptAt: null,
        },
        {
          nextAttemptAt: {
            lte: now,
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: MAX_BATCH_SIZE,
  });

  const result: NotificationQueueResult = {
    processed: 0,
    sent: 0,
    retried: 0,
    deadLetter: 0,
    failed: 0,
    results: [],
  };

  for (const event of events) {
    const lock = await prisma.notificationEvent.updateMany({
      where: {
        id: event.id,
        status: NotificationEventStatus.PENDING,
      },
      data: {
        status: NotificationEventStatus.PROCESSING,
      },
    });

    if (lock.count === 0) {
      continue;
    }

    result.processed += 1;

    try {
      const sendResult = await sendNotification(event);

      if (sendResult.success) {
        await prisma.notificationEvent.update({
          where: {
            id: event.id,
          },
          data: {
            status: NotificationEventStatus.SENT,
            attemptCount: event.attemptCount + 1,
            sentAt: sendResult.sentAt ?? new Date(),
            failedAt: null,
            lastError: sendResult.lastError ?? null,
          },
        });

        result.sent += 1;
        result.results.push({ id: event.id, status: NotificationEventStatus.SENT });
        continue;
      }

      const nextAttemptCount = event.attemptCount + 1;
      const isDeadLetter = nextAttemptCount >= event.maxAttempts;
      const nextStatus = isDeadLetter
        ? NotificationEventStatus.DEAD_LETTER
        : NotificationEventStatus.PENDING;

      await prisma.notificationEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: nextStatus,
          attemptCount: nextAttemptCount,
          nextAttemptAt: isDeadLetter ? null : getBackoffDate(nextAttemptCount, now),
          failedAt: isDeadLetter ? new Date() : null,
          lastError: sendResult.lastError ?? 'Notification send failed.',
        },
      });

      if (isDeadLetter) {
        result.deadLetter += 1;
      } else {
        result.retried += 1;
      }

      result.results.push({
        id: event.id,
        status: nextStatus,
        error: sendResult.lastError ?? 'Notification send failed.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Notification worker error.';
      const nextAttemptCount = event.attemptCount + 1;
      const isDeadLetter = nextAttemptCount >= event.maxAttempts;
      const nextStatus = isDeadLetter
        ? NotificationEventStatus.DEAD_LETTER
        : NotificationEventStatus.PENDING;

      await prisma.notificationEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: nextStatus,
          attemptCount: nextAttemptCount,
          nextAttemptAt: isDeadLetter ? null : getBackoffDate(nextAttemptCount, now),
          failedAt: isDeadLetter ? new Date() : null,
          lastError: errorMessage,
        },
      });

      if (isDeadLetter) {
        result.deadLetter += 1;
      } else {
        result.failed += 1;
        result.retried += 1;
      }

      result.results.push({
        id: event.id,
        status: nextStatus,
        error: errorMessage,
      });
    }
  }

  return result;
}
