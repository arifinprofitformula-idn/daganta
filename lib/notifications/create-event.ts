import { NotificationChannel, NotificationEventStatus, NotificationEventType, Prisma } from '@prisma/client';
import { templates, NotificationTemplateParams } from './templates';
import type { NotificationPayloadData } from './types';

interface CreateEventParams {
  tenantId: string;
  orderId?: string | null;
  customerId?: string | null;
  channel: NotificationChannel;
  type: NotificationEventType;
  recipient: string | null;
  params: NotificationTemplateParams;
  payload?: NotificationPayloadData;
}

export async function createNotificationEvent(
  tx: Prisma.TransactionClient,
  data: CreateEventParams
) {
  const templateFn = templates[data.type];
  if (!templateFn) {
    throw new Error(`Notification template for event type ${data.type} is not defined.`);
  }

  const { subject, message } = templateFn(data.params);

  return await tx.notificationEvent.create({
    data: {
      tenantId: data.tenantId,
      orderId: data.orderId || null,
      customerId: data.customerId || null,
      channel: data.channel,
      type: data.type,
      status: NotificationEventStatus.PENDING,
      recipient: data.recipient || null,
      subject: subject || null,
      message,
      payload: data.payload ?? Prisma.JsonNull,
    },
  });
}
