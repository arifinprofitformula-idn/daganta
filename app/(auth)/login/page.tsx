import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, Store } from 'lucide-react';
import { login } from './actions';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  let hasUser = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    hasUser = !!user;
  } catch {
    hasUser = false;
  }

  if (hasUser) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error;
  const infoMessage = resolvedSearchParams.message;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A355C] text-white">
            <Store className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Daganta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Masuk untuk mengelola webstore Anda.
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Masuk</CardTitle>
            <CardDescription>
              Gunakan email dan password akun Supabase Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {infoMessage ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {infoMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="owner@toko.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-xs font-medium text-[#1A355C] hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#1A355C] hover:bg-[#152a49]">
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
