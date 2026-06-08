'use client';
import { useState, useTransition } from 'react';
import { fetchLyricsAction, type FetchLyricsResult } from './actions';

interface Props {
  // Receives the textarea node so we can write the accepted lyrics into it.
  getTextarea: () => HTMLTextAreaElement | null;
}

function readFormField(name: string): string {
  if (typeof document === 'undefined') return '';
  const el = document.querySelector<HTMLInputElement>(`[name="${name}"]`);
  return el?.value?.trim() ?? '';
}

function readSelectedSingerNames(): string {
  // Singer chips are rendered as buttons inside the form; we fall back to
  // pulling hidden inputs named `singerIds` and looking up their data-name.
  if (typeof document === 'undefined') return '';
  const chips = document.querySelectorAll<HTMLElement>('[data-selected-singer]');
  const names: string[] = [];
  chips.forEach((el) => {
    const n = el.getAttribute('data-selected-singer');
    if (n) names.push(n);
  });
  return names.join(', ');
}

export default function FetchLyricsButton({ getTextarea }: Props) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<FetchLyricsResult | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  function run() {
    setError('');
    const title = readFormField('title');
    const youtubeId = readFormField('youtubeId') || null;
    const singers = readSelectedSingerNames();
    if (!title) {
      setError('Enter a title first.');
      setOpen(true);
      return;
    }
    start(async () => {
      try {
        const r = await fetchLyricsAction({ title, youtubeId, singers });
        setResult(r);
        setOpen(true);
      } catch (e: any) {
        setError(e?.message ?? 'Fetch failed');
        setOpen(true);
      }
    });
  }

  function applyText(text: string) {
    const ta = getTextarea();
    if (!ta) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    setter?.call(ta, text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="px-3 h-8 text-xs font-medium border border-amber-700/60 bg-amber-950/30 text-amber-300 rounded hover:bg-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Search YouTube description and Google for lyrics"
      >
        {pending ? 'Searching…' : '🔍 Fetch lyrics'}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-neutral-950 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 sticky top-0 bg-neutral-950">
              <h3 className="text-base font-medium text-neutral-100">Lyrics suggestions</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-neutral-500 hover:text-neutral-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-5 text-sm">
              {error && <div className="text-red-400">{error}</div>}

              {result?.suggestion ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-neutral-200 font-medium">
                        Found in {result.suggestion.label}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Confidence: {result.suggestion.confidence}
                        {result.suggestion.url && (
                          <>
                            {' · '}
                            <a
                              href={result.suggestion.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:underline"
                            >
                              source
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyText(result.suggestion!.text)}
                      className="px-3 py-1.5 bg-amber-600 text-black text-xs font-medium rounded hover:bg-amber-500"
                    >
                      Use this
                    </button>
                  </div>
                  <pre className="bg-neutral-900 border border-neutral-800 rounded p-3 text-xs whitespace-pre-wrap font-mono max-h-72 overflow-y-auto leading-relaxed">
                    {result.suggestion.text}
                  </pre>
                </div>
              ) : (
                !error && (
                  <div className="text-neutral-400">
                    No lyrics found in the YouTube description.
                  </div>
                )
              )}

              <div className="border-t border-neutral-800 pt-4">
                <div className="text-neutral-300 font-medium mb-2">Web results</div>
                {!result?.searchConfigured ? (
                  <div className="text-xs text-neutral-500">
                    Google Custom Search not configured. Set{' '}
                    <code className="text-neutral-400">GOOGLE_CSE_ID</code> and{' '}
                    <code className="text-neutral-400">GOOGLE_SEARCH_API_KEY</code> in{' '}
                    <code className="text-neutral-400">.env</code> to enable web search.
                  </div>
                ) : result.searchHits.length === 0 ? (
                  <div className="text-xs text-neutral-500">No results.</div>
                ) : (
                  <ul className="space-y-2">
                    {result.searchHits.map((h) => (
                      <li key={h.link} className="text-xs">
                        <a
                          href={h.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline font-medium"
                        >
                          {h.title}
                        </a>
                        <div className="text-neutral-500 truncate">{h.link}</div>
                        <div className="text-neutral-400 mt-0.5">{h.snippet}</div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-neutral-600 mt-3">
                  Open a result, copy the lyrics, and paste them into the editor below.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
