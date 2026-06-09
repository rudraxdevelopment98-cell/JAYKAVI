import { prisma } from '@/lib/prisma';
import { saveHarvestConfig } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

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
    <>
      <AdminPageHeader title="Harvest Config" backHref="/admin/harvester" backLabel="Harvester" />
      <div className="max-w-2xl">

      {/* How the filter works */}
      <div className="mb-8 p-4 border border-amber-800/40 bg-amber-950/20 rounded-xl text-sm text-neutral-300 space-y-2">
        <p className="font-semibold text-amber-400">How the filter works</p>
        <p>Every video found via search terms or third-party channels goes through a <strong>confidence score</strong> before it reaches your candidate list:</p>
        <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
          <li><span className="text-green-400 font-medium">+6 pts</span> — lyricist name found in the video <strong>title</strong> (strongest signal)</li>
          <li><span className="text-green-400 font-medium">+5 pts</span> — description has a credit line like <code className="text-amber-300">Lyrics : JAYKAVI</code> or <code className="text-amber-300">ગીત : જયકવિ</code></li>
          <li><span className="text-yellow-400 font-medium">+3 pts</span> — description line contains the name near a lyrics/written-by keyword</li>
          <li><span className="text-neutral-400 font-medium">+1 pt</span> — name found anywhere in description (not in a #hashtag line)</li>
          <li><span className="text-red-400 font-medium">Rejected</span> — title contains jukebox / nonstop / mashup / collection / top-10 etc.</li>
        </ul>
        <p className="text-xs text-neutral-500">A video needs <strong>score ≥ 5</strong> to be accepted. This means it must have the name in the title, OR a clearly formatted lyricist credit line. Hashtag-only mentions are ignored.</p>
        <p className="text-xs text-neutral-500">Videos from <strong>Own channels</strong> bypass the filter entirely — they are always trusted.</p>
      </div>

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
            These are <strong>JAYKAVI&apos;s own channels</strong>. Every video from here is trusted and added as a candidate automatically — no filter applied.
          </p>
        </div>

        <div>
          <label className={labelCls}>Search channels (one per line)</label>
          <textarea
            name="searchChannels"
            rows={4}
            defaultValue={((cfg as any)?.searchChannels ?? []).join('\n')}
            className={inputCls}
            placeholder={"https://www.youtube.com/@SomeMusicLabel\nUCxxxxxxxxxxxxxxxxxxxxxx"}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Third-party labels or fan channels that publish JAYKAVI songs. Their uploads are scanned but every video must pass the confidence filter before appearing as a candidate.
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
            YouTube is searched for each term (Music category only). Results then go through the confidence filter. Keep terms specific — <code className="text-amber-300">JAYKAVI lyrics</code> is better than just <code className="text-amber-300">Gujarati songs</code>.
          </p>
        </div>

        <div>
          <label className={labelCls}>Credit keywords — name / aliases (one per line, case-insensitive)</label>
          <textarea
            name="creditMustContain"
            rows={5}
            defaultValue={(cfg?.creditMustContain ?? DEFAULT_CREDIT).join('\n')}
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1">
            The exact strings the filter looks for in titles and description credit lines. Include all known name variants and Gujarati script versions. Do <strong>not</strong> put generic words here — only the lyricist&apos;s name/aliases.
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
            Used to auto-detect the performing singer from the video title. Does not affect filtering — it only pre-fills the &quot;Singer&quot; field when you approve a candidate.
          </p>
        </div>

        <div>
          <label className={labelCls}>Max results per search term</label>
          <input
            name="maxResultsPerTerm"
            type="number"
            min={10}
            max={500}
            defaultValue={cfg?.maxResultsPerTerm ?? 50}
            className={`${inputCls} max-w-xs`}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Higher = broader coverage, more YouTube API quota used. Each search costs ~100 quota units. Free quota: 10,000 units/day. Recommended: 50–100.
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
    </>
  );
}
