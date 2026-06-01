import { PaymentProvider } from '@prisma/client';

export interface WebhookSignatureResult {
  valid: boolean;
  ignored: boolean;
  reason?: string;
}

export interface WebhookValidationInput {
  provider: PaymentProvider;
  rawBody: string;
  headers: Headers;
  payload: Record<string, unknown>;
}

export type JsonWebhookPayload = Record<string, unknown>;
