import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getHeroSettings } from '@/lib/data';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import HeroVariantPicker from './HeroVariantPicker';
import { saveHeroSettings } from './actions';
import ImageField from '../traditional/ImageField';
import VideoField from '../traditional/VideoField';

export const dynamic = 'force-dynamic';

const inputCls = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
const labelCls = 'block text-xs font-medium text-neutral-400 mb-1';

export default async function HeroSettingsPage() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) redirect('/admin/login');

  const settings = await getHeroSettings();

  return (
    <>
      <AdminPageHeader
        title="Hero Section"
        backHref="/admin/theme"
        backLabel="Site Theme"
        subtitle="Choose the layout style for the hero on the homepage. Only applies to the Default (Cinematic) theme."
      />
      <div className="max-w-2xl">
        <form action={saveHeroSettings} className="space-y-8">

          {/* ── Variant picker ── */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold">Layout Style</h2>
            <HeroVariantPicker current={settings.variant} />
          </section>

          {/* ── Media assets ── */}
          <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-5">
            <div>
              <h2 className="font-semibold text-base">Media Assets</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Set these once — switching between variants instantly uses the right asset.
              </p>
            </div>

            <ImageField
              name="portraitUrl"
              label="Artist Portrait Photo"
              defaultValue={settings.portraitUrl}
              note="Used in the Portrait variant (left panel). Tall portrait recommended, min 600 × 800 px."
            />

            <ImageField
              name="bgImageUrl"
              label="Fullscreen Background Image"
              defaultValue={settings.bgImageUrl}
              note="Background for the Fullscreen variant. Wide landscape, min 1920 × 1080 px."
            />

            <VideoField
              name="bgVideoUrl"
              label="Fullscreen Background Video"
              defaultValue={settings.bgVideoUrl}
              note="MP4/WebM for the Fullscreen variant. Plays muted & looped. Takes priority over background image."
            />
          </section>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
          >
            Save Hero Settings
          </button>
        </form>
      </div>
    </>
  );
}
