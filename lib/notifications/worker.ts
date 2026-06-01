import { prisma } from '../prisma';
import { NotificationChannel, NotificationEventStatus } from '@prisma/client';
import { whatsappAdapter } from './adapters/whatsapp';
import { emailAdapter } from './adapters/email';
import { internalAdapter } from './adapters/internal';
import { AdapterSendResult } from './types';

export async function processPendingNotifications() {
  // Fetch up to 10 PENDING events due for processing
  const pendingEvents = await prisma.notificationEvent.findMany({
    where: {
      status: NotificationEventStatus.PENDING,
      attemptCount: { lt: 3 },
    },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  const results = [];

  for (const event of pendingEvents) {
    const isDryRun = event.payload && typeof event.payload === 'object' && (event.payload as any).dryRun === true;

    // Console logging safety check: Log only safe metadata
    console.log(
      `[WORKER] Processing eventId: ${event.id}, tenantId: ${event.tenantId}, channel: ${event.channel}, type: ${event.type}, status: ${event.status}, attemptCount: ${event.attemptCount}`
    );

    try {
      let sendResult: AdapterSendResult = { success: false, lastError: 'Channel tidak didukung' };

      if (event.channel === NotificationChannel.INTERNAL) {
        sendResult = await internalAdapter.send(event.recipient || 'system', event.message);
      } else if (event.channel === NotificationChannel.WHATSAPP) {
        sendResult = await whatsappAdapter.send(event.recipient || '', event.message);
      } else if (event.channel === NotificationChannel.EMAIL) {
        sendResult = await emailAdapter.send(event.recipient || '', event.message, event.subject);
      }

      if (sendResult.success) {
        // Safe outbox status update rules:
        if (event.channel === NotificationChannel.INTERNAL || isDryRun) {
          // Safe to mark as SENT since no real external dispatch is implied
          await prisma.notificationEvent.update({
            where: { id: event.id },
            data: {
              status: NotificationEventStatus.SENT,
              attemptCount: event.attemptCount + 1,
              sentAt: new Date(),
              lastError: isDryRun ? 'DRY-RUN COMPLETE' : null,
            },
          });
          console.log(`[WORKER] Event ${event.id} marked as SENT (channel: ${event.channel}, dryRun: ${!!isDryRun})`);
        } else {
          // WHATSAPP and EMAIL remain PENDING to avoid false operational confidence
          await prisma.notificationEvent.update({
            where: { id: event.id },
            data: {
              attemptCount: event.attemptCount + 1,
              lastError: 'Dry-run mode: Real delivery pending. Kept in PENDING state.',
            },
          });
          console.log(`[WORKER] Event ${event.id} kept in PENDING state (external channel: ${event.channel})`);
        }

        results.push({ id: event.id, success: true });
      } else {
        await prisma.notificationEvent.update({
          where: { id: event.id },
          data: {
            attemptCount: event.attemptCount + 1,
            lastError: sendResult.lastError || 'Unknown dispatch error',
          },
        });
        results.push({ id: event.id, success: false });
      }
    } catch (error: any) {
      console.error(`[WORKER] Failed to process event ${event.id}:`, error.message);
      
      const newAttemptCount = event.attemptCount + 1;
      const isFailed = newAttemptCount >= 3;

      await prisma.notificationEvent.update({
        where: { id: event.id },
        data: {
          status: isFailed ? NotificationEventStatus.FAILED : NotificationEventStatus.PENDING,
          attemptCount: newAttemptCount,
          failedAt: isFailed ? new Date() : null,
          lastError: error.message || 'Worker exception occurred',
        },
      });
      results.push({ id: event.id, success: false, error: error.message });
    }
  }

  return results;
}
