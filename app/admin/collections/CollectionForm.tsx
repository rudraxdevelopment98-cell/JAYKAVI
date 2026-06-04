'use client';

import { useState, useTransition } from 'react';
import ImageUpload from '../_components/ImageUpload';

interface Collection {
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  year: number | null;
}

interface Props {
  initial?: Collection;
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel?: string;
}

export default function CollectionForm({ initial, action, submitLabel = 'Save' }: Props) {
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? '');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-800 bg-red-950/40 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Title</label>
        <input
          name="title"
          defaultValue={initial?.title ?? ''}
          required
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Slug (URL)</label>
          <input
            name="slug"
            defaultValue={initial?.slug ?? ''}
            placeholder="auto-generated from title"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Year</label>
          <input
            name="year"
            type="number"
            defaultValue={initial?.year ?? ''}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ''}
          rows={4}
          className={inputCls}
        />
      </div>

      <ImageUpload
        value={coverUrl}
        onChange={setCoverUrl}
        folder="songs"
        label="Cover image"
        aspectRatio="square"
      />
      <input type="hidden" name="coverUrl" value={coverUrl} />

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
