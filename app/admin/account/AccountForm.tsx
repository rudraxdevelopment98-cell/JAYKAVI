'use client';

import { useState } from 'react';
import ImageField from '../theme/traditional/ImageField';

interface Profile {
  email: string;
  name: string;
  role: string;
  title: string;
  phone: string;
  photoUrl: string;
  bio: string;
}

const inputCls = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
const labelCls = 'block text-xs font-medium text-neutral-400 mb-1';

export default function AccountForm({
  profile,
  permissions,
  action,
}: {
  profile: Profile;
  permissions: string[];
  action: (formData: FormData) => Promise<{ ok?: boolean; error?: string }>;
}) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setMsg(null);
    const res = await action(formData);
    setSaving(false);
    if (res?.ok) setMsg({ ok: true, text: 'Profile saved.' });
    else setMsg({ ok: false, text: res?.error ?? 'Could not save.' });
  }

  const isOwner = permissions.includes('all');

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Read-only identity */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
        <div className="flex items-center gap-4">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-neutral-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-800 grid place-items-center text-2xl text-neutral-500">
              {(profile.name || profile.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{profile.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full">
              {isOwner ? 'Owner · full access' : profile.role}
            </span>
          </div>
        </div>
      </section>

      {/* Editable fields */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-5">
        <ImageField name="photoUrl" label="Profile Photo" defaultValue={profile.photoUrl}
          note="Square image works best — shown as a circle." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Display Name</label>
            <input name="name" defaultValue={profile.name} className={inputCls} placeholder="Your name" />
          </div>
          <div>
            <label className={labelCls}>Title / Designation</label>
            <input name="title" defaultValue={profile.title} className={inputCls} placeholder="e.g. Content Manager" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Phone (optional)</label>
          <input name="phone" defaultValue={profile.phone} className={inputCls} placeholder="+91 …" />
        </div>

        <div>
          <label className={labelCls}>About / Bio (optional)</label>
          <textarea name="bio" defaultValue={profile.bio} rows={4} className={inputCls}
            placeholder="A short note about you and your role." />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold text-sm transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</span>
        )}
      </div>
    </form>
  );
}
