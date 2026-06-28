import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';
import type {
  PaymentAdapter,
  PaymentInstruction,
  PaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  RefundResponse,
} from '../types';

function createManualInstruction(): PaymentInstruction {
  return {
    provider: PaymentProvider.MANUAL,
    method: PaymentMethod.MANUAL_TRANSFER,
    title: 'Transfer Manual',
    description: 'Transfer ke rekening toko, lalu unggah bukti pembayaran atau hubungi admin toko melalui WhatsApp.',
  };
}

export class ManualTransferAdapter implements PaymentAdapter {
  provider = PaymentProvider.MANUAL;

  async createPayment(order: PaymentRequest): Promise<PaymentResponse> {
    return {
      paymentUrl: null,
      transactionId: order.orderNumber,
      expiresAt: null,
      instructions: createManualInstruction(),
    };
  }

  async getPaymentStatus(id: string): Promise<PaymentStatusResponse> {
    return {
      transactionId: id,
      status: PaymentStatus.WAITING_PAYMENT,
    };
  }

  async refund(id: string): Promise<RefundResponse> {
    return {
      transactionId: id,
      refunded: false,
    };
  }

  createInitialStatus() {
    return PaymentStatus.WAITING_PAYMENT;
  }

  getInstruction() {
    return createManualInstruction();
  }
}

export const manualTransferAdapter = new ManualTransferAdapter();
export const manualPaymentAdapter = manualTransferAdapter;
