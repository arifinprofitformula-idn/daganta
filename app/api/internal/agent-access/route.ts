import { NextResponse } from 'next/server';
import { AgentStatus } from '@prisma/client';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    return NextResponse.json({ authenticated: false, isAgent: false });
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

  return NextResponse.json({
    authenticated: true,
    isAgent:
      !!agentProfile &&
      agentProfile.status !== AgentStatus.SUSPENDED &&
      agentProfile.status !== AgentStatus.ARCHIVED,
  });
}
