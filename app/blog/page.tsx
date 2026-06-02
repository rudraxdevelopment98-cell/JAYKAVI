import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FadeUp } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Blog — JAYKAVI',
  description: 'Updates, stories and news from JAYKAVI.',
};

export const dynamic = 'force-dynamic';

async function getPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="page-wrap page-wrap-mid">
      <FadeUp>
        <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>
          Updates
        </p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 600, margin: '12px 0 36px' }}>
          Blog & news
        </h1>
      </FadeUp>

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet. Check back soon.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 28 }}>
          {posts.map((p, i) => (
            <FadeUp key={p.id} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/blog/${p.slug}`}
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                <article
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'var(--panel)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {p.coverUrl && (
                    <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                      <img src={p.coverUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="text-muted" style={{ fontSize: '.78rem', letterSpacing: '.05em', marginBottom: 8 }}>
                      {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                    <h2 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="text-muted" style={{ fontSize: '.95rem', lineHeight: 1.6 }}>
                        {p.excerpt}
                      </p>
                    )}
                    <span className="accent" style={{ marginTop: 'auto', paddingTop: 14, fontSize: '.85rem', fontWeight: 600 }}>
                      Read more →
                    </span>
                  </div>
                </article>
              </Link>
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}
