import { NotificationChannel, NotificationEventType, Prisma } from '@prisma/client';

export type NotificationPayloadData = Prisma.InputJsonValue;

export interface NotificationPayload {
  tenantId: string;
  orderId?: string | null;
  customerId?: string | null;
  channel: NotificationChannel;
  type: NotificationEventType;
  recipient: string | null;
  subject?: string | null;
  message: string;
  payload?: NotificationPayloadData;
}

export interface AdapterSendResult {
  success: boolean;
  sentAt?: Date | null;
  failedAt?: Date | null;
  lastError?: string | null;
}

export interface NotificationAdapter {
  send(recipient: string, message: string, subject?: string | null): Promise<AdapterSendResult>;
}
