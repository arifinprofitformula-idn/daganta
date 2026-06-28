import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';

export interface PaymentRequestItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentRequest {
  tenantId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: PaymentRequestItem[];
}

export interface PaymentResponse {
  paymentUrl: string | null;
  transactionId: string;
  expiresAt: Date | null;
  instructions?: PaymentInstruction;
  rawResponse?: unknown;
}

export interface PaymentStatusResponse {
  transactionId: string;
  status: PaymentStatus;
  rawResponse?: unknown;
}

export interface RefundResponse {
  transactionId: string;
  refunded: boolean;
  rawResponse?: unknown;
}

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
  createPayment(order: PaymentRequest): Promise<PaymentResponse>;
  getPaymentStatus(id: string): Promise<PaymentStatusResponse>;
  refund(id: string): Promise<RefundResponse>;
  createInitialStatus(): PaymentStatus;
  getInstruction(): PaymentInstruction;
}
