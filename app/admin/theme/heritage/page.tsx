import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHeritageSettings } from '@/lib/data';
import { saveHeritageSettings } from './actions';
import HeritageForm from './HeritageForm';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function HeritageSettingsPage() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) redirect('/admin/login');

  const settings = await getHeritageSettings();

  return (
    <>
      <AdminPageHeader
        title="📜 Heritage Library Settings"
        backHref="/admin/theme"
        backLabel="Site Theme"
        subtitle="Configure every part of the Heritage Library homepage — hero banner, sections, gallery and events. Changes take effect immediately for all visitors."
      />
      <div className="max-w-2xl">
        <HeritageForm settings={settings} action={saveHeritageSettings} />
      </div>
    </>
  );
}
