'use server';

import { headers } from 'next/headers';
import { prisma } from '../../lib/prisma';
import { resolveTenantFromHost } from '../../lib/tenant/resolve-tenant';
import { getTenantSubscriptionPolicy } from '../../lib/billing/lifecycle';

export interface SafeOrderItem {
  id: string;
  productNameSnapshot: string;
  variantNameSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SafeOrderPayment {
  status: string;
  amount: number;
  method: string;
  provider: string;
  verifiedAt: Date | null;
  rejectedAt: Date | null;
}

export interface SafeOrderResult {
  orderNumber: string;
  createdAt: Date;
  status: string;
  grandTotal: number;
  customerName: string;
  customerPhoneMasked: string;
  customerEmailMasked: string;
  items: SafeOrderItem[];
  payment: SafeOrderPayment | null;
}

export interface TrackOrderResult {
  success: boolean;
  error?: string;
  order?: SafeOrderResult;
}

/**
 * Normalizes any phone number format into a standardized digits-only format starting with 628.
 * Supports: +628..., 628..., 08..., 8...
 */
function normalizePhone(phone: string): string {
  // Extract only digits
  let clean = phone.replace(/[^0-9]/g, '');
  
  if (clean.startsWith('08')) {
    clean = '628' + clean.substring(2);
  } else if (clean.startsWith('8')) {
    clean = '628' + clean.substring(1);
  }
  
  return clean;
}

/**
 * Masks a phone number for safe public display (e.g. 0812****5678)
 */
function maskPhone(phone: string): string {
  const clean = phone.trim();
  if (clean.length <= 6) return '****';
  return `${clean.slice(0, 4)}****${clean.slice(-4)}`;
}

/**
 * Masks an email for safe public display (e.g. an**@do**.com)
 */
function maskEmail(email: string | null): string {
  if (!email) return '-';
  const clean = email.trim();
  const parts = clean.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  
  const maskedName = name.length <= 2 
    ? `${name.slice(0, 1)}*` 
    : `${name.slice(0, 2)}**`;
    
  return `${maskedName}@${domain}`;
}

export async function trackOrderAction(
  orderNumber: string,
  contact: string
): Promise<TrackOrderResult> {
  try {
    // 1. Validasi input dasar
    if (!orderNumber || !orderNumber.trim()) {
      return { success: false, error: 'Nomor pesanan wajib diisi.' };
    }
    if (!contact || !contact.trim()) {
      return { success: false, error: 'Nomor WhatsApp atau email wajib diisi.' };
    }

    // 2. Resolusi Tenant dari domain host aktif
    const headersList = await headers();
    const host = headersList.get('host') ?? '';
    const resolution = await resolveTenantFromHost(host);

    if (resolution.status !== 'SUCCESS' || !resolution.tenant) {
      return { success: false, error: 'Toko tidak aktif atau tidak ditemukan.' };
    }

    const tenant = resolution.tenant;

    // 3. Evaluasi subscription dynamic policy
    const policy = await getTenantSubscriptionPolicy(tenant.id);
    if (policy.effectiveStatus === 'SUSPENDED' || policy.effectiveStatus === 'CANCELED') {
      return {
        success: false,
        error: 'Layanan cek pesanan toko ini sementara belum aktif. Silakan hubungi pemilik toko atau admin Daganta untuk informasi lebih lanjut.',
      };
    }

    // 4. Query order berdasarkan nomor order dan tenant ID (tenant-scoped)
    const order = await prisma.order.findFirst({
      where: {
        tenantId: tenant.id,
        orderNumber: orderNumber.trim(),
      },
      include: {
        customer: true,
        items: true,
        payment: true,
      },
    });

    if (!order || !order.customer) {
      return {
        success: false,
        error: 'Pesanan tidak ditemukan. Pastikan nomor pesanan dan kontak yang Anda masukkan sudah sesuai.',
      };
    }

    // 5. Verifikasi kontak secara ketat (mencegah enumerasi order)
    const inputClean = contact.trim().toLowerCase();
    const customerEmail = order.customer.email?.trim().toLowerCase() || '';
    const customerPhoneRaw = order.customer.phone.trim();
    
    // Check if input matches email
    const isEmailMatch = customerEmail !== '' && inputClean === customerEmail;
    
    // Check if input matches phone
    const normalizedInput = normalizePhone(contact);
    const normalizedStored = normalizePhone(customerPhoneRaw);
    
    // Safety guard: reject phone input if it's too short (less than 8 digits)
    const isPhoneInputValid = normalizedInput.length >= 8;
    
    const isPhoneMatch = isPhoneInputValid && (
      normalizedInput === normalizedStored || 
      (normalizedStored.length >= 8 && normalizedInput.slice(-8) === normalizedStored.slice(-8))
    );

    if (!isEmailMatch && !isPhoneMatch) {
      return {
        success: false,
        error: 'Pesanan tidak ditemukan. Pastikan nomor pesanan dan kontak yang Anda masukkan sudah sesuai.',
      };
    }

    // 6. Serialisasi data secara aman (tanpa info alamat detail, data log, dll.)
    const safeOrder: SafeOrderResult = {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      grandTotal: Number(order.grandTotal),
      customerName: order.customer.name,
      customerPhoneMasked: maskPhone(order.customer.phone),
      customerEmailMasked: maskEmail(order.customer.email),
      items: order.items.map((item) => ({
        id: item.id,
        productNameSnapshot: item.productNameSnapshot,
        variantNameSnapshot: item.variantNameSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      payment: order.payment ? {
        status: order.payment.status,
        amount: Number(order.payment.amount),
        method: order.payment.method,
        provider: order.payment.provider,
        verifiedAt: order.payment.verifiedAt,
        rejectedAt: order.payment.rejectedAt,
      } : null,
    };

    return {
      success: true,
      order: safeOrder,
    };
  } catch (err: any) {
    console.error('Order tracking error:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memuat status pesanan Anda. Silakan coba beberapa saat lagi.',
    };
  }
}
