import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FadeUp } from '@/components/Reveal';

export const dynamic = 'force-dynamic';

async function getPost(slug: string) {
  try {
    return await prisma.post.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post — JAYKAVI' };
  return {
    title: `${post.title} — JAYKAVI`,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post || !post.published) notFound();

  return (
    <article className="page-wrap" style={{ maxWidth: 760, margin: '0 auto' }}>
      <FadeUp>
        <Link href="/blog" className="text-muted" style={{ fontSize: '.85rem', textDecoration: 'none' }}>
          ← All posts
        </Link>
        <div className="text-muted" style={{ fontSize: '.8rem', letterSpacing: '.05em', margin: '24px 0 10px' }}>
          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: 28 }}>
          {post.title}
        </h1>
      </FadeUp>

      {post.coverUrl && (
        <FadeUp delay={0.1}>
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
            <img src={post.coverUrl} alt="" style={{ width: '100%', display: 'block' }} />
          </div>
        </FadeUp>
      )}

      <FadeUp delay={0.15}>
        <div
          style={{
            fontSize: '1.12rem',
            lineHeight: 1.85,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {post.content}
        </div>
      </FadeUp>
    </article>
  );
}
