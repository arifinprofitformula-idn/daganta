import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';
import type {
  PaymentAdapter,
  PaymentInstruction,
  PaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  RefundResponse,
} from '../types';

interface MidtransSnapResponse {
  token?: string;
  redirect_url?: string;
  error_messages?: string[];
}

interface MidtransStatusResponse {
  transaction_status?: string;
  fraud_status?: string;
  order_id?: string;
}

function getMidtransBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com';
}

function getMidtransApiBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';
}

function getAuthorizationHeader() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi.');
  }

  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

function mapMidtransStatus(status: string | undefined, fraudStatus: string | undefined) {
  if (status === 'capture' && fraudStatus === 'accept') {
    return PaymentStatus.VERIFIED;
  }

  if (status === 'settlement') {
    return PaymentStatus.VERIFIED;
  }

  if (['cancel', 'deny', 'expire', 'failure'].includes(status ?? '')) {
    return PaymentStatus.REJECTED;
  }

  return PaymentStatus.WAITING_PAYMENT;
}

export class MidtransAdapter implements PaymentAdapter {
  provider = PaymentProvider.MIDTRANS;

  async createPayment(order: PaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${getMidtransBaseUrl()}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: getAuthorizationHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: order.amount,
        },
        customer_details: {
          first_name: order.customerName,
          email: order.customerEmail ?? undefined,
          phone: order.customerPhone ?? undefined,
        },
        item_details: order.items.map((item) => ({
          id: item.id,
          name: item.name.slice(0, 50),
          price: item.price,
          quantity: item.quantity,
        })),
        custom_field1: order.tenantId,
        custom_field2: order.orderId,
        metadata: {
          tenantId: order.tenantId,
          orderId: order.orderId,
        },
      }),
    });

    const result = (await response.json()) as MidtransSnapResponse;

    if (!response.ok || !result.redirect_url) {
      throw new Error(result.error_messages?.join(' ') || 'Gagal membuat pembayaran Midtrans.');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      paymentUrl: result.redirect_url,
      transactionId: order.orderNumber,
      expiresAt,
      rawResponse: result,
    };
  }

  async getPaymentStatus(id: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`${getMidtransApiBaseUrl()}/v2/${encodeURIComponent(id)}/status`, {
      headers: {
        Accept: 'application/json',
        Authorization: getAuthorizationHeader(),
      },
    });
    const result = (await response.json()) as MidtransStatusResponse;

    if (!response.ok) {
      throw new Error('Gagal membaca status pembayaran Midtrans.');
    }

    return {
      transactionId: result.order_id ?? id,
      status: mapMidtransStatus(result.transaction_status, result.fraud_status),
      rawResponse: result,
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

  getInstruction(): PaymentInstruction {
    return {
      provider: PaymentProvider.MIDTRANS,
      method: PaymentMethod.MANUAL_TRANSFER,
      title: 'Midtrans Snap',
      description: 'Pembayaran diproses melalui Midtrans Snap sandbox/production sesuai konfigurasi env.',
    };
  }
}

export const midtransAdapter = new MidtransAdapter();
