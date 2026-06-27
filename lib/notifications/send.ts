import { NotificationChannel, type NotificationEvent } from '@prisma/client';
import type { AdapterSendResult } from './types';

function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
}

function maskRecipient(recipient: string | null) {
  if (!recipient) {
    return '***';
  }

  if (recipient.includes('@')) {
    const [name, domain] = recipient.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }

  return recipient.length > 6
    ? `${recipient.slice(0, 4)}***${recipient.slice(-3)}`
    : '***';
}

function createWhatsAppLink(recipient: string, message: string) {
  const normalizedPhone = normalizeWhatsAppNumber(recipient);

  if (!normalizedPhone) {
    throw new Error('Nomor WhatsApp penerima tidak valid.');
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

async function sendEmailDryRun(event: NotificationEvent): Promise<AdapterSendResult> {
  const provider = process.env.EMAIL_PROVIDER || 'dry-run';

  console.log(
    `[NOTIFICATION] EMAIL ${provider} queued for ${maskRecipient(event.recipient)} subject="${event.subject || 'Notifikasi'}"`
  );

  return {
    success: true,
    sentAt: new Date(),
  };
}

export async function sendNotification(event: NotificationEvent): Promise<AdapterSendResult> {
  if (event.channel === NotificationChannel.WHATSAPP || event.channel === NotificationChannel.WHATSAPP_LINK) {
    if (!event.recipient) {
      return {
        success: false,
        failedAt: new Date(),
        lastError: 'Recipient WhatsApp kosong.',
      };
    }

    const url = createWhatsAppLink(event.recipient, event.message);
    console.log(`[NOTIFICATION] WHATSAPP_LINK generated for ${maskRecipient(event.recipient)}: ${url}`);

    return {
      success: true,
      sentAt: new Date(),
      lastError: url,
    };
  }

  if (event.channel === NotificationChannel.EMAIL) {
    if (!event.recipient) {
      return {
        success: false,
        failedAt: new Date(),
        lastError: 'Recipient email kosong.',
      };
    }

    return sendEmailDryRun(event);
  }

  if (event.channel === NotificationChannel.INTERNAL) {
    console.log(`[NOTIFICATION] INTERNAL event ${event.id} marked as delivered.`);

    return {
      success: true,
      sentAt: new Date(),
    };
  }

  console.warn(`[NOTIFICATION] Unsupported channel for event ${event.id}: ${event.channel}`);

  return {
    success: false,
    failedAt: new Date(),
    lastError: `Channel tidak didukung: ${event.channel}`,
  };
}
