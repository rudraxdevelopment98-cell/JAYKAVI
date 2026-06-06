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
    'w-full px-2 py-1 text-sm bg-neutral-950 border border-neutral-700 rounded focus:outline-none focus:border-amber-500';

  function highlightDesc(text: string): React.ReactNode[] {
    const creditRe =
      /(lyrics?|lyricist|written\s+by|jaykavi|jayesh\s+prajapati|જયકવિ|જયેશ\s+પ્રજાપ|ગીત|ગીતકાર)/gi;
    const parts = text.split(creditRe);
    return parts.map((part, i) =>
      creditRe.test(part) ? (
        <mark
          key={i}
          style={{
            background: 'rgba(251,191,36,.25)',
            color: '#fbbf24',
            borderRadius: 2,
          }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }

  const isBusy = busy !== null;

  return (
    <div className={`border rounded-xl overflow-hidden bg-neutral-900 ${
      existing ? 'border-yellow-700/60' : 'border-neutral-800'
    }`}>
      {/* ── Already-in-listing banner ── */}
      {existing && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-950/40 border-b border-yellow-800/40 text-xs text-yellow-300">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/>
          </svg>
          <span>
            Already in your Songs as{' '}
            <a
              href={`/songs/${existing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 hover:text-yellow-200"
            >
              {existing.title}
            </a>
            {' '}— no need to add again.
          </span>
        </div>
      )}

      {/* ── Main row ── */}
      <div className="flex items-start gap-3 p-4 flex-wrap sm:flex-nowrap">
        {/* Thumbnail */}
        {c.thumbnailUrl ? (
          <a
            href={`https://www.youtube.com/watch?v=${c.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 relative group"
          >
            <img
              src={c.thumbnailUrl}
              alt=""
              loading="lazy"
              className="w-32 h-[72px] object-cover rounded-lg"
            />
            {/* Play overlay */}
            <span className="absolute inset-0 flex items-center justify-center
              bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors">
              <svg className="opacity-0 group-hover:opacity-100 transition-opacity"
                width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
            </span>
          </a>
        ) : (
          <div className="flex-shrink-0 w-32 h-[72px] rounded-lg bg-neutral-800 flex items-center justify-center text-2xl">
            🎵
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium leading-snug line-clamp-2" title={c.rawTitle}>
            {c.rawTitle}
          </div>
          {c.cleanTitle && c.cleanTitle !== c.rawTitle && (
            <div className="text-xs text-amber-500/70 mt-0.5 truncate">{c.cleanTitle}</div>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-400 mt-1">
            {c.channelTitle && (
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm-9 13l-5-3 5-3v6z"/>
                </svg>
                {c.channelTitle}
              </span>
            )}
            {c.singerGuess && (
              <span className="flex items-center gap-1 text-violet-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 2a3 3 0 013 3v7a3 3 0 11-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/>
                </svg>
                {c.singerGuess}
              </span>
            )}
            {c.releaseYear && <span>{c.releaseYear}</span>}
            {c.viewCount != null && (
              <span>{c.viewCount >= 1_000_000
                ? `${(c.viewCount / 1_000_000).toFixed(1)}M views`
                : c.viewCount >= 1_000
                ? `${(c.viewCount / 1_000).toFixed(1)}K views`
                : `${c.viewCount} views`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <a
              href={`https://www.youtube.com/watch?v=${c.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 transition"
            >
              YouTube ↗
            </a>
            {c.description && (
              <button
                type="button"
                onClick={() => setShowDesc((v) => !v)}
                className="text-xs text-neutral-500 hover:text-neutral-300 underline transition"
              >
                {showDesc ? 'Hide info' : 'Why included?'}
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0 min-w-[100px]">
          {/* Quick approve */}
          <button
            onClick={() => handleApprove(false, 'quick')}
            disabled={isBusy}
            title="Quick approve — adds song with current title and singer guess"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold
              text-green-300 bg-green-950/50 border border-green-800/60 rounded-lg
              hover:bg-green-900/60 hover:border-green-700 transition disabled:opacity-50"
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
            className="px-3 py-2 text-xs border border-neutral-700 rounded-lg hover:bg-neutral-800 transition text-center"
          >
            {open ? '▲ Collapse' : 'Edit & Add'}
          </button>

          {/* Reject */}
          <button
            onClick={handleReject}
            disabled={isBusy}
            className="px-3 py-2 text-xs text-red-400 border border-red-900/50 rounded-lg
              hover:bg-red-950/40 transition disabled:opacity-50 text-center"
          >
            {busy === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>

      {/* ── Description ── */}
      {showDesc && c.description && (
        <div className="border-t border-neutral-800 bg-neutral-950/40 px-4 py-3">
          <p className="text-xs text-neutral-500 mb-2 font-medium">
            Video description — highlighted words triggered the filter:
          </p>
          <pre className="text-xs text-neutral-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {highlightDesc(c.description)}
          </pre>
        </div>
      )}

      {/* ── Error ── */}
      {actionError && (
        <div className="border-t border-red-900 bg-red-950/40 px-4 py-2 text-xs text-red-300 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {actionError}
        </div>
      )}

      {/* ── Edit / approve form ── */}
      {open && (
        <div className="border-t border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-neutral-400 mb-1">
                Song title <span className="text-neutral-600">— exact YouTube title</span>
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              {title !== c.rawTitle && (
                <button
                  type="button"
                  onClick={() => setTitle(c.rawTitle)}
                  className="text-[11px] text-amber-500/80 hover:text-amber-400 mt-1 transition"
                >
                  ↺ Reset to full YouTube title
                </button>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-neutral-400 mb-1">
                Subtitle <span className="text-neutral-600">— cleaned / display line (optional)</span>
              </label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Performing singers
                <span className="text-neutral-600"> (comma separated)</span>
              </label>
              <input
                value={singers}
                onChange={(e) => setSingers(e.target.value)}
                className={inputCls}
                placeholder="e.g. Geeta Rabari, Kinjal Dave"
              />
              <p className="text-xs text-neutral-500 mt-1">
                New singers are auto-added to the known singers list.
              </p>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Release year</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputCls}
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">YouTube video ID</label>
              <input value={ytId} onChange={(e) => setYtId(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Duplicate warning */}
          {dupWarning && (
            <div className="rounded-lg border border-yellow-700 bg-yellow-950/40 p-3 text-sm">
              <p className="font-semibold text-yellow-300 mb-1">⚠ Duplicate detected</p>
              <p className="text-yellow-200/80 text-xs mb-2">
                {dupWarning.duplicateReason}{' '}
                <strong>&ldquo;{dupWarning.existingTitle}&rdquo;</strong> is already in your songs list.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(true, 'full')}
                  disabled={isBusy}
                  className="px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded-md font-medium transition disabled:opacity-50"
                >
                  Add anyway (keep both)
                </button>
                <button
                  onClick={() => setDupWarning(null)}
                  className="px-3 py-1.5 text-xs border border-neutral-600 rounded-md hover:bg-neutral-800 transition"
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
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition disabled:opacity-50"
              >
                {busy === 'full' ? 'Checking…' : 'Approve — Add to Songs'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-neutral-700 rounded-md hover:bg-neutral-800 transition"
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
