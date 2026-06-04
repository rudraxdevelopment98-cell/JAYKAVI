import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSongsByCollection } from '@/lib/data';
import SongCard from '@/components/SongCard';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function getCollection(slug: string) {
  return prisma.collection.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCollection(params.slug);
  if (!c) return { title: 'Collection not found' };
  const desc = c.description || `Browse all ${c.title} songs written by JAYKAVI — Gujarati lyricist Jayesh Prajapati.`;
  return {
    title: `${c.title} — Collection`,
    description: desc,
    keywords: [c.title, 'JAYKAVI', 'Jayesh Prajapati', 'Gujarati songs', 'ગુજરાતી ગીત'],
    alternates: { canonical: absoluteUrl(`/collections/${c.slug}`) },
    openGraph: {
      title: c.title,
      description: desc,
      ...(c.coverUrl ? { images: [c.coverUrl] } : {}),
    },
  };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollection(params.slug);
  if (!collection) notFound();

  const songs = await getSongsByCollection(collection.id);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: absoluteUrl('/collections') },
      { '@type': 'ListItem', position: 3, name: collection.title, item: absoluteUrl(`/collections/${collection.slug}`) },
    ],
  };

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <JsonLd data={breadcrumbLd} />

      {/* Hero */}
      <div style={{
        padding: 'clamp(100px,14vh,160px) clamp(20px,6vw,96px) clamp(40px,5vh,70px)',
        background: collection.coverUrl
          ? `linear-gradient(to bottom, rgba(10,10,11,.55) 0%, rgba(10,10,11,.92) 75%, var(--bg) 100%), url(${collection.coverUrl}) center/cover no-repeat`
          : 'var(--hero-grad)',
      }}>
        <Link href="/collections" className="text-muted" style={{ textDecoration: 'none', fontSize: '.85rem' }}>← All collections</Link>
        <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.72rem', fontWeight: 600, marginTop: 18 }}>Collection</p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem,7vw,5.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.05, margin: '10px 0 14px', letterSpacing: '-.02em' }}>
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-muted" style={{ fontSize: 'clamp(.95rem,1.5vw,1.1rem)', maxWidth: '50ch', lineHeight: 1.7 }}>
            {collection.description}
          </p>
        )}
        <p className="text-muted" style={{ marginTop: 14, fontSize: '.85rem' }}>
          {songs.length} song{songs.length !== 1 ? 's' : ''}
          {collection.year ? ` · ${collection.year}` : ''}
        </p>
      </div>

      {/* Songs grid */}
      <div className="page-wrap" style={{ paddingTop: 40 }}>
        {songs.length === 0 ? (
          <p className="text-muted">No songs in this collection yet.</p>
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
