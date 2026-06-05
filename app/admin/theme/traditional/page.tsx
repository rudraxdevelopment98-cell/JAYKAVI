import Link from 'next/link';
import { getTraditionalSettings } from '@/lib/data';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { saveTraditionalSettings } from './actions';
import ImageField from './ImageField';
import VideoField from './VideoField';

export const dynamic = 'force-dynamic';

const inputCls = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
const labelCls = 'block text-xs font-medium text-neutral-400 mb-1';

export default async function TraditionalSettingsPage() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) redirect('/admin/login');

  const s = await getTraditionalSettings();

  const featureMeta = [
    { key: 'f1', icon: '🪷', hint: 'e.g. ભક્તિ / Bhakti' },
    { key: 'f2', icon: '🎵', hint: 'e.g. સંગીત / Sangeet' },
    { key: 'f3', icon: '🛕', hint: 'e.g. સંસ્કૃતિ / Sanskriti' },
    { key: 'f4', icon: '🙏', hint: 'e.g. સેવા / Seva' },
  ] as const;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/admin/theme" className="text-sm text-neutral-400 hover:text-neutral-200 transition">
          ← Site Theme
        </Link>
        <span className="text-neutral-700">/</span>
        <span className="text-sm text-neutral-300">Traditional Settings</span>
      </div>
      <h1 className="text-3xl font-semibold mb-1">🎨 Traditional Theme Settings</h1>
      <p className="text-sm text-neutral-400 mb-8">
        Customize text and images shown on the Traditional theme. Changes take effect immediately for all visitors.
      </p>

      <form action={saveTraditionalSettings} className="space-y-8">

        {/* ── Hero section ── */}
        <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-5">
          <h2 className="font-semibold text-base">Hero Section</h2>

          <div>
            <label className={labelCls}>Mantra / Greeting Line</label>
            <input
              name="mantra"
              defaultValue={s.mantra}
              className={inputCls}
              placeholder="॥ જય શ્રી કૃષ્ણ ॥"
            />
            <p className="text-xs text-neutral-500 mt-1">Displayed above the name in the hero.</p>
          </div>

          <ImageField
            name="heroPortrait"
            label="Singer Portrait (left arch)"
            defaultValue={s.heroPortrait}
            note="Displayed in the left ornamental arch in the hero. Ideal size: 400×533px portrait."
          />
          <ImageField
            name="heroDeity"
            label="Deity / Devotional Art (right arch)"
            defaultValue={s.heroDeity}
            note="Displayed in the right ornamental arch. Ideal size: 400×533px portrait."
          />
          <ImageField
            name="heroBg"
            label="Hero Background — Photo (optional)"
            defaultValue={s.heroBg}
            note="Full-bleed static background image. If a video is also set, the video takes priority."
          />
          <VideoField
            name="heroBgVideo"
            label="Hero Background — Video (optional)"
            defaultValue={s.heroBgVideo}
            note="Upload an MP4/WebM video for an animated background. Plays muted & looped with blur + gold gradient overlay."
          />
        </section>

        {/* ── Feature cards ── */}
        <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-5">
          <h2 className="font-semibold text-base">Feature Cards</h2>
          <p className="text-xs text-neutral-500">
            Four cards shown in the About section. Write titles in Gujarati for best effect.
          </p>

          {featureMeta.map((f, i) => (
            <div key={f.key} className="p-4 rounded-lg border border-neutral-800 space-y-3">
              <div className="text-sm font-medium text-neutral-300">{f.icon} Card {i + 1}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    name={`${f.key}title`}
                    defaultValue={s.features[i].title}
                    className={inputCls}
                    placeholder={f.hint.split('/')[0].trim()}
                  />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input
                    name={`${f.key}desc`}
                    defaultValue={s.features[i].desc}
                    className={inputCls}
                    placeholder="Short description"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
        >
          Save Traditional Settings
        </button>
      </form>
    </div>
  );
}
