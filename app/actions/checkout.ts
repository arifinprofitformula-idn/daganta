'use server';

import { headers } from 'next/headers';
import { prisma } from '../../lib/prisma';
import { resolveTenantFromHost } from '../../lib/tenant/resolve-tenant';
import { OrderStatus, PaymentMethod, PaymentProvider, NotificationChannel, NotificationEventType } from '@prisma/client';
import { manualPaymentAdapter } from '../../lib/payments';
import { createNotificationEvent } from '../../lib/notifications/create-event';

interface CheckoutItemPayload {
  id: string; // productId
  variantId: string | null;
  quantity: number;
}

interface CheckoutPayload {
  name: string;
  phone: string;
  email?: string;
  fullAddress: string;
  province: string;
  city: string;
  district: string;
  postalCode?: string;
  notes?: string;
  items: CheckoutItemPayload[];
}

interface VerifiedItem {
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  variantNameSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weightGram: number;
}

export async function processCheckout(payload: CheckoutPayload) {
  try {
    const { name, phone, email, fullAddress, province, city, district, postalCode, notes, items } = payload;

    // 1. Validasi input dasar
    if (!name?.trim()) return { success: false, error: 'Nama lengkap wajib diisi.' };
    if (!phone?.trim()) return { success: false, error: 'Nomor WhatsApp wajib diisi.' };
    if (!fullAddress?.trim()) return { success: false, error: 'Alamat lengkap wajib diisi.' };
    if (!province?.trim()) return { success: false, error: 'Provinsi wajib diisi.' };
    if (!city?.trim()) return { success: false, error: 'Kota/Kabupaten wajib diisi.' };
    if (!district?.trim()) return { success: false, error: 'Kecamatan wajib diisi.' };
    if (!items || items.length === 0) return { success: false, error: 'Keranjang belanja kosong.' };

    // 2. Resolusi Tenant dari domain host aktif
    const headersList = await headers();
    const host = headersList.get('host') ?? '';
    const resolution = await resolveTenantFromHost(host);

    if (resolution.status !== 'SUCCESS' || !resolution.tenant) {
      return { success: false, error: 'Toko tidak aktif atau tidak ditemukan.' };
    }

    const tenant = resolution.tenant;

    if (resolution.accessMode === 'STOREFRONT_READONLY') {
      return { success: false, error: 'Toko ini dalam mode baca saja. Transaksi tidak diizinkan.' };
    }

    // 3. Validasi & Hitung Ulang Harga serta Berat berdasarkan Database (mencegah manipulasi client-side)
    const verifiedItems: VerifiedItem[] = [];
    let calculatedSubtotal = 0;
    let totalWeightGram = 0;

    for (const item of items) {
      if (item.quantity <= 0) {
        return { success: false, error: 'Jumlah produk tidak boleh nol atau negatif.' };
      }

      // Query produk untuk memastikan aktif dan milik tenant yang bersangkutan
      const product = await prisma.product.findFirst({
        where: {
          id: item.id,
          tenantId: tenant.id,
          status: 'ACTIVE',
        },
        include: {
          variants: true,
        },
      });

      if (!product) {
        return { success: false, error: `Produk tidak ditemukan atau sudah tidak aktif.` };
      }

      let unitPrice = Number(product.basePrice);
      let weightGram = 0;
      let variantNameSnapshot: string | null = null;

      if (item.variantId) {
        // Validasi varian produk
        const variant = product.variants.find((v) => v.id === item.variantId && v.isActive);
        if (!variant) {
          return { success: false, error: `Varian produk untuk "${product.name}" tidak aktif atau tidak tersedia.` };
        }

        // Validasi stok varian (hanya cek ketersediaan, tidak ada stock decrement fisik)
        if (variant.stock < item.quantity) {
          return {
            success: false,
            error: `Stok produk "${product.name} - ${variant.name}" tidak mencukupi. Tersedia: ${variant.stock} unit.`,
          };
        }

        unitPrice = Number(variant.price);
        weightGram = variant.weightGram;
        variantNameSnapshot = variant.name;
      } else {
        // Jika tidak ada varian yang dipilih tetapi produk memiliki varian, paksa pilih varian pertama yang aktif
        const activeVariants = product.variants.filter((v) => v.isActive);
        if (activeVariants.length > 0) {
          const firstVariant = activeVariants[0];
          
          if (firstVariant.stock < item.quantity) {
            return {
              success: false,
              error: `Stok produk "${product.name} - ${firstVariant.name}" tidak mencukupi. Tersedia: ${firstVariant.stock} unit.`,
            };
          }

          unitPrice = Number(firstVariant.price);
          weightGram = firstVariant.weightGram;
          variantNameSnapshot = firstVariant.name;
        } else {
          // Fallback jika produk benar-benar tidak memiliki varian sama sekali
          weightGram = 0; // default weight jika tidak ada
        }
      }

      const totalPrice = unitPrice * item.quantity;
      calculatedSubtotal += totalPrice;
      totalWeightGram += weightGram * item.quantity;

      verifiedItems.push({
        productId: product.id,
        variantId: item.variantId,
        productNameSnapshot: product.name,
        variantNameSnapshot: variantNameSnapshot,
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        weightGram: weightGram,
      });
    }

    // Format Alamat Lengkap Rapi ke dalam field `Customer.address`
    const formattedAddress = [
      fullAddress.trim(),
      `Kecamatan: ${district.trim()}`,
      `Kota/Kabupaten: ${city.trim()}`,
      `Provinsi: ${province.trim()}`,
      postalCode?.trim() ? `Kode Pos: ${postalCode.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // 4. Jalankan Transaksi Database secara Atomik
    const order = await prisma.$transaction(async (tx) => {
      // a. Upsert profil Customer berdasarkan kombinasi unik nomor wa + tenantId
      let customer = await tx.customer.findFirst({
        where: {
          tenantId: tenant.id,
          phone: phone.trim(),
        },
      });

      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: name.trim(),
            email: email?.trim() || null,
            address: formattedAddress,
          },
        });
      } else {
        customer = await tx.customer.create({
          data: {
            tenantId: tenant.id,
            name: name.trim(),
            phone: phone.trim(),
            email: email?.trim() || null,
            address: formattedAddress,
          },
        });
      }

      // b. Buat unique orderNumber (format: ORD-[YYYYMMDD]-[RANDOM_4_DIGIT])
      const todayString = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${todayString}-${randomDigits}`;

      // c. Simpan Order utama dengan status PENDING_PAYMENT
      const newOrder = await tx.order.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          orderNumber: orderNumber,
          status: OrderStatus.PENDING_PAYMENT,
          subtotal: calculatedSubtotal,
          grandTotal: calculatedSubtotal, // Manual checkout gratis ongkir awal/ongkir dihitung manual di WA
          shippingCost: 0,
          discountTotal: 0,
          notes: notes?.trim() || null,
        },
      });

      await tx.orderPayment.create({
        data: {
          tenantId: tenant.id,
          orderId: newOrder.id,
          provider: PaymentProvider.MANUAL,
          method: PaymentMethod.MANUAL_TRANSFER,
          status: manualPaymentAdapter.createInitialStatus(),
          amount: newOrder.grandTotal,
        },
      });

      // d. Simpan snapshot item-item pesanan ke OrderItem
      for (const item of verifiedItems) {
        await tx.orderItem.create({
          data: {
            tenantId: tenant.id,
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId || null,
            productNameSnapshot: item.productNameSnapshot,
            variantNameSnapshot: item.variantNameSnapshot,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            weightGram: item.weightGram,
          },
        });
      }

      // e. Catat ke AuditLog sistem
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          action: 'CUSTOMER_CHECKOUT',
          entityType: 'ORDER',
          entityId: newOrder.id,
          metadata: {
            orderNumber: newOrder.orderNumber,
            buyerName: name.trim(),
            buyerPhone: phone.trim(),
            totalAmount: calculatedSubtotal,
          },
        },
      });

      // f. Buat NotificationEvent untuk ORDER_CREATED
      await createNotificationEvent(tx, {
        tenantId: tenant.id,
        orderId: newOrder.id,
        customerId: customer.id,
        channel: NotificationChannel.INTERNAL,
        type: NotificationEventType.ORDER_CREATED,
        recipient: phone.trim(),
        params: {
          buyerName: name.trim(),
          orderNumber: newOrder.orderNumber,
          amount: newOrder.grandTotal,
        },
      });

      return newOrder;
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error: any) {
    console.error('Checkout error:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat memproses pemesanan Anda. Silakan coba beberapa saat lagi.',
    };
  }
}
