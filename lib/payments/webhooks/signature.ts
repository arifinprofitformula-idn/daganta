import { PaymentProvider } from '@prisma/client';
import { WebhookSignatureResult, WebhookValidationInput } from './types';

export function validateWebhookSignature(input: WebhookValidationInput): WebhookSignatureResult {
  if (input.provider === PaymentProvider.MANUAL) {
    return { valid: true, ignored: false };
  }

  return {
    valid: false,
    ignored: true,
    reason: 'Provider webhook belum dikonfigurasi.',
  };
}
