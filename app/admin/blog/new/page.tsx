import Link from 'next/link';
import PostForm from '../PostForm';
import { createPost } from '../actions';

export default function NewPostPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/blog" className="text-sm text-neutral-400 hover:text-white">
          ← Blog
        </Link>
        <h1 className="text-3xl font-semibold">New Post</h1>
      </div>
      <PostForm action={createPost} submitLabel="Create post" />
    </div>
  );
}
