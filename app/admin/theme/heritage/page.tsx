import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHeritageSettings } from '@/lib/data';
import { saveHeritageSettings } from './actions';
import HeritageForm from './HeritageForm';

export const dynamic = 'force-dynamic';

export default async function HeritageSettingsPage() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) redirect('/admin/login');

  const settings = await getHeritageSettings();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <Link href="/admin/theme" className="text-sm text-neutral-400 hover:text-neutral-200 transition">
          ← Site Theme
        </Link>
        <span className="text-neutral-700">/</span>
        <span className="text-sm text-neutral-300">Heritage Library Settings</span>
      </div>
      <h1 className="text-3xl font-semibold mb-1">📜 Heritage Library Settings</h1>
      <p className="text-sm text-neutral-400 mb-8">
        Configure every part of the Heritage Library homepage — hero banner, sections, gallery and events.
        Changes take effect immediately for all visitors.
      </p>

      <HeritageForm settings={settings} action={saveHeritageSettings} />
    </div>
  );
}
