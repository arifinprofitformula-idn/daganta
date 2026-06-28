import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { requestTopupAction } from './actions';

export const dynamic = 'force-dynamic';

interface TopupPageProps {
  searchParams: Promise<{
    error?: string;
    submitted?: string;
  }>;
}

export default async function AgentTopupPage({ searchParams }: TopupPageProps) {
  const params = await searchParams;
  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    redirect('/login');
  }

  const agentProfile = await prisma.agentProfile.findUnique({
    where: {
      userProfileId: authData.profile.id,
    },
    select: {
      id: true,
    },
  });

  if (!agentProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link href="/agent/credits">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Saldo Kredit
        </Link>
      </Button>

      {params.submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Request top-up berhasil dikirim. Status: Menunggu konfirmasi admin.
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {params.error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Request Top-up Kredit</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={requestTopupAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah kredit yang diminta</Label>
              <Input id="amount" name="amount" type="number" min={100} step={100} required placeholder="1000" />
              <p className="text-xs text-slate-500">Jumlah harus kelipatan 100.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Textarea id="note" name="note" rows={4} placeholder="Opsional, contoh: top-up untuk aktivasi 3 toko klien." />
            </div>

            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
