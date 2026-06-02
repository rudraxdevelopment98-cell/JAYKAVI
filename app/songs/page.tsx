import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllSongs, getFacets } from '@/lib/data';
import SongArchive from '@/components/SongArchive';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Songs — JAYKAVI', description: 'The complete archive of songs written by JAYKAVI.' };

export default async function SongsPage() {
  const [songs, facets] = await Promise.all([getAllSongs(), getFacets()]);

  return (
    <div className="page-wrap">
      <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>The Archive</p>
      <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 600, margin: '12px 0 36px' }}>
        Every song, in one place
      </h1>
      <Suspense fallback={<p className="text-muted">Loading songs…</p>}>
        <SongArchive songs={songs} facets={facets} />
      </Suspense>
    </div>
  );
}
