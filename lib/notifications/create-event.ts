import { NotificationChannel, NotificationEventStatus, NotificationEventType } from '@prisma/client';
import { templates } from './templates';

interface CreateEventParams {
  tenantId: string;
  orderId?: string | null;
  customerId?: string | null;
  channel: NotificationChannel;
  type: NotificationEventType;
  recipient: string | null;
  params: any; // parameters passed to template function
  payload?: any;
}

export async function createNotificationEvent(
  tx: any, // Supports either Prisma transaction client or standard prisma client
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
      payload: data.payload || null,
    },
  });
}
