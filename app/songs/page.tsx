import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllSongs, getFacets, getActiveTheme } from '@/lib/data';
import SongArchive from '@/components/SongArchive';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Songs — JAYKAVI', description: 'The complete archive of songs written by JAYKAVI.' };

export default async function SongsPage() {
  const [songs, facets, activeTheme] = await Promise.all([getAllSongs(), getFacets(), getActiveTheme()]);
  const traditional = activeTheme === 'traditional';

  return (
    <div className="page-wrap">
      {traditional ? (
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span className="trad-eyebrow">Bhajans Collection</span>
          <h1 className="font-serif trad-gold-text" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 700, margin: '8px 0 0' }}>
            ગુજરાતી ભજન સંગ્રહ
          </h1>
          <div className="trad-divider" style={{ justifyContent: 'center' }}>❖</div>
          <p className="text-muted" style={{ fontSize: '.98rem', maxWidth: 520, margin: '0 auto' }}>
            Every bhajan and song written by JAYKAVI — search, filter, and listen.
          </p>
        </div>
      ) : (
        <>
          <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>The Archive</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 600, margin: '12px 0 36px' }}>
            Every song, in one place
          </h1>
        </>
      )}
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <SongArchive songs={songs} facets={facets} />
      </Suspense>
    </div>
  );
}
