'use client';

import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { createCategoryAction, updateCategoryAction } from '@/app/dashboard/categories/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CategoryDialogValue {
  id: string;
  name: string;
  slug: string;
}

interface CategoryDialogProps {
  category?: CategoryDialogValue;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryDialog({ category }: CategoryDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const slugEditedManually = useRef(Boolean(category));

  const isEdit = Boolean(category);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(category?.name ?? '');
    setSlug(category?.slug ?? '');
    setErrorMessage(null);
    slugEditedManually.current = Boolean(category);
  }, [category, isOpen]);

  useEffect(() => {
    if (slugEditedManually.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSlug(slugify(name));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [name]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const payload = {
      name,
      slug,
    };

    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(category.id, payload)
        : await createCategoryAction(payload);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Kategori gagal disimpan.');
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm" variant="outline">
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
            <DialogDescription>
              Slug otomatis dibuat dari nama, tetapi tetap bisa diedit manual.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-name">Nama Kategori</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Aksesoris Beladiri"
              required
              minLength={2}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              value={slug}
              onChange={(event) => {
                slugEditedManually.current = true;
                setSlug(slugify(event.target.value));
              }}
              placeholder="aksesoris-beladiri"
              required
              minLength={2}
              maxLength={140}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
