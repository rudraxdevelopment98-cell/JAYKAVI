'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
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

// ─── Toolbar button ─────────────────────────────────────────────────
 function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`inline-flex items-center justify-center w-8 h-8 rounded text-sm transition select-none
        ${active
          ? 'bg-amber-500/20 text-amber-300 border border-amber-600/40'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
        }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-5 bg-neutral-800 mx-0.5 flex-shrink-0" />;
}

// ─── Word download ────────────────────────────────────────────────
function downloadAsWord(title: string, html: string) {
  const doc = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; margin: 1in; color: #111; }
  h1 { font-size: 22pt; font-weight: bold; text-align: center; margin-bottom: 6pt; }
  h2 { font-size: 15pt; font-weight: bold; margin-top: 18pt; margin-bottom: 4pt; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; }
  p  { font-size: 12pt; line-height: 1.9; margin: 4pt 0; }
  ul, ol { margin-left: 24pt; }
  li { margin: 3pt 0; line-height: 1.7; }
  strong { font-weight: bold; }
  em { font-style: italic; }
  u  { text-decoration: underline; }
  hr { border: none; border-top: 1px solid #ccc; margin: 14pt 0; }
</style>
</head>
<body>
<h1>${title}</h1>
${html}
</body>
</html>`;
  const blob = new Blob([doc], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(title || 'note').replace(/[^\w\s-]/g, '')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF download ──────────────────────────────────────────────────
function downloadAsPDF(title: string, html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', serif;
    font-size: 12pt;
    color: #111;
    max-width: 680px;
    margin: 0 auto;
    padding: 50px 30px;
    line-height: 1.8;
  }
  h1 { font-size: 24pt; text-align: center; margin-bottom: 8pt; font-weight: normal; letter-spacing: -.01em; }
  h2 { font-size: 15pt; margin: 22pt 0 6pt; font-weight: 600; }
  h3 { font-size: 12pt; margin: 16pt 0 4pt; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
  p  { margin: 0 0 8pt; min-height: 1.4em; }
  ul, ol { padding-left: 22pt; margin-bottom: 8pt; }
  li { margin: 3pt 0; }
  hr { border: none; border-top: 1px solid #ccc; margin: 18pt 0; }
  .meta { text-align: center; font-size: 9pt; color: #999; margin-top: 40pt; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<h1>${title}</h1>
${html}
<div class="meta">— ${title} —</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
</script>
</body>
</html>`);
  win.document.close();
}

// ─── Main editor ──────────────────────────────────────────────────
export default function NoteEditor({
  note,
  folders,
}: {
  note: NoteData;
  folders: Folder[];
}) {
  const [title, setTitle] = useState(note.title === 'Untitled' ? '' : note.title);
  const [published, setPublished] = useState(note.published);
  const [folderId, setFolderId] = useState<string | null>(note.folderId);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useRef(false);

  const editor = useEditor({
    // Required by Tiptap v3 under Next.js SSR to avoid hydration mismatches.
    immediatelyRender: false,
    extensions: [
      // StarterKit (v3) already bundles Underline, so it is not added again here.
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: note.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'note-prose',
        spellcheck: 'true',
      },
    },
    onUpdate: () => {
      isDirty.current = true;
      setSaveStatus('unsaved');
    },
  });

  const doSave = useCallback(
    async (opts?: { title?: string; published?: boolean; folderId?: string | null }) => {
      if (!editor) return;
      setSaveStatus('saving');
      try {
        await saveNote(note.id, {
          title: opts?.title ?? title,
          content: editor.getHTML(),
          published: opts?.published ?? published,
          folderId: opts?.folderId !== undefined ? opts.folderId : folderId,
        });
        setSaveStatus('saved');
        isDirty.current = false;
      } catch {
        setSaveStatus('error');
      }
    },
    [note.id, title, published, folderId, editor],
  );

  // Auto-save 2 s after stopping
  useEffect(() => {
    if (!isDirty.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, doSave]);

  // Also trigger auto-save on editor content change
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      isDirty.current = true;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => doSave(), 2000);
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, doSave]);

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
    try { await deleteNote(note.id); } catch { setDeleting(false); }
  }

  function handlePDF() {
    if (!editor) return;
    downloadAsPDF(title || 'Untitled', editor.getHTML());
  }

  function handleWord() {
    if (!editor) return;
    downloadAsWord(title || 'Untitled', editor.getHTML());
  }

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-600 text-sm">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 md:-m-8">

      {/* ── Top action bar ── */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur flex-shrink-0 flex-wrap">
        <Link
          href="/admin/notebook"
          className="text-sm text-neutral-500 hover:text-neutral-200 transition flex items-center gap-1 mr-2 flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Notebook
        </Link>

        {/* Save status */}
        <span className={`text-xs flex-shrink-0 ${
          saveStatus === 'saved'   ? 'text-neutral-600' :
          saveStatus === 'saving'  ? 'text-amber-500'   :
          saveStatus === 'error'   ? 'text-red-400'     :
                                     'text-neutral-500'
        }`}>
          {saveStatus === 'saved'  ? '✓ Saved'      :
           saveStatus === 'saving' ? 'Saving…'      :
           saveStatus === 'error'  ? '✗ Failed'     :
                                     '● Unsaved'}
        </span>

        <div className="flex-1" />

        {/* Publish toggle */}
        <button
          onClick={handlePublishToggle}
          title={published ? 'Click to make private' : 'Click to make public'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition flex-shrink-0 ${
            published
              ? 'bg-green-900/40 border-green-700/60 text-green-300 hover:bg-green-900/60'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${published ? 'bg-green-400' : 'bg-neutral-500'}`} />
          {published ? 'Public' : 'Private'}
        </button>

        {/* Save button */}
        <button
          onClick={() => doSave()}
          className="px-3 py-1.5 text-xs font-medium bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition flex-shrink-0"
        >
          Save
        </button>

        {/* Downloads */}
        <button
          onClick={handlePDF}
          title="Download as PDF"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
          </svg>
          PDF
        </button>

        <button
          onClick={handleWord}
          title="Download as Word (.doc)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
          </svg>
          Word
        </button>

        {/* Delete */}
        <button
          onClick={() => setShowDelete(true)}
          className="p-1.5 text-neutral-600 hover:text-red-400 transition flex-shrink-0"
          title="Delete note"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      {/* ── Formatting toolbar ── */}
      <div className="flex items-center gap-0.5 px-5 py-1.5 border-b border-neutral-800 bg-neutral-950/60 backdrop-blur flex-shrink-0 flex-wrap">
        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Heading 1 (Song title)">
          <span className="font-bold text-[11px]">H1</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2 (Section)">
          <span className="font-bold text-[11px]">H2</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3 (Sub-section)">
          <span className="font-bold text-[11px]">H3</span>
        </Btn>

        <Sep />

        {/* Text style */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <span className="font-bold">B</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <span className="italic font-medium">I</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Strikethrough">
          <span className="line-through text-[11px]">S</span>
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="12" height="2" rx="1"/><rect x="3" y="17" width="15" height="2" rx="1"/>
          </svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Align center (for lyrics)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="6" y="11" width="12" height="2" rx="1"/><rect x="4" y="17" width="16" height="2" rx="1"/>
          </svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="9" y="11" width="12" height="2" rx="1"/><rect x="6" y="17" width="15" height="2" rx="1"/>
          </svg>
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="5" cy="7" r="1.5" fill="currentColor" stroke="none"/>
            <line x1="9" y1="7" x2="20" y2="7"/>
            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <line x1="9" y1="12" x2="20" y2="12"/>
            <circle cx="5" cy="17" r="1.5" fill="currentColor" stroke="none"/>
            <line x1="9" y1="17" x2="20" y2="17"/>
          </svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Numbered list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <line x1="10" y1="7" x2="20" y2="7"/>
            <line x1="10" y1="12" x2="20" y2="12"/>
            <line x1="10" y1="17" x2="20" y2="17"/>
            <text x="3" y="8.5" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text>
            <text x="3" y="13.5" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text>
            <text x="3" y="18.5" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text>
          </svg>
        </Btn>

        <Sep />

        {/* Divider */}
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert divider line">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <line x1="3" y1="12" x2="21" y2="12"/>
          </svg>
        </Btn>

        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6.5 6.5l11 11"/><path d="M16 4H7L4 11l5 5 3-2.5"/><path d="M14 20h7"/>
          </svg>
        </Btn>

        <div className="flex-1" />

        {/* Word count */}
        <span className="text-xs text-neutral-600 ml-2">{wordCount} words</span>
      </div>

      {/* ── Writing area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main writing pane */}
        <div className="flex-1 overflow-y-auto bg-neutral-950">
          <div className="max-w-2xl mx-auto px-8 py-8 md:px-12 lg:px-16">
            {/* Title */}
            <input
              type="text"
              value={title}
              placeholder="Song or note title…"
              onChange={(e) => {
                setTitle(e.target.value);
                isDirty.current = true;
                setSaveStatus('unsaved');
              }}
              className="w-full bg-transparent text-3xl md:text-4xl font-light
                text-neutral-100 placeholder:text-neutral-700 focus:outline-none mb-6
                border-b border-neutral-800 pb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            />

            {/* Rich text editor */}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right meta panel */}
        <div className="w-52 flex-shrink-0 border-l border-neutral-800 bg-neutral-900/20 p-4 overflow-y-auto hidden lg:block">
          <div className="space-y-6">

            <div>
              <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-widest">Folder</p>
              <select
                value={folderId ?? ''}
                onChange={(e) => handleFolderChange(e.target.value || null)}
                className="w-full px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700
                  rounded-md focus:outline-none focus:border-amber-600 text-neutral-300"
              >
                <option value="">None</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-widest">Visibility</p>
              <button
                onClick={handlePublishToggle}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                  published
                    ? 'bg-green-900/30 border-green-700/50 text-green-300'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${published ? 'bg-green-400' : 'bg-neutral-500'}`} />
                {published ? 'Public' : 'Private (Draft)'}
              </button>
            </div>

            <div>
              <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-widest">Stats</p>
              <div className="space-y-1.5 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Words</span><span className="text-neutral-400">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chars</span>
                  <span className="text-neutral-400">{editor.getText().length}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-widest">Export</p>
              <div className="space-y-1.5">
                <button
                  onClick={handlePDF}
                  className="w-full text-left px-3 py-2 text-xs border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
                >
                  ↓ Download PDF
                </button>
                <button
                  onClick={handleWord}
                  className="w-full text-left px-3 py-2 text-xs border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
                >
                  ↓ Download Word
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-widest">Dates</p>
              <div className="space-y-2 text-xs text-neutral-600">
                <div>
                  <span className="block text-neutral-700">Created</span>
                  {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div>
                  <span className="block text-neutral-700">Updated</span>
                  {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
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
              &ldquo;{title || 'Untitled'}&rdquo; will be permanently deleted.
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

      {/* ── Editor prose styles ── */}
      <style>{`
        .note-prose {
          min-height: 60vh;
          outline: none;
          font-size: 1rem;
          line-height: 1.9;
          color: #d4d4d4;
          caret-color: #f59e0b;
        }
        .note-prose p {
          margin: 0 0 0.6em;
          min-height: 1.6em;
        }
        .note-prose p:last-child { margin-bottom: 0; }
        .note-prose h1 {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: 2rem; font-weight: 300; letter-spacing: -.02em;
          color: #fafafa; margin: 0.2em 0 0.6em;
          border-bottom: 1px solid #2a2a2a; padding-bottom: 0.3em;
        }
        .note-prose h2 {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: 1.35rem; font-weight: 400;
          color: #e5e5e5; margin: 1.4em 0 0.4em; letter-spacing: -.01em;
        }
        .note-prose h3 {
          font-size: .9rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: .1em; color: #a3a3a3; margin: 1.2em 0 0.3em;
        }
        .note-prose strong { color: #fafafa; font-weight: 600; }
        .note-prose em { font-style: italic; color: #e5e5e5; }
        .note-prose u { text-decoration: underline; text-underline-offset: 3px; }
        .note-prose s { opacity: 0.5; }
        .note-prose ul {
          list-style-type: disc; padding-left: 1.5em; margin: 0 0 0.8em;
        }
        .note-prose ol {
          list-style-type: decimal; padding-left: 1.5em; margin: 0 0 0.8em;
        }
        .note-prose li { margin: 0.2em 0; }
        .note-prose hr {
          border: none; border-top: 1px solid #333;
          margin: 1.6em 0;
        }
        .note-prose [style*="text-align: center"],
        .note-prose .has-text-align-center { text-align: center; }
        .note-prose [style*="text-align: right"],
        .note-prose .has-text-align-right  { text-align: right; }
        /* Placeholder */
        .note-prose p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #404040; pointer-events: none; height: 0;
        }
        /* Selection */
        .note-prose ::selection { background: rgba(245,158,11,.18); }
        /* Focus ring removed */
        .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  );
}
