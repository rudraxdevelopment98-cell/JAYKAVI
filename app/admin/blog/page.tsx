import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  const posts = await prisma.post.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Blog</h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {posts.length} post{posts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="shrink-0 px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition text-sm"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No posts yet. Write your first update.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/admin/blog/${p.id}`}
              className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
            >
              <div className="w-20 h-14 rounded-md bg-neutral-800 flex-shrink-0 overflow-hidden">
                {p.coverUrl && (
                  <img src={p.coverUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {p.published ? (
                    <span className="text-green-400">● Published</span>
                  ) : (
                    <span className="text-neutral-500">○ Draft</span>
                  )}
                  <span className="ml-2">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
