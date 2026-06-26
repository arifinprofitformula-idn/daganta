'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteCategoryAction } from '@/app/dashboard/categories/actions';
import { Button } from '@/components/ui/button';

interface CategoryDeleteButtonProps {
  categoryId: string;
  productCount: number;
}

export function CategoryDeleteButton({ categoryId, productCount }: CategoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const message =
      productCount > 0
        ? 'Kategori ini masih memiliki produk dan tidak bisa dihapus. Tetap coba hapus?'
        : 'Hapus kategori ini?';

    if (!window.confirm(message)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);

      if (!result.success) {
        window.alert(result.error ?? 'Kategori gagal dihapus.');
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="destructive" disabled={isPending} onClick={handleDelete}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      Hapus
    </Button>
  );
}
