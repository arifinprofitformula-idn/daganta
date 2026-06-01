import { NotificationAdapter, AdapterSendResult } from '../types';

export class EmailAdapter implements NotificationAdapter {
  async send(recipient: string, message: string, subject?: string | null): Promise<AdapterSendResult> {
    // Dry-run skeleton. Does not send real emails.
    // Console logging safety check: Mask email address.
    const maskedEmail = recipient && recipient.includes('@')
      ? `${recipient.split('@')[0].substring(0, 2)}***@${recipient.split('@')[1]}`
      : '***';

    // Log safe metadata
    console.log(`[DRY-RUN] [EMAIL] Dispatching subject "${subject || 'Notifikasi'}" to: ${maskedEmail}`);

    return {
      success: true,
      sentAt: new Date(),
    };
  }
}

export const emailAdapter = new EmailAdapter();
