'use client';

import { useMemo, useState } from 'react';
import { CreditCard, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientStoreAction } from '@/app/agent/clients/new/actions';

interface PlanOption {
  id: string;
  name: string;
  code: string;
  price: number;
  productLimit: number;
  activeMonths: number;
}

interface ClientStoreFormProps {
  plans: PlanOption[];
  creditBalance: number;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ClientStoreForm({ plans, creditBalance }: ClientStoreFormProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? '');
  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null;
  }, [plans, selectedPlanId]);
  const remainingBalance = selectedPlan ? creditBalance - selectedPlan.price : creditBalance;
  const insufficientBalance = remainingBalance < 0;

  return (
    <form action={createClientStoreAction} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Data Toko Klien</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nama Toko</Label>
            <Input id="storeName" name="storeName" minLength={3} required placeholder="Contoh: Warung Maju Jaya" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
              <Input
                id="subdomain"
                name="subdomain"
                minLength={3}
                maxLength={32}
                pattern="[a-z0-9-]+"
                required
                placeholder="warung-maju"
                className="rounded-none border-0 focus-visible:ring-0"
              />
              <span className="flex items-center border-l bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                .daganta.store
              </span>
            </div>
            <p className="text-xs text-slate-500">Lowercase, tanpa spasi, angka dan tanda hubung diperbolehkan.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Nama Pemilik Toko</Label>
              <Input id="ownerName" name="ownerName" minLength={2} required placeholder="Nama klien UMKM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Nomor HP Pemilik</Label>
              <Input id="ownerPhone" name="ownerPhone" required placeholder="081234567890" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Email Pemilik</Label>
            <Input id="ownerEmail" name="ownerEmail" type="email" required placeholder="pemilik@email.com" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Pilih Paket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {plans.map((plan) => {
              const checked = selectedPlanId === plan.id;

              return (
                <label
                  key={plan.id}
                  className={`block cursor-pointer rounded-xl border p-4 transition ${
                    checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="planId"
                    value={plan.id}
                    checked={checked}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="sr-only"
                    required
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{plan.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {plan.productLimit} produk, aktif {plan.activeMonths} bulan
                      </p>
                    </div>
                    <p className="text-sm font-black text-blue-700">{formatRupiah(plan.price)}</p>
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>

        <Card className={insufficientBalance ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2 text-slate-700">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview Kredit</p>
                <p className="text-sm font-bold text-slate-950">
                  Akan memotong {formatRupiah(selectedPlan?.price ?? 0)} dari saldo Anda.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo sekarang</span>
                <strong>{formatRupiah(creditBalance)}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">Sisa saldo</span>
                <strong className={insufficientBalance ? 'text-rose-700' : 'text-emerald-700'}>
                  {formatRupiah(remainingBalance)}
                </strong>
              </div>
            </div>
            {insufficientBalance ? (
              <p className="text-sm font-semibold text-rose-700">Saldo kredit tidak cukup untuk paket ini.</p>
            ) : null}
            <Button type="submit" disabled={insufficientBalance || plans.length === 0} className="w-full">
              <Store className="h-4 w-4" aria-hidden="true" />
              Buat Toko Klien
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
