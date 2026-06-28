'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Repeat2 } from 'lucide-react';
import { transferOwnershipAction } from '@/app/agent/clients/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransferOwnershipDialogProps {
  agentClientId: string;
  tenantName: string;
  disabled?: boolean;
}

export function TransferOwnershipDialog({
  agentClientId,
  tenantName,
  disabled = false,
}: TransferOwnershipDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set('agentClientId', agentClientId);

    startTransition(async () => {
      const result = await transferOwnershipAction(formData);

      if (!result.success) {
        setError(result.error ?? 'Transfer kepemilikan gagal.');
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={disabled}>
          <Repeat2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Kepemilikan Toko</DialogTitle>
          <DialogDescription>
            Setelah transfer, toko ini tidak lagi dikelola Anda. Pastikan email pemilik baru sudah terdaftar di sistem.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Ketik nama toko <span className="font-black">{tenantName}</span> untuk mengonfirmasi transfer.
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ownerEmail-${agentClientId}`}>Email pemilik baru</Label>
            <Input id={`ownerEmail-${agentClientId}`} name="ownerEmail" type="email" required placeholder="owner@email.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`confirmation-${agentClientId}`}>Konfirmasi nama toko</Label>
            <Input id={`confirmation-${agentClientId}`} name="confirmation" required placeholder={tenantName} />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Memproses...' : 'Transfer Kepemilikan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
