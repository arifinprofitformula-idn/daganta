import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';
import { PaymentAdapter } from './types';

export const manualPaymentAdapter: PaymentAdapter = {
  provider: PaymentProvider.MANUAL,
  createInitialStatus() {
    return PaymentStatus.WAITING_PAYMENT;
  },
  getInstruction() {
    return {
      provider: PaymentProvider.MANUAL,
      method: PaymentMethod.MANUAL_TRANSFER,
      title: 'Transfer Manual',
      description: 'Instruksi pembayaran manual akan dikonfirmasi oleh admin toko melalui WhatsApp.',
    };
  },
};
