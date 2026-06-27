'use client';

import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createOrderAction,
  getDistrictsAction,
  getRegenciesAction,
  type CheckoutActionState,
} from '@/app/checkout/actions';
import type { EnrichedCart } from '@/lib/cart/cart';

interface RegionOption {
  id: string;
  name: string;
}

interface RegencyOption extends RegionOption {
  type: string | null;
}

interface CheckoutFormProps {
  tenantName: string;
  provinces: RegionOption[];
  cart: EnrichedCart;
}

const initialState: CheckoutActionState = {
  success: false,
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutForm({ tenantName, provinces, cart }: CheckoutFormProps) {
  const [state, formAction, isSubmitting] = useActionState(createOrderAction, initialState);
  const [regencies, setRegencies] = useState<RegencyOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [isLoadingRegion, startRegionTransition] = useTransition();

  function handleProvinceChange(provinceId: string) {
    startRegionTransition(async () => {
      setDistricts([]);
      const nextRegencies = await getRegenciesAction(provinceId);
      setRegencies(nextRegencies);
    });
  }

  function handleRegencyChange(regencyId: string) {
    startRegionTransition(async () => {
      const nextDistricts = await getDistrictsAction(regencyId);
      setDistricts(nextDistricts);
    });
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        {state.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {state.error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Informasi Kontak</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" required placeholder="Andi Pratama" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input id="phone" name="phone" required placeholder="081234567890" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="andi@email.com" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Alamat Pengiriman</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Provinsi</Label>
              <Select name="provinceId" required onValueChange={handleProvinceChange}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Pilih provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kabupaten/Kota</Label>
              <Select name="regencyId" required onValueChange={handleRegencyChange} disabled={regencies.length === 0}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={isLoadingRegion ? 'Memuat...' : 'Pilih kota'} />
                </SelectTrigger>
                <SelectContent>
                  {regencies.map((regency) => (
                    <SelectItem key={regency.id} value={regency.id}>
                      {regency.type ? `${regency.type} ${regency.name}` : regency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kecamatan</Label>
              <Select name="districtId" required disabled={districts.length === 0}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={isLoadingRegion ? 'Memuat...' : 'Pilih kecamatan'} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="fullAddress">Alamat Lengkap</Label>
            <Textarea id="fullAddress" name="fullAddress" required rows={4} placeholder="Nama jalan, nomor rumah, RT/RW, patokan..." />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Catatan</h2>
          <div className="mt-5 space-y-2">
            <Label htmlFor="notes">Catatan Pesanan</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Opsional" />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Ringkasan Pesanan</h2>
        <p className="mt-1 text-xs text-slate-500">{tenantName}</p>

        <div className="mt-5 divide-y divide-slate-100">
          {cart.items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? 'default'}`} className="py-3 text-sm">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  {item.variantName && <p className="text-xs text-slate-400">{item.variantName}</p>}
                  <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                </div>
                <p className="font-black text-slate-900">{formatRupiah(item.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Subtotal</span>
            <span className="font-black text-slate-900">{formatRupiah(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Ongkos Kirim</span>
            <span className="font-black text-emerald-600">Dikonfirmasi admin</span>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <Button type="submit" disabled={isSubmitting || cart.items.length === 0} className="h-11 w-full bg-slate-950 text-white hover:bg-slate-800">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Buat Pesanan'
            )}
          </Button>
          <Button asChild type="button" variant="outline" className="mt-3 h-11 w-full">
            <Link href="/products">Lanjut Belanja</Link>
          </Button>
        </div>
      </aside>
    </form>
  );
}
