import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PaymentProvider, WebhookEventStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeWebhookHeaders } from '@/lib/payments/webhooks/headers';
import {
  createWebhookIdempotencyKey,
  getWebhookEventId,
  getWebhookEventType,
} from '@/lib/payments/webhooks/idempotency';
import { validateWebhookSignature } from '@/lib/payments/webhooks/signature';
import { JsonWebhookPayload } from '@/lib/payments/webhooks/types';

interface RouteContext {
  params: Promise<{
    provider: string;
  }>;
}

const providerBySlug: Record<string, PaymentProvider> = {
  manual: PaymentProvider.MANUAL,
  midtrans: PaymentProvider.MIDTRANS,
  xendit: PaymentProvider.XENDIT,
  tripay: PaymentProvider.TRIPAY,
};

function safeJsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider: providerSlug } = await context.params;
  const provider = providerBySlug[providerSlug.toLowerCase()];

  if (!provider) {
    return safeJsonResponse({ received: false, error: 'Provider webhook tidak didukung.' }, 400);
  }

  const rawBody = await request.text();
  let payload: JsonWebhookPayload;

  try {
    const parsedPayload = JSON.parse(rawBody);
    if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload)) {
      return safeJsonResponse({ received: false, error: 'Payload webhook harus berupa JSON object.' }, 400);
    }
    payload = parsedPayload as JsonWebhookPayload;
  } catch {
    return safeJsonResponse({ received: false, error: 'Payload webhook tidak valid.' }, 400);
  }

  const idempotencyKey = createWebhookIdempotencyKey(provider, payload, request.headers, rawBody);
  const sanitizedHeaders = sanitizeWebhookHeaders(request.headers);
  const signatureResult = validateWebhookSignature({
    provider,
    rawBody,
    headers: request.headers,
    payload,
  });
  const status = signatureResult.ignored ? WebhookEventStatus.IGNORED : WebhookEventStatus.RECEIVED;

  try {
    await prisma.webhookEvent.create({
      data: {
        provider,
        eventType: getWebhookEventType(payload),
        eventId: getWebhookEventId(payload),
        idempotencyKey,
        status,
        payload: payload as Prisma.InputJsonValue,
        sanitizedHeaders: sanitizedHeaders as Prisma.InputJsonValue,
        errorMessage: signatureResult.reason || null,
        processedAt: status === WebhookEventStatus.IGNORED ? new Date() : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return safeJsonResponse({ received: true, duplicate: true });
    }

    return safeJsonResponse({ received: false, error: 'Webhook belum dapat dicatat.' }, 500);
  }

  if (signatureResult.ignored) {
    return safeJsonResponse({ received: true, ignored: true });
  }

  if (!signatureResult.valid) {
    return safeJsonResponse({ received: false, error: 'Signature webhook tidak valid.' }, 401);
  }

  return safeJsonResponse({ received: true });
}
