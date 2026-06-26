import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const hasAction = Boolean(actionLabel && actionHref);

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-[#1A355C]">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {hasAction ? (
        <Button asChild className="mt-6 bg-[#1A355C] hover:bg-[#152a49]">
          <Link href={actionHref as string}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
