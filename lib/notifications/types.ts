import { NotificationChannel, NotificationEventType } from '@prisma/client';

export interface NotificationPayload {
  tenantId: string;
  orderId?: string | null;
  customerId?: string | null;
  channel: NotificationChannel;
  type: NotificationEventType;
  recipient: string | null;
  subject?: string | null;
  message: string;
  payload?: any;
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
