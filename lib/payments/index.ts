import { PaymentProvider } from '@prisma/client';
import { manualPaymentAdapter } from './manual';

export { manualPaymentAdapter } from './manual';
export type { CreateManualPaymentInput, PaymentAdapter, PaymentInstruction } from './types';

export const paymentAdapters = {
  [PaymentProvider.MANUAL]: manualPaymentAdapter,
} as const;

export function getPaymentAdapter(provider: PaymentProvider) {
  if (provider !== PaymentProvider.MANUAL) {
    throw new Error('Provider pembayaran belum aktif.');
  }

  return paymentAdapters[provider];
}
