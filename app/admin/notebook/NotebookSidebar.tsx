'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createFolder, renameFolder, deleteFolder } from './actions';

interface Folder { id: string; title: string; }

interface Props {
  folders: Folder[];
  activeFolderId?: string;
  activeFilter?: string;
  noteCounts: { all: number; published: number; drafts: number };
}

export default function NotebookSidebar({ folders, activeFolderId, activeFilter, noteCounts }: Props) {
  const router = useRouter();
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setBusy(true);
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setNewFolderOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(id: string) {
    if (!renameVal.trim()) return;
    setBusy(true);
    try {
      await renameFolder(id, renameVal.trim());
      setRenamingId(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete folder "${title}"? Notes inside will move to All Notes.`)) return;
    setBusy(true);
    try {
      await deleteFolder(id);
      if (activeFolderId === id) router.push('/admin/notebook');
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const linkCls = (active: boolean) =>
    `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
      active ? 'bg-amber-900/40 text-amber-300' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
    }`;

  return (
    <aside className="w-56 flex-shrink-0 border-r border-neutral-800 bg-neutral-900/30 p-4 min-h-full">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-1">View</p>

      <Link href="/admin/notebook" className={linkCls(!activeFolderId && !activeFilter)}>
        <span>All Notes</span>
        <span className="text-xs text-neutral-600">{noteCounts.all}</span>
      </Link>
      <Link href="/admin/notebook?filter=published" className={linkCls(activeFilter === 'published')}>
        <span>Published</span>
        <span className="text-xs text-neutral-600">{noteCounts.published}</span>
      </Link>
      <Link href="/admin/notebook?filter=drafts" className={linkCls(activeFilter === 'drafts')}>
        <span>Drafts</span>
        <span className="text-xs text-neutral-600">{noteCounts.drafts}</span>
      </Link>

      {/* Folders */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Folders</p>
          <button
            onClick={() => setNewFolderOpen(true)}
            className="text-neutral-500 hover:text-neutral-300 transition"
            title="New folder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {folders.map((f) => (
          <div key={f.id} className="group relative">
            {renamingId === f.id ? (
              <div className="flex items-center gap-1 px-1 mb-0.5">
                <input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(f.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="flex-1 min-w-0 px-2 py-1 text-xs bg-neutral-950 border border-amber-600 rounded focus:outline-none"
                />
                <button onClick={() => handleRename(f.id)} disabled={busy}
                  className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50">✓</button>
                <button onClick={() => setRenamingId(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-300">✕</button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href={`/admin/notebook?folder=${f.id}`}
                  className={`flex-1 ${linkCls(activeFolderId === f.id)}`}
                >
                  <span className="truncate">📁 {f.title}</span>
                </Link>
                <div className="hidden group-hover:flex items-center gap-0.5 pr-1">
                  <button
                    onClick={() => { setRenamingId(f.id); setRenameVal(f.title); }}
                    className="p-1 text-neutral-600 hover:text-neutral-300 transition"
                    title="Rename"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, f.title)}
                    className="p-1 text-neutral-600 hover:text-red-400 transition"
                    title="Delete folder"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {folders.length === 0 && !newFolderOpen && (
          <p className="text-xs text-neutral-600 px-1">No folders yet.</p>
        )}

        {/* New folder input */}
        {newFolderOpen && (
          <div className="flex items-center gap-1 px-1 mt-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') { setNewFolderOpen(false); setNewFolderName(''); }
              }}
              placeholder="Folder name"
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-neutral-950 border border-amber-600 rounded focus:outline-none placeholder:text-neutral-600"
            />
            <button onClick={handleCreateFolder} disabled={busy || !newFolderName.trim()}
              className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50">✓</button>
            <button onClick={() => { setNewFolderOpen(false); setNewFolderName(''); }}
              className="text-xs text-neutral-500 hover:text-neutral-300">✕</button>
          </div>
        )}
      </div>
    </aside>
  );
}
