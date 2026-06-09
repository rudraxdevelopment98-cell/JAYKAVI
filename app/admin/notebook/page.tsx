import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import NotebookSidebar from './NotebookSidebar';
import NewNoteButton from './NewNoteButton';
import { togglePinNote } from './actions';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const dynamic = 'force-dynamic';

export default async function NotebookPage({
  searchParams,
}: {
  searchParams: { folder?: string; filter?: string; q?: string; tag?: string };
}) {
  const { folder: folderId, filter, tag } = searchParams;
  const q = (searchParams.q ?? '').trim();

  let folders: any[] = [];
  let notes: any[] = [];
  let noteCounts = { all: 0, published: 0, drafts: 0 };
  let allTags: string[] = [];
  let dbError = false;

  try {
    const and: any[] = [];
    if (folderId) and.push({ folderId });
    else if (filter === 'published') and.push({ published: true });
    else if (filter === 'drafts') and.push({ published: false });
    if (tag) and.push({ tags: { has: tag } });
    if (q) and.push({ OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ] });

    [folders, notes, noteCounts] = await Promise.all([
      prisma.noteFolder.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.note.findMany({
        where: and.length ? { AND: and } : undefined,
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
        include: { folder: { select: { title: true } } },
      }),
      Promise.all([
        prisma.note.count(),
        prisma.note.count({ where: { published: true } }),
        prisma.note.count({ where: { published: false } }),
      ]).then(([all, published, drafts]) => ({ all, published, drafts })),
    ]);

    const tagSet = new Set<string>();
    for (const n of await prisma.note.findMany({ select: { tags: true } })) {
      for (const t of n.tags) tagSet.add(t);
    }
    allTags = Array.from(tagSet).sort();
  } catch {
    dbError = true;
  }

  const activeLabel =
    q ? `Search “${q}”`
    : tag ? `#${tag}`
    : folderId ? (folders.find((f) => f.id === folderId)?.title ?? 'Folder')
    : filter === 'published' ? 'Published'
    : filter === 'drafts' ? 'Drafts'
    : 'All Notes';

  if (dbError) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-yellow-950/40 border border-yellow-800 rounded-xl text-center">
        <p className="text-yellow-300 font-medium mb-2">Database not ready</p>
        <p className="text-yellow-400/70 text-sm">
          The Notebook tables are still being created. This happens automatically during the
          first deploy — wait a minute and refresh the page.
        </p>
      </div>
    );
  }

  const keepParams = new URLSearchParams();
  if (folderId) keepParams.set('folder', folderId);
  if (filter) keepParams.set('filter', filter);
  if (tag) keepParams.set('tag', tag);

  return (
    <div className="flex flex-col md:flex-row gap-0 -m-4 md:-m-8 min-h-[calc(100vh-5rem)]">
      {/* ── Sidebar ── */}
      <NotebookSidebar
        folders={folders}
        activeFolderId={folderId}
        activeFilter={filter}
        noteCounts={noteCounts}
      />

      {/* ── Notes list ── */}
      <div className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap sticky top-[56px] md:top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 -mt-4 md:-mt-8 pt-4 md:pt-8 pb-4 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/60">
          <div>
            <h1 className="text-2xl font-semibold">{activeLabel}</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
          <NewNoteButton folderId={folderId} />
        </div>

        {/* Search */}
        <form action="/admin/notebook" method="GET" className="mb-4 flex gap-2">
          {folderId && <input type="hidden" name="folder" value={folderId} />}
          {filter && <input type="hidden" name="filter" value={filter} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search notes…"
            className="flex-1 max-w-md px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm focus:outline-none focus:border-amber-500"
          />
          {q && (
            <Link href={`/admin/notebook${keepParams.toString() ? `?${keepParams}` : ''}`}
              className="px-3 py-2 text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-lg">
              Clear
            </Link>
          )}
        </form>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-neutral-600">Tags:</span>
            {allTags.map((t) => {
              const sp = new URLSearchParams();
              if (t !== tag) sp.set('tag', t);
              if (q) sp.set('q', q);
              return (
                <Link key={t} href={`/admin/notebook${sp.toString() ? `?${sp}` : ''}`}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    tag === t ? 'bg-amber-500 text-black border-amber-500 font-medium'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                  }`}>
                  #{t}
                </Link>
              );
            })}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <p className="text-sm">{q ? 'No notes match your search.' : 'No notes yet. Create your first one.'}</p>
            {!q && <NewNoteButton folderId={folderId} label="Write a note" />}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="relative group">
                <Link href={`/admin/notebook/${note.id}`} className="block p-4 pt-5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-600 transition h-full">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-white transition">
                      {note.pinned && <span className="text-amber-400 mr-1" title="Pinned">📌</span>}
                      {note.title}
                    </h3>
                    <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${ note.published ? 'bg-green-900/60 text-green-300' : 'bg-neutral-800 text-neutral-400' }`}>
                      {note.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {note.content && (
                    <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed mb-3">{stripHtml(note.content)}</p>
                  )}
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 4).map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-600/90">#{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    {note.folder && <span className="text-amber-600/80">📁 {note.folder.title}</span>}
                    <span className="ml-auto">{new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </Link>
                {/* Quick pin toggle */}
                <form action={togglePinNote.bind(null, note.id, !note.pinned)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <button type="submit" title={note.pinned ? 'Unpin' : 'Pin to top'}
                    className="w-7 h-7 grid place-items-center rounded-md bg-neutral-800/90 hover:bg-neutral-700 text-sm">
                    {note.pinned ? '📌' : '📍'}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
