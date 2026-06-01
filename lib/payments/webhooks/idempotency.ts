import { createHash } from 'crypto';
import { PaymentProvider } from '@prisma/client';
import { JsonWebhookPayload } from './types';

const EVENT_ID_KEYS = ['id', 'event_id', 'eventId', 'transaction_id', 'reference_id'];
const SAFE_IDEMPOTENCY_HEADERS = ['idempotency-key', 'x-idempotency-key', 'x-request-id'];

function getStringValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function getWebhookEventId(payload: JsonWebhookPayload) {
  for (const key of EVENT_ID_KEYS) {
    const value = getStringValue(payload[key]);
    if (value) return value;
  }

  return null;
}

export function getWebhookEventType(payload: JsonWebhookPayload) {
  return (
    getStringValue(payload.eventType) ||
    getStringValue(payload.event_type) ||
    getStringValue(payload.type) ||
    'unknown'
  );
}

export function createWebhookIdempotencyKey(provider: PaymentProvider, payload: JsonWebhookPayload, headers: Headers, rawBody: string) {
  const eventId = getWebhookEventId(payload);
  if (eventId) return eventId;

  for (const headerName of SAFE_IDEMPOTENCY_HEADERS) {
    const value = getStringValue(headers.get(headerName));
    if (value) return value;
  }

  return createHash('sha256').update(`${provider}:${rawBody}`).digest('hex');
}
