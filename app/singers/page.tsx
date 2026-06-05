import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Singers',
  description: 'Singers who have performed JAYKAVI songs — browse by artist and discover their songs.',
  alternates: { canonical: absoluteUrl('/singers') },
};

export default async function SingersPage() {
  const singers = await prisma.singer.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { songs: true } } },
  });

  // Only show singers who have at least one song
  const active = singers.filter((s) => s._count.songs > 0);

  return (
    <div className="page-wrap">
      <div style={{ marginBottom: 48 }}>
        <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.72rem', fontWeight: 600 }}>Browse</p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)', fontWeight: 300, lineHeight: 1.1, margin: '12px 0 10px', letterSpacing: '-.02em' }}>Singers</h1>
        <p className="text-muted" style={{ fontSize: '1rem' }}>Artists who have performed songs written by JAYKAVI.</p>
      </div>

      {active.length === 0 ? (
        <p className="text-muted">No singers yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
          {active.map((s) => {
            const param = s.legacyId ?? s.id;
            return (
              <Link
                key={s.id}
                href={`/singers/${param}`}
                className="glass"
                style={{ textDecoration: 'none', borderRadius: 18, overflow: 'hidden', display: 'block' }}
              >
                {/* Photo */}
                <div style={{
                  height: 180,
                  background: s.photoUrl
                    ? `url(${s.photoUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg,var(--panel-solid),var(--bg))',
                  display: 'flex', alignItems: 'flex-end',
                  position: 'relative',
                }}>
                  {!s.photoUrl && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem', opacity: .25 }}>🎤</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%)' }} />
                  <div style={{ position: 'relative', padding: '0 16px 14px' }}>
                    <div className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 400, color: '#fff', lineHeight: 1.2 }}>{s.name}</div>
                  </div>
                </div>
                {/* Count */}
                <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="accent" style={{ fontSize: '.8rem', fontWeight: 600 }}>
                    {s._count.songs} song{s._count.songs !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: '.78rem', opacity: .5 }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
