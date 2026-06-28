import { PaymentProvider } from '@prisma/client';
import type { PaymentAdapter } from './types';
import { manualTransferAdapter } from './adapters/manual';
import { midtransAdapter } from './adapters/midtrans';

export function getPaymentAdapter(provider: PaymentProvider): PaymentAdapter {
  switch (provider) {
    case PaymentProvider.MANUAL:
      return manualTransferAdapter;
    case PaymentProvider.MIDTRANS:
      return midtransAdapter;
    case PaymentProvider.XENDIT:
    case PaymentProvider.TRIPAY:
    default:
      return manualTransferAdapter;
  }
}
