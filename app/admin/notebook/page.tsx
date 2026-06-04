import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import NotebookSidebar from './NotebookSidebar';
import NewNoteButton from './NewNoteButton';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const dynamic = 'force-dynamic';

export default async function NotebookPage({
  searchParams,
}: {
  searchParams: { folder?: string; filter?: string };
}) {
  const { folder: folderId, filter } = searchParams;

  const [folders, notes] = await Promise.all([
    prisma.noteFolder.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.note.findMany({
      where:
        folderId
          ? { folderId }
          : filter === 'published'
          ? { published: true }
          : filter === 'drafts'
          ? { published: false }
          : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { folder: { select: { title: true } } },
    }),
  ]);

  const activeLabel =
    folderId
      ? (folders.find((f) => f.id === folderId)?.title ?? 'Folder')
      : filter === 'published'
      ? 'Published'
      : filter === 'drafts'
      ? 'Drafts'
      : 'All Notes';

  return (
    <div className="flex gap-0 -m-8 min-h-[calc(100vh-5rem)]">
      <NotebookSidebar
        folders={folders}
        activeFolderId={folderId}
        activeFilter={filter}
        noteCounts={{
          all: await prisma.note.count(),
          published: await prisma.note.count({ where: { published: true } }),
          drafts: await prisma.note.count({ where: { published: false } }),
        }}
      />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{activeLabel}</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
          <NewNoteButton folderId={folderId} />
        </div>
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <p className="text-sm">No notes yet. Create your first one.</p>
            <NewNoteButton folderId={folderId} label="Write a note" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link key={note.id} href={`/admin/notebook/${note.id}`} className="group block p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-600 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-white transition">{note.title}</h3>
                  <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${ note.published ? 'bg-green-900/60 text-green-300' : 'bg-neutral-800 text-neutral-400' }`}>
                    {note.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {note.content && (
                  <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed mb-3">{stripHtml(note.content)}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  {note.folder && <span className="text-amber-600/80">📁 {note.folder.title}</span>}
                  <span className="ml-auto">{new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
