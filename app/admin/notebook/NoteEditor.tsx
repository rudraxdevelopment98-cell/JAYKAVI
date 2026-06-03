'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveNote, deleteNote } from './actions';

interface Folder { id: string; title: string; }

interface NoteData {
  id: string;
  title: string;
  content: string;
  published: boolean;
  folderId: string | null;
  folderTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NoteEditor({
  note,
  folders,
}: {
  note: NoteData;
  folders: Folder[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title === 'Untitled' ? '' : note.title);
  const [content, setContent] = useState(note.content);
  const [published, setPublished] = useState(note.published);
  const [folderId, setFolderId] = useState<string | null>(note.folderId);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useRef(false);

  const doSave = useCallback(
    async (opts?: { title?: string; content?: string; published?: boolean; folderId?: string | null }) => {
      setSaveStatus('saving');
      try {
        await saveNote(note.id, {
          title: opts?.title ?? title,
          content: opts?.content ?? content,
          published: opts?.published ?? published,
          folderId: opts?.folderId !== undefined ? opts.folderId : folderId,
        });
        setSaveStatus('saved');
        isDirty.current = false;
      } catch (e: any) {
        setSaveStatus('error');
      }
    },
    [note.id, title, content, published, folderId],
  );

  // Auto-save 2 s after user stops typing
  useEffect(() => {
    if (!isDirty.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('unsaved');
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, content, doSave]);

  function markDirty() { isDirty.current = true; }

  async function handlePublishToggle() {
    const next = !published;
    setPublished(next);
    isDirty.current = true;
    await doSave({ published: next });
  }

  async function handleFolderChange(id: string | null) {
    setFolderId(id);
    isDirty.current = true;
    await doSave({ folderId: id });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteNote(note.id);
    } catch {
      setDeleting(false);
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-8">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur flex-shrink-0">
        <Link
          href="/admin/notebook"
          className="text-sm text-neutral-400 hover:text-neutral-200 transition flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Notebook
        </Link>

        <div className="flex-1" />

        {/* Save status */}
        <span className={`text-xs ${
          saveStatus === 'saved' ? 'text-neutral-600' :
          saveStatus === 'saving' ? 'text-amber-500' :
          saveStatus === 'error' ? 'text-red-400' :
          'text-neutral-500'
        }`}>
          {saveStatus === 'saved' ? '✓ Saved' :
           saveStatus === 'saving' ? 'Saving…' :
           saveStatus === 'error' ? '✗ Save failed' :
           '● Unsaved'}
        </span>

        {/* Publish toggle */}
        <button
          onClick={handlePublishToggle}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
            published
              ? 'bg-green-900/40 border-green-700 text-green-300 hover:bg-green-900/60'
              : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${published ? 'bg-green-400' : 'bg-neutral-500'}`} />
          {published ? 'Published' : 'Draft'}
        </button>

        {/* Manual save */}
        <button
          onClick={() => doSave()}
          className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition"
        >
          Save
        </button>

        {/* Delete */}
        <button
          onClick={() => setShowDelete(true)}
          className="p-1.5 text-neutral-600 hover:text-red-400 transition"
          title="Delete note"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      {/* ── Editor area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Writing pane */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-neutral-950 px-8 py-6 md:px-16 lg:px-24">
          {/* Title */}
          <input
            type="text"
            value={title}
            placeholder="Note title…"
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            className="w-full bg-transparent text-2xl md:text-3xl font-semibold
              text-neutral-100 placeholder:text-neutral-700 focus:outline-none mb-4
              border-b border-neutral-800 pb-3"
          />

          {/* Content textarea */}
          <textarea
            value={content}
            placeholder="Start writing…&#10;&#10;This is your private notebook. Write lyrics, notes, ideas — anything."
            onChange={(e) => { setContent(e.target.value); markDirty(); }}
            className="flex-1 w-full min-h-[60vh] bg-transparent text-neutral-200
              placeholder:text-neutral-700 focus:outline-none resize-none
              text-base leading-8 font-mono"
            spellCheck
          />
        </div>

        {/* Right metadata panel */}
        <div className="w-52 flex-shrink-0 border-l border-neutral-800 bg-neutral-900/30 p-4 overflow-y-auto hidden lg:block">
          <div className="space-y-5">
            {/* Folder */}
            <div>
              <p className="text-xs text-neutral-500 font-medium mb-1.5 uppercase tracking-wide">Folder</p>
              <select
                value={folderId ?? ''}
                onChange={(e) => handleFolderChange(e.target.value || null)}
                className="w-full px-2 py-1.5 text-sm bg-neutral-900 border border-neutral-700
                  rounded-md focus:outline-none focus:border-amber-600 text-neutral-300"
              >
                <option value="">None</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-neutral-500 font-medium mb-1.5 uppercase tracking-wide">Status</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                published ? 'bg-green-900/40 text-green-300' : 'bg-neutral-800 text-neutral-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${published ? 'bg-green-400' : 'bg-neutral-500'}`} />
                {published ? 'Published' : 'Draft'}
              </span>
            </div>

            {/* Stats */}
            <div>
              <p className="text-xs text-neutral-500 font-medium mb-1.5 uppercase tracking-wide">Stats</p>
              <div className="space-y-1 text-xs text-neutral-500">
                <div className="flex justify-between"><span>Words</span><span>{wordCount}</span></div>
                <div className="flex justify-between"><span>Lines</span><span>{lineCount}</span></div>
                <div className="flex justify-between"><span>Chars</span><span>{content.length}</span></div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <p className="text-xs text-neutral-500 font-medium mb-1.5 uppercase tracking-wide">Dates</p>
              <div className="space-y-1 text-xs text-neutral-600">
                <div>Created<br />{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div className="mt-1">Updated<br />{new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-semibold text-lg mb-2">Delete this note?</h3>
            <p className="text-sm text-neutral-400 mb-5">
              &ldquo;{title || 'Untitled'}&rdquo; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm border border-neutral-700 rounded-lg hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
