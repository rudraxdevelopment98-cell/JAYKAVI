'use client';

import { useState } from 'react';
import ImageUpload from '../_components/ImageUpload';

interface Post {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  published: boolean;
}

interface Props {
  initial?: Post;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function PostForm({ initial, action, submitLabel = 'Save' }: Props) {
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? '');

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={labelCls}>Title</label>
        <input name="title" defaultValue={initial?.title ?? ''} required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>URL slug (optional)</label>
        <input
          name="slug"
          defaultValue={initial?.slug ?? ''}
          className={inputCls}
          placeholder="auto-generated from the title if left blank"
        />
        <p className="text-xs text-neutral-500 mt-1">
          The web address will be /blog/<em>your-slug</em>.
        </p>
      </div>

      <ImageUpload
        value={coverUrl}
        onChange={setCoverUrl}
        folder="blog"
        label="Cover image"
        aspectRatio="video"
      />
      <input type="hidden" name="coverUrl" value={coverUrl} />

      <div>
        <label className={labelCls}>Short summary (optional)</label>
        <textarea
          name="excerpt"
          defaultValue={initial?.excerpt ?? ''}
          rows={2}
          className={inputCls}
          placeholder="A one or two line teaser shown on the blog list."
        />
      </div>

      <div>
        <label className={labelCls}>Content</label>
        <textarea
          name="content"
          defaultValue={initial?.content ?? ''}
          rows={16}
          className={`${inputCls} font-mono leading-relaxed`}
          placeholder="Write your update here. Press Enter twice to start a new paragraph."
        />
        <p className="text-xs text-neutral-500 mt-1">
          Line breaks and blank lines are preserved on the public page.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial?.published ?? false}
          className="accent-amber-500"
        />
        Published (visible to the public)
      </label>

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
