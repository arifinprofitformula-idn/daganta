'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AgentCreditTopupStatus, AgentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

const TopupRequestSchema = z.object({
  amount: z.coerce
    .number()
    .int('Jumlah kredit harus angka bulat.')
    .positive('Jumlah kredit harus lebih dari 0.')
    .refine((value) => value % 100 === 0, 'Jumlah kredit harus kelipatan 100.'),
  note: z.string().trim().max(500, 'Catatan maksimal 500 karakter.').optional(),
});

function redirectWithError(message: string): never {
  redirect(`/agent/credits/topup?error=${encodeURIComponent(message)}`);
}

export async function requestTopupAction(formData: FormData) {
  const parsed = TopupRequestSchema.safeParse({
    amount: formData.get('amount'),
    note: formData.get('note')?.toString() ?? '',
  });

  if (!parsed.success) {
    redirectWithError(parsed.error.issues.map((issue) => issue.message).join(' '));
  }

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
      status: true,
    },
  });

  if (!agentProfile) {
    redirectWithError('Profil agen tidak ditemukan.');
  }

  if (agentProfile.status !== AgentStatus.ACTIVE) {
    redirectWithError('Akun agen Anda belum aktif atau sedang dibatasi.');
  }

  await prisma.agentCreditTopupRequest.create({
    data: {
      agentId: agentProfile.id,
      amount: new Prisma.Decimal(parsed.data.amount),
      note: parsed.data.note || null,
      status: AgentCreditTopupStatus.PENDING,
    },
  });

  revalidatePath('/agent/credits');
  redirect('/agent/credits/topup?submitted=1');
}
