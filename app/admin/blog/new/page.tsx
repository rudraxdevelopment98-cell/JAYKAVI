import PostForm from '../PostForm';
import { createPost } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export default function NewPostPage() {
  return (
    <>
      <AdminPageHeader title="New Post" backHref="/admin/blog" backLabel="Blog" />
      <div className="max-w-2xl">
        <PostForm action={createPost} submitLabel="Create post" />
      </div>
    </>
  );
}
