import { NotificationAdapter, AdapterSendResult } from '../types';

export class WhatsAppAdapter implements NotificationAdapter {
  async send(recipient: string, message: string): Promise<AdapterSendResult> {
    // Dry-run skeleton. Does not send real messages.
    // Console logging safety check: Mask phone number.
    const maskedPhone = recipient && recipient.length > 5
      ? `${recipient.substring(0, 4)}***${recipient.substring(recipient.length - 3)}`
      : '***';

    // Log safe metadata
    console.log(`[DRY-RUN] [WHATSAPP] Dispatching message to: ${maskedPhone}`);

    return {
      success: true,
      sentAt: new Date(),
    };
  }
}

export const whatsappAdapter = new WhatsAppAdapter();
