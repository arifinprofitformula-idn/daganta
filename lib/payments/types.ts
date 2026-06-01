import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';

export interface CreateManualPaymentInput {
  tenantId: string;
  orderId: string;
  amount: number;
}

export interface PaymentInstruction {
  provider: PaymentProvider;
  method: PaymentMethod;
  title: string;
  description: string;
}

export interface PaymentAdapter {
  provider: PaymentProvider;
  createInitialStatus(): PaymentStatus;
  getInstruction(): PaymentInstruction;
}
