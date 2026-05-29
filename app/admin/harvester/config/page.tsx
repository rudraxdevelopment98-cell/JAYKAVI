import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { saveHarvestConfig } from '../actions';

export const dynamic = 'force-dynamic';

const DEFAULT_SEARCH_TERMS = ['JAYKAVI', 'Jayesh Prajapati lyrics', 'જયકવિ', 'જયેશ પ્રજાપતિ'];
const DEFAULT_CREDIT = ['jaykavi', 'jayesh prajapati', 'જયકવિ', 'જયેશ પ્રજાપતિ'];
const DEFAULT_SINGERS = [
  'Geeta Rabari', 'Kinjal Dave', 'Birju Barot',
  'Yogita Patel', 'Alpa Patel', 'Jigrra', 'Aishwarya Majmudar',
];

export default async function HarvestConfigPage() {
  const cfg = await prisma.harvestConfig.findFirst({ where: { id: 1 } });

  const inputCls = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/harvester" className="text-sm text-neutral-400 hover:text-white">
          ← Harvester
        </Link>
        <h1 className="text-3xl font-semibold">Harvest Config</h1>
      </div>

      <p className="text-neutral-400 mb-6 text-sm">
        All settings are saved here and used on every harvest run. No coding needed.
      </p>

      <form action={saveHarvestConfig} className="space-y-6">
        <div>
          <label className={labelCls}>Own YouTube channels (one per line)</label>
          <textarea
            name="ownChannels"
            rows={3}
            defaultValue={(cfg?.ownChannels ?? []).join('\n')}
            className={inputCls}
            placeholder={"https://www.youtube.com/@jaykavi_official\nUCxxxxxxxxxxxxxxxxxxxxxx"}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Every video from these channels is checked. Paste full URLs or channel IDs (UC…).
          </p>
        </div>

        <div>
          <label className={labelCls}>Search channels (one per line)</label>
          <textarea
            name="searchChannels"
            rows={4}
            defaultValue={(cfg?.searchChannels ?? []).join('\n')}
            className={inputCls}
            placeholder={"https://www.youtube.com/@SomeMusicChannel\nUCxxxxxxxxxxxxxxxxxxxxxx"}
          />
          <p className="text-xs text-neutral-500 mt-1">
            These are <strong>third-party channels</strong> (record labels, music companies, fan pages) that publish
            JAYKAVI songs. The harvester will scan their uploads and keep only videos that pass the
            "Credit must contain" filter — so you still get only JAYKAVI-credited songs.
          </p>
        </div>

        <div>
          <label className={labelCls}>Search terms (one per line)</label>
          <textarea
            name="searchTerms"
            rows={6}
            defaultValue={(cfg?.searchTerms ?? DEFAULT_SEARCH_TERMS).join('\n')}
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Each term is searched on YouTube. Results are then filtered by the credit strings below.
          </p>
        </div>

        <div>
          <label className={labelCls}>Credit must contain (one per line, case-insensitive)</label>
          <textarea
            name="creditMustContain"
            rows={5}
            defaultValue={(cfg?.creditMustContain ?? DEFAULT_CREDIT).join('\n')}
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1">
            A video is accepted <strong>only</strong> if its title or description contains at least one of these strings.
            This ensures only songs actually credited to JAYKAVI are added.
          </p>
        </div>

        <div>
          <label className={labelCls}>Known singers (one per line)</label>
          <textarea
            name="knownSingers"
            rows={8}
            defaultValue={(cfg?.knownSingers ?? DEFAULT_SINGERS).join('\n')}
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Used to auto-detect the performing singer from the video title. Add more as JAYKAVI works
            with new artists.
          </p>
        </div>

        <div>
          <label className={labelCls}>Max results per search term</label>
          <input
            name="maxResultsPerTerm"
            type="number"
            min={10}
            max={500}
            defaultValue={cfg?.maxResultsPerTerm ?? 100}
            className={`${inputCls} max-w-xs`}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Higher = broader coverage, more YouTube API quota used. Free quota: 10,000 units/day.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
          >
            Save config
          </button>
        </div>
      </form>
    </div>
  );
}
