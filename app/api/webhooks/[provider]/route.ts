import { NextRequest, NextResponse } from 'next/server';
import { PaymentProvider, Prisma, WebhookEventStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeWebhookHeaders } from '@/lib/payments/webhooks/headers';
import {
  extractWebhookTransactionId,
  processPaymentWebhook,
  type WebhookPayload,
  type WebhookProvider,
} from '@/lib/webhooks/process-event';
import {
  validateMidtransSignature,
  validateTripaySignature,
  validateXenditSignature,
} from '@/lib/webhooks/signature';

interface RouteContext {
  params: Promise<{
    provider: string;
  }>;
}

const providerBySlug: Record<string, WebhookProvider> = {
  midtrans: PaymentProvider.MIDTRANS,
  xendit: PaymentProvider.XENDIT,
  tripay: PaymentProvider.TRIPAY,
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function validateSignature(provider: WebhookProvider, rawBody: string, headers: Headers) {
  if (provider === PaymentProvider.MIDTRANS) {
    return validateMidtransSignature(
      rawBody,
      process.env.MIDTRANS_SERVER_KEY ?? '',
      headers.get('signature-key') ?? headers.get('x-signature-key')
    );
  }

  if (provider === PaymentProvider.XENDIT) {
    return validateXenditSignature(
      headers.get('x-callback-token'),
      process.env.XENDIT_CALLBACK_TOKEN ?? ''
    );
  }

  return validateTripaySignature(
    rawBody,
    process.env.TRIPAY_PRIVATE_KEY ?? '',
    headers.get('x-callback-signature') ?? headers.get('signature')
  );
}

function getEventType(provider: WebhookProvider, payload: WebhookPayload) {
  const rawEventType =
    payload.eventType ||
    payload.event_type ||
    payload.type ||
    payload.status ||
    payload.transaction_status ||
    'payment_webhook';

  return `${provider}:${String(rawEventType)}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider: providerSlug } = await context.params;
  const provider = providerBySlug[providerSlug.toLowerCase()];

  if (!provider) {
    return jsonResponse({ received: false, error: 'Provider webhook tidak didukung.' }, 400);
  }

  const rawBody = await request.text();

  if (!validateSignature(provider, rawBody, request.headers)) {
    return jsonResponse({ received: false }, 401);
  }

  let payload: WebhookPayload;

  try {
    const parsedPayload = JSON.parse(rawBody);

    if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload)) {
      return jsonResponse({ received: false, error: 'Payload webhook harus berupa JSON object.' }, 400);
    }

    payload = parsedPayload as WebhookPayload;
  } catch {
    return jsonResponse({ received: false, error: 'Payload webhook tidak valid.' }, 400);
  }

  const transactionId = extractWebhookTransactionId(provider, payload);

  if (!transactionId) {
    return jsonResponse({ received: false, error: 'Transaction ID webhook tidak ditemukan.' }, 400);
  }

  const idempotencyKey = `${provider}::${transactionId}`;
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: {
      provider_idempotencyKey: {
        provider,
        idempotencyKey,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (existingEvent) {
    return jsonResponse({ received: true, duplicate: true, status: existingEvent.status });
  }

  let webhookEvent;

  try {
    webhookEvent = await prisma.webhookEvent.create({
      data: {
        provider,
        eventType: getEventType(provider, payload),
        eventId: transactionId,
        idempotencyKey,
        status: WebhookEventStatus.RECEIVED,
        payload: {
          rawBody,
          parsed: payload,
        } as Prisma.InputJsonValue,
        sanitizedHeaders: sanitizeWebhookHeaders(request.headers) as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonResponse({ received: true, duplicate: true });
    }

    return jsonResponse({ received: false, error: 'Webhook belum dapat dicatat.' }, 500);
  }

  try {
    const result = await processPaymentWebhook(provider, {
      provider,
      transactionId,
      payload,
    });

    if (!result.success) {
      await prisma.webhookEvent.update({
        where: {
          id: webhookEvent.id,
        },
        data: {
          status: WebhookEventStatus.FAILED,
          errorMessage: result.error ?? 'Webhook gagal diproses.',
          processedAt: new Date(),
        },
      });

      return jsonResponse({ received: true, processed: false }, 200);
    }

    await prisma.webhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        status: result.status === 'IGNORED' ? WebhookEventStatus.IGNORED : WebhookEventStatus.PROCESSED,
        errorMessage: null,
        processedAt: new Date(),
      },
    });

    return jsonResponse({
      received: true,
      processed: result.status !== 'IGNORED',
      ignored: result.status === 'IGNORED',
      targetType: result.targetType,
      targetId: result.targetId,
    });
  } catch (error: unknown) {
    console.error('Payment webhook processing error:', error);

    await prisma.webhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        status: WebhookEventStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Webhook processing failed.',
        processedAt: new Date(),
      },
    });

    return jsonResponse({ received: true, processed: false }, 200);
  }
}
