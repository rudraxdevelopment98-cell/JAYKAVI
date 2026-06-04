import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Browse JAYKAVI songs by collection — Bhajan, Lok Geet, Garba, Lagna Geet and more.',
  alternates: { canonical: absoluteUrl('/collections') },
};

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
    include: { _count: { select: { songs: true } } },
  });

  return (
    <div className="page-wrap">
      <div style={{ marginBottom: 48 }}>
        <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.72rem', fontWeight: 600 }}>Browse</p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)', fontWeight: 300, lineHeight: 1.1, margin: '12px 0 10px', letterSpacing: '-.02em' }}>Collections</h1>
        <p className="text-muted" style={{ fontSize: '1rem' }}>Songs grouped by genre, album and occasion.</p>
      </div>

      {collections.length === 0 ? (
        <p className="text-muted">No collections yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="glass"
              style={{ textDecoration: 'none', borderRadius: 18, overflow: 'hidden', display: 'block', transition: 'transform .25s, box-shadow .25s' }}
            >
              {/* Cover */}
              <div style={{
                height: 160,
                background: c.coverUrl
                  ? `url(${c.coverUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg,var(--panel-solid),var(--bg))',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)',
                }} />
                <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18 }}>
                  <div className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 400, color: '#fff', fontStyle: 'italic', lineHeight: 1.2 }}>{c.title}</div>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '14px 18px 16px' }}>
                {c.description && (
                  <p className="text-muted" style={{ fontSize: '.85rem', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="accent" style={{ fontSize: '.8rem', fontWeight: 600 }}>
                    {c._count.songs} song{c._count.songs !== 1 ? 's' : ''}
                  </span>
                  {c.year && <span className="text-muted" style={{ fontSize: '.78rem' }}>{c.year}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
