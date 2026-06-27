import { PackageSearch } from 'lucide-react';
import { redirect } from 'next/navigation';
import MarketingHome from '@/components/marketing/marketing-home';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStorefrontTenantContext } from '@/lib/tenant/storefront-tenant';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    orderId?: string;
    phone?: string;
  }>;
}

export default async function OrderTrackPage({ searchParams }: PageProps) {
  const { orderId, phone } = await searchParams;

  if (orderId?.trim() && phone?.trim()) {
    redirect(`/orders/${encodeURIComponent(orderId.trim())}?phone=${encodeURIComponent(phone.trim())}`);
  }

  const result = await getStorefrontTenantContext();

  if (result.status === 'MARKETING_SITE') {
    return <MarketingHome />;
  }

  const tenantName = result.tenant?.name ?? 'Toko';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <PackageSearch className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-500">{tenantName}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Lacak Pesanan</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cek Status Pesanan</CardTitle>
            <CardDescription>Masukkan nomor HP dan nomor pesanan yang digunakan saat checkout.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" method="get" action="/orders/track">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" name="phone" inputMode="tel" placeholder="Contoh: 081234567890" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderId">Nomor Pesanan</Label>
                <Input id="orderId" name="orderId" placeholder="Contoh: ORD-20260627-001" required />
              </div>

              <Button className="w-full" type="submit">
                Cek Status Pesanan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
