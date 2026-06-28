import {
  AgentCreditDirection,
  AgentCreditLedgerType,
  Prisma,
} from '@prisma/client';

export interface AgentCreditMutationInput {
  agentId: string;
  amount: Prisma.Decimal | number | string;
  description: string;
  metadata?: Prisma.InputJsonValue;
  referenceTenantId?: string | null;
  referenceInvoiceId?: string | null;
  referenceClientId?: string | null;
  createdByUserId?: string | null;
}

function toDecimal(value: Prisma.Decimal | number | string) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

/**
 * Append-only debit helper. Must be called inside a Prisma transaction.
 */
export async function deductAgentCredit(
  tx: Prisma.TransactionClient,
  input: AgentCreditMutationInput
) {
  const amount = toDecimal(input.amount);
  const agent = await tx.agentProfile.findUnique({
    where: {
      id: input.agentId,
    },
    select: {
      creditBalance: true,
    },
  });

  if (!agent) {
    throw new Error('Profil agen tidak ditemukan.');
  }

  if (agent.creditBalance.lt(amount)) {
    throw new Error('Saldo kredit agen tidak cukup.');
  }

  const balanceBefore = agent.creditBalance;
  const balanceAfter = balanceBefore.minus(amount);

  const updateResult = await tx.agentProfile.updateMany({
    where: {
      id: input.agentId,
      creditBalance: {
        gte: amount,
      },
    },
    data: {
      creditBalance: balanceAfter,
    },
  });

  if (updateResult.count === 0) {
    throw new Error('Saldo kredit agen tidak cukup.');
  }

  return tx.agentCreditLedger.create({
    data: {
      agentId: input.agentId,
      type: AgentCreditLedgerType.STORE_ACTIVATION,
      direction: AgentCreditDirection.DEBIT,
      amount,
      balanceBefore,
      balanceAfter,
      referenceTenantId: input.referenceTenantId ?? null,
      referenceInvoiceId: input.referenceInvoiceId ?? null,
      referenceClientId: input.referenceClientId ?? null,
      description: input.description,
      metadata: input.metadata ?? Prisma.JsonNull,
      createdByUserId: input.createdByUserId ?? null,
    },
  });
}

/**
 * Append-only credit helper. Must be called inside a Prisma transaction.
 */
export async function addAgentCredit(
  tx: Prisma.TransactionClient,
  input: AgentCreditMutationInput
) {
  const amount = toDecimal(input.amount);
  const agent = await tx.agentProfile.findUnique({
    where: {
      id: input.agentId,
    },
    select: {
      creditBalance: true,
    },
  });

  if (!agent) {
    throw new Error('Profil agen tidak ditemukan.');
  }

  const balanceBefore = agent.creditBalance;
  const balanceAfter = balanceBefore.plus(amount);

  await tx.agentProfile.update({
    where: {
      id: input.agentId,
    },
    data: {
      creditBalance: balanceAfter,
    },
  });

  return tx.agentCreditLedger.create({
    data: {
      agentId: input.agentId,
      type: AgentCreditLedgerType.TOP_UP,
      direction: AgentCreditDirection.CREDIT,
      amount,
      balanceBefore,
      balanceAfter,
      referenceTenantId: input.referenceTenantId ?? null,
      referenceInvoiceId: input.referenceInvoiceId ?? null,
      referenceClientId: input.referenceClientId ?? null,
      description: input.description,
      metadata: input.metadata ?? Prisma.JsonNull,
      createdByUserId: input.createdByUserId ?? null,
    },
  });
}
