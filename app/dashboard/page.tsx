import { Suspense } from 'react';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { getDashboardStats } from '@/lib/data-access/dashboard-stats';
import {
  getCurrentTenant,
  type CurrentTenant,
} from '@/lib/tenant/get-current-tenant';

interface StatCardViewModel {
  label: string;
  value: string;
  icon: LucideIcon;
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {['products', 'orders', 'customers', 'revenue'].map((key) => (
        <Card key={key} className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: StatCardViewModel) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-slate-600">
          {label}
        </CardTitle>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#1A355C]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-950">{value}</div>
      </CardContent>
    </Card>
  );
}

async function DashboardStatsCards({
  currentTenant,
}: {
  currentTenant: CurrentTenant | null;
}) {
  if (!currentTenant) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-amber-900">
        <CardContent className="py-5">
          <p className="text-sm font-medium">
            Tenant belum ditemukan untuk sesi ini. Pastikan akun sudah terhubung ke toko.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statsResult = await getDashboardStatsResult(currentTenant.tenantId);

  if (!statsResult.ok) {
    return <ErrorState message={statsResult.message} />;
  }

  const stats = statsResult.stats;

  if (stats.totalProducts === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Belum Ada Produk"
        description="Tambahkan produk pertama agar pelanggan bisa mulai melihat etalase toko Anda."
        actionLabel="Tambah Produk Pertama"
        actionHref="/dashboard/products/new"
      />
    );
  }

  const statCards: StatCardViewModel[] = [
    {
      label: 'Total Produk',
      value: formatNumber(stats.totalProducts),
      icon: Package,
    },
    {
      label: 'Total Pesanan',
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
    },
    {
      label: 'Total Pelanggan',
      value: formatNumber(stats.totalCustomers),
      icon: Users,
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: rupiahFormatter.format(stats.monthlyRevenue),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

async function getDashboardStatsResult(tenantId: string) {
  try {
    const stats = await getDashboardStats(tenantId);

    return {
      ok: true as const,
      stats,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Statistik dashboard belum bisa dimuat.';

    return {
      ok: false as const,
      message,
    };
  }
}

export default async function DashboardPage() {
  const currentTenant = await getCurrentTenant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Dashboard Toko
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan performa {currentTenant?.tenantName || 'toko Anda'}.
        </p>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsCards currentTenant={currentTenant} />
      </Suspense>
    </div>
  );
}
