import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSingerByParam, getSongsBySingerDbId } from '@/lib/data';
import SongCard from '@/components/SongCard';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const singer = await getSingerByParam(params.id);
  if (!singer) return { title: 'Singer not found' };
  const desc = singer.bio
    ? singer.bio.slice(0, 155)
    : `Browse all songs performed by ${singer.name} — written by JAYKAVI, Gujarati lyricist Jayesh Prajapati.`;
  return {
    title: `${singer.name} — Songs`,
    description: desc,
    keywords: [singer.name, 'JAYKAVI', 'Jayesh Prajapati', 'Gujarati songs', 'singer'],
    alternates: { canonical: absoluteUrl(`/singers/${params.id}`) },
    openGraph: {
      title: singer.name,
      description: desc,
      ...(singer.photoUrl ? { images: [singer.photoUrl] } : {}),
    },
  };
}

export default async function SingerPage({ params }: { params: { id: string } }) {
  const singer = await getSingerByParam(params.id);
  if (!singer) notFound();

  const songs = await getSongsBySingerDbId(singer.id);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Singers', item: absoluteUrl('/singers') },
      { '@type': 'ListItem', position: 3, name: singer.name, item: absoluteUrl(`/singers/${params.id}`) },
    ],
  };

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: singer.name,
    ...(singer.photoUrl ? { image: singer.photoUrl } : {}),
    ...(singer.bio ? { description: singer.bio } : {}),
    url: absoluteUrl(`/singers/${params.id}`),
  };

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={personLd} />

      {/* Hero */}
      <div style={{
        padding: 'clamp(100px,14vh,160px) clamp(20px,6vw,96px) clamp(40px,5vh,70px)',
        background: singer.photoUrl
          ? `linear-gradient(to bottom, rgba(10,10,11,.5) 0%, rgba(10,10,11,.92) 75%, var(--bg) 100%), url(${singer.photoUrl}) center/cover no-repeat`
          : 'var(--hero-grad)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 32,
        flexWrap: 'wrap',
      }}>
        <div>
          <Link href="/singers" className="text-muted" style={{ textDecoration: 'none', fontSize: '.85rem' }}>← All singers</Link>
          <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.72rem', fontWeight: 600, marginTop: 18 }}>Singer</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem,7vw,5.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.05, margin: '10px 0 14px', letterSpacing: '-.02em' }}>
            {singer.name}
          </h1>
          {singer.bio && (
            <p className="text-muted" style={{ fontSize: 'clamp(.95rem,1.5vw,1.1rem)', maxWidth: '52ch', lineHeight: 1.7, margin: '0 0 14px' }}>
              {singer.bio}
            </p>
          )}
          <p className="text-muted" style={{ fontSize: '.85rem' }}>
            {songs.length} song{songs.length !== 1 ? 's' : ''} with JAYKAVI
          </p>
        </div>
      </div>

      {/* Songs grid */}
      <div className="page-wrap" style={{ paddingTop: 40 }}>
        {songs.length === 0 ? (
          <p className="text-muted">No songs found for this singer.</p>
        ) : (
          <div className="songs-grid">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
