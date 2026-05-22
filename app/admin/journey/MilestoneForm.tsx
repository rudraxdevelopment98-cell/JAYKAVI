'use client';

import { useState } from 'react';
import ImageUpload from '../_components/ImageUpload';

interface Milestone {
  title: string;
  year: number | null;
  description: string;
  imageUrl: string | null;
  sortOrder?: number;
}

interface Props {
  initial?: Milestone;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  showSortOrder?: boolean;
}

export default function MilestoneForm({
  initial,
  action,
  submitLabel = 'Save',
  showSortOrder = false,
}: Props) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={labelCls}>Title</label>
        <input
          name="title"
          defaultValue={initial?.title ?? ''}
          required
          className={inputCls}
          placeholder="e.g. Born in Jangar, Amreli"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Year (optional)</label>
          <input
            name="year"
            type="number"
            defaultValue={initial?.year ?? ''}
            className={inputCls}
            placeholder="e.g. 2000"
          />
        </div>
        {showSortOrder && (
          <div>
            <label className={labelCls}>Sort order</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={initial?.sortOrder ?? 0}
              className={inputCls}
            />
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ''}
          rows={5}
          className={inputCls}
          required
        />
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        folder="journey"
        label="Image (optional)"
        aspectRatio="video"
      />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="pt-2">
        <button
          type="submit"
          className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
