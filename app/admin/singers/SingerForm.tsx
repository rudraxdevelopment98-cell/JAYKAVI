'use client';

import { useState } from 'react';
import ImageUpload from '../_components/ImageUpload';

interface Singer {
  name: string;
  photoUrl: string | null;
  bio: string | null;
}

interface Props {
  initial?: Singer;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function SingerForm({ initial, action, submitLabel = 'Save' }: Props) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={labelCls}>Name</label>
        <input
          name="name"
          defaultValue={initial?.name ?? ''}
          required
          className={inputCls}
        />
      </div>

      <ImageUpload
        value={photoUrl}
        onChange={setPhotoUrl}
        folder="singers"
        label="Photo"
        aspectRatio="square"
      />
      <input type="hidden" name="photoUrl" value={photoUrl} />

      <div>
        <label className={labelCls}>Bio</label>
        <textarea
          name="bio"
          defaultValue={initial?.bio ?? ''}
          rows={4}
          className={inputCls}
        />
      </div>

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
