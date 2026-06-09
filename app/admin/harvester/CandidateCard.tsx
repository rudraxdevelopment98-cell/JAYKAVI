'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveCandidate, rejectCandidate } from './actions';
import type { ApproveResult } from './actions';

interface Candidate {
  id: string;
  cleanTitle: string;
  rawTitle: string;
  singerGuess: string | null;
  releaseYear: number | null;
  viewCount: number | null;
  thumbnailUrl: string | null;
  youtubeId: string;
  channelTitle: string | null;
  description: string | null;
}

interface ExistingSong { title: string; slug: string; }

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function CandidateCard({
  c,
  existing,
  onDismiss,
}: {
  c: Candidate;
  existing?: ExistingSong;
  onDismiss?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [busy, setBusy] = useState<'quick' | 'full' | 'reject' | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [dupWarning, setDupWarning] = useState<ApproveResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [title, setTitle] = useState(c.rawTitle);
  const [subtitle, setSubtitle] = useState(c.cleanTitle);
  const [singers, setSingers] = useState(c.singerGuess ?? '');
  const [year, setYear] = useState(c.releaseYear?.toString() ?? '');
  const [ytId, setYtId] = useState(c.youtubeId);

  if (dismissed) return null;

  async function handleApprove(force = false, mode: 'quick' | 'full' = 'full') {
    setBusy(mode);
    setDupWarning(null);
    setActionError(null);
    try {
      const result = await approveCandidate(
        c.id,
        { title, subtitle, singerNames: singers, releaseYear: year, youtubeId: ytId },
        force,
      );
      if (result.duplicate) {
        setDupWarning(result);
        if (!open) setOpen(true);
      } else {
        setDismissed(true);
        onDismiss?.();
        router.refresh();
      }
    } catch (e: any) {
      setActionError(e?.message ?? 'Failed to approve — please try again');
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    setBusy('reject');
    setActionError(null);
    try {
      await rejectCandidate(c.id);
      setDismissed(true);
      onDismiss?.();
      router.refresh();
    } catch (e: any) {
      setActionError(e?.message ?? 'Failed to reject — please try again');
      setBusy(null);
    }
  }

  const inputCls =
    'w-full px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-200 placeholder-neutral-600';

  function highlightDesc(text: string): React.ReactNode[] {
    const creditRe =
      /(lyrics?|lyricist|written\s+by|jaykavi|jayesh\s+prajapati|જયકવિ|જયેશ\s+પ્રજાપ|ગીત|ગીતકાર)/gi;
    const parts = text.split(creditRe);
    return parts.map((part, i) =>
      creditRe.test(part) ? (
        <mark key={i} style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24', borderRadius: 2 }}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }

  const isBusy = busy !== null;

  return (
    <div className={`rounded-xl overflow-hidden bg-neutral-900 border transition-colors ${
      existing ? 'border-yellow-700/50' : 'border-neutral-800 hover:border-neutral-700/80'
    }`}>

      {/* Already-in-songs banner */}
      {existing && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-950/50 border-b border-yellow-800/40 text-xs text-yellow-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="10"/><path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
          Already in your Songs as{' '}
          <a
            href={`/songs/${existing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:text-yellow-200"
          >
            {existing.title}
          </a>
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-0 sm:gap-4">

        {/* Thumbnail — full height strip on mobile, left panel on desktop */}
        <a
          href={`https://www.youtube.com/watch?v=${c.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block flex-shrink-0 relative group self-stretch"
          style={{ width: 144 }}
        >
          {c.thumbnailUrl ? (
            <img
              src={c.thumbnailUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ minHeight: 81 }}
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-3xl" style={{ minHeight: 81 }}>
              🎵
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors">
            <svg className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          </span>
        </a>

        {/* Info + actions */}
        <div className="flex-1 min-w-0 p-4 flex flex-col sm:flex-row gap-3">

          {/* Mobile thumbnail */}
          <a
            href={`https://www.youtube.com/watch?v=${c.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden relative group rounded-lg overflow-hidden w-full"
          >
            {c.thumbnailUrl ? (
              <img src={c.thumbnailUrl} alt="" loading="lazy" className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-neutral-800 flex items-center justify-center text-4xl">🎵</div>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg">
              <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="32" height="32" viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
            </span>
          </a>

          {/* Text info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-snug line-clamp-2 text-neutral-100" title={c.rawTitle}>
              {c.rawTitle}
            </div>
            {c.cleanTitle && c.cleanTitle !== c.rawTitle && (
              <div className="text-xs text-amber-500/70 mt-0.5 truncate">{c.cleanTitle}</div>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
              {c.singerGuess && (
                <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded-full">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M12 2a3 3 0 013 3v7a3 3 0 11-6 0V5a3 3 0 013-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  </svg>
                  {c.singerGuess}
                </span>
              )}
              {c.releaseYear && (
                <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
                  {c.releaseYear}
                </span>
              )}
              {c.viewCount != null && c.viewCount > 0 && (
                <span className="text-xs text-sky-400/80 bg-sky-950/30 px-2 py-0.5 rounded-full">
                  {fmtViews(c.viewCount)} views
                </span>
              )}
              {c.channelTitle && (
                <span className="text-xs text-neutral-500 truncate max-w-[160px]">{c.channelTitle}</span>
              )}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 mt-2">
              {c.description && (
                <button
                  type="button"
                  onClick={() => setShowDesc((v) => !v)}
                  className="text-xs text-neutral-500 hover:text-neutral-300 underline underline-offset-2 transition"
                >
                  {showDesc ? 'Hide description' : 'Show description'}
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col gap-2 shrink-0 sm:w-[108px]">
            {/* Quick approve */}
            <button
              onClick={() => handleApprove(false, 'quick')}
              disabled={isBusy}
              title="Quick approve — adds song with current title and singer guess"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold
                text-green-300 bg-green-950/60 border border-green-800/60 rounded-lg
                hover:bg-green-900/70 hover:border-green-700 transition disabled:opacity-50"
            >
              {busy === 'quick' ? (
                <span className="w-3 h-3 border border-green-400/50 border-t-green-400 rounded-full animate-spin" />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {busy === 'quick' ? 'Adding…' : 'Quick Add'}
            </button>

            {/* Edit & approve */}
            <button
              onClick={() => { setOpen((v) => !v); setDupWarning(null); }}
              className="flex-1 sm:flex-none px-3 py-2 text-xs border border-neutral-700 rounded-lg
                hover:bg-neutral-800 transition text-center text-neutral-300"
            >
              {open ? '▲ Close' : 'Edit & Add'}
            </button>

            {/* Reject */}
            <button
              onClick={handleReject}
              disabled={isBusy}
              className="flex-1 sm:flex-none px-3 py-2 text-xs text-red-400 border border-red-900/40 rounded-lg
                hover:bg-red-950/50 transition disabled:opacity-50 text-center"
            >
              {busy === 'reject' ? (
                <span className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin inline-block" />
              ) : 'Reject'}
            </button>
          </div>
        </div>
      </div>

      {/* Description panel */}
      {showDesc && c.description && (
        <div className="border-t border-neutral-800 bg-neutral-950/50 px-4 py-3">
          <p className="text-[11px] text-neutral-500 mb-2 font-medium uppercase tracking-wide">
            Video description — highlighted words triggered the filter
          </p>
          <pre className="text-xs text-neutral-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {highlightDesc(c.description)}
          </pre>
        </div>
      )}

      {/* Error */}
      {actionError && (
        <div className="border-t border-red-900/60 bg-red-950/40 px-4 py-2 text-xs text-red-300 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {actionError}
        </div>
      )}

      {/* Edit form */}
      {open && (
        <div className="border-t border-neutral-800 bg-neutral-950/70 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Song title <span className="text-neutral-600 font-normal">— exact YouTube title</span>
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              {title !== c.rawTitle && (
                <button
                  type="button"
                  onClick={() => setTitle(c.rawTitle)}
                  className="text-[11px] text-amber-500/80 hover:text-amber-400 mt-1.5 transition"
                >
                  ↺ Reset to full YouTube title
                </button>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Subtitle <span className="text-neutral-600 font-normal">— cleaned / display line (optional)</span>
              </label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Performing singers{' '}
                <span className="text-neutral-600 font-normal">comma separated</span>
              </label>
              <input
                value={singers}
                onChange={(e) => setSingers(e.target.value)}
                className={inputCls}
                placeholder="e.g. Geeta Rabari, Kinjal Dave"
              />
              <p className="text-[11px] text-neutral-600 mt-1">New singers are auto-added to the list.</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Release year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} placeholder="2024" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">YouTube video ID</label>
              <input value={ytId} onChange={(e) => setYtId(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
          </div>

          {/* Duplicate warning */}
          {dupWarning && (
            <div className="rounded-lg border border-yellow-700/60 bg-yellow-950/40 p-3">
              <p className="font-semibold text-yellow-300 text-sm mb-1 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Duplicate detected
              </p>
              <p className="text-yellow-200/80 text-xs mb-3">
                {dupWarning.duplicateReason}{' '}
                <strong>&ldquo;{dupWarning.existingTitle}&rdquo;</strong> is already in your songs list.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(true, 'full')}
                  disabled={isBusy}
                  className="px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Add anyway
                </button>
                <button
                  onClick={() => setDupWarning(null)}
                  className="px-3 py-1.5 text-xs border border-neutral-600 rounded-lg hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!dupWarning && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleApprove(false, 'full')}
                disabled={isBusy}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {busy === 'full' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                    Checking…
                  </span>
                ) : 'Approve & Add to Songs'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-neutral-700 rounded-lg hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
