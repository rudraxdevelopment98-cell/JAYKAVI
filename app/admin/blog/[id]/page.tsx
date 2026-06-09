import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostForm from '../PostForm';
import DeleteButton from '../../_components/DeleteButton';
import { updatePost, deletePost } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <>
      <AdminPageHeader
        title={post.title}
        backHref="/admin/blog"
        backLabel="Blog"
        actions={post.published ? (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="text-sm text-neutral-400 hover:text-white"
          >
            View on site ↗
          </Link>
        ) : undefined}
      />
      <div className="max-w-2xl">
      <PostForm
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverUrl: post.coverUrl,
          published: post.published,
        }}
        action={updatePost.bind(null, post.id)}
        submitLabel="Save changes"
      />

      <div className="mt-8 pt-6 border-t border-neutral-800">
        <DeleteButton
          onConfirm={async () => {
            'use server';
            await deletePost(post.id);
          }}
          label="Delete post"
          confirmText={`Delete "${post.title}"?`}
        />
      </div>
      </div>
    </>
  );
}
