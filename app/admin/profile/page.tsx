import { prisma } from '@/lib/prisma';
import { saveProfile } from './actions';

export const dynamic = 'force-dynamic';

async function getProfile() {
  const existing = await prisma.lyricist.findFirst({ where: { id: 1 } });
  if (existing) return existing;
  return {
    id: 1,
    name: '',
    penName: '',
    displayName: '',
    creditVariants: [] as string[],
    title: '',
    tagline: '',
    bornPlace: '',
    basedIn: '',
    birthDate: '',
    languages: [] as string[],
    genres: [] as string[],
    careerStartYear: null as number | null,
    songsWritten: '',
    songsPublishedOnStreaming: '',
    bio: '',
    philosophy: '',
    awards: [] as string[],
    press: [] as string[],
    updatedAt: new Date(),
  };
}

export default async function ProfilePage() {
  const p = await getProfile();

  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';
  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold mb-2">Artist Profile</h1>
      <p className="text-neutral-400 mb-8">
        Core information shown across the site — hero, about page, footer credits.
      </p>

      <form action={saveProfile} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Real Name</label>
            <input name="name" defaultValue={p.name} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Pen Name</label>
            <input name="penName" defaultValue={p.penName ?? ''} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Display Name (used in headers)</label>
          <input name="displayName" defaultValue={p.displayName ?? ''} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Title / Role</label>
          <input
            name="title"
            defaultValue={p.title ?? ''}
            placeholder="e.g. Lok Sahityakar • Song Writer • Lyricist"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Tagline</label>
          <input
            name="tagline"
            defaultValue={p.tagline}
            required
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Born In</label>
            <input
              name="bornPlace"
              defaultValue={p.bornPlace ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Based In</label>
            <input name="basedIn" defaultValue={p.basedIn ?? ''} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Birth Date (YYYY-MM-DD)</label>
            <input
              name="birthDate"
              defaultValue={p.birthDate ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Career Start Year</label>
            <input
              name="careerStartYear"
              type="number"
              defaultValue={p.careerStartYear ?? ''}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Languages (comma separated)</label>
          <input
            name="languages"
            defaultValue={p.languages.join(', ')}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Genres (comma separated)</label>
          <input
            name="genres"
            defaultValue={p.genres.join(', ')}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Credit Variants (comma separated)</label>
          <input
            name="creditVariants"
            defaultValue={p.creditVariants.join(', ')}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Songs Written (display)</label>
            <input
              name="songsWritten"
              defaultValue={p.songsWritten ?? ''}
              placeholder="e.g. 1400+"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Songs Published on Streaming</label>
            <input
              name="songsPublishedOnStreaming"
              defaultValue={p.songsPublishedOnStreaming ?? ''}
              placeholder="e.g. 700+"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Bio</label>
          <textarea
            name="bio"
            defaultValue={p.bio}
            required
            rows={8}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Philosophy</label>
          <textarea
            name="philosophy"
            defaultValue={p.philosophy ?? ''}
            rows={3}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Awards (one per line)</label>
          <textarea
            name="awards"
            defaultValue={p.awards.join('\n')}
            rows={3}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Press Mentions (one per line)</label>
          <textarea
            name="press"
            defaultValue={p.press.join('\n')}
            rows={3}
            className={inputCls}
          />
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
          >
            Save profile
          </button>
          <span className="text-xs text-neutral-500">
            Last updated {new Date(p.updatedAt).toLocaleString()}
          </span>
        </div>
      </form>
    </div>
  );
}
