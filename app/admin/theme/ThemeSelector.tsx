'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE_THEMES } from '@/lib/themes';
import { applyTheme } from './actions';

export default function ThemeSelector({ current }: { current: string }) {
  const [selected, setSelected] = useState(current);

  return (
    <>
      <form action={applyTheme}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {SITE_THEMES.map((theme) => {
            const isSelected = selected === theme.key;
            const isCurrent = current === theme.key;
            return (
              <label
                key={theme.key}
                className={`relative flex flex-col gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-950/20'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.key}
                  checked={isSelected}
                  onChange={() => setSelected(theme.key)}
                  className="sr-only"
                />

                {/* Colour swatches */}
                <div className="flex gap-2 items-center">
                  <div
                    className="w-14 h-10 rounded-lg flex-shrink-0 border border-white/10"
                    style={{ background: theme.darkPreview }}
                  />
                  <div
                    className="w-14 h-10 rounded-lg flex-shrink-0 border border-black/10"
                    style={{ background: theme.lightPreview }}
                  />
                  <span className="text-xs text-neutral-500 leading-tight ml-1">
                    dark<br />light
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base">{theme.label}</span>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                    {isSelected && !isCurrent && (
                      <span className="text-xs font-semibold text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <span className="absolute top-4 right-4 w-4 h-4 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
                )}
              </label>
            );
          })}
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
        >
          Apply Theme
        </button>
      </form>

      {/* Per-theme config links */}
      {current === 'default' && (
        <div className="mt-8 p-4 rounded-xl border border-neutral-700/50 bg-neutral-900/40">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-neutral-200">Default Theme is active</p>
              <p className="text-xs text-neutral-400 mt-1">
                Choose from 4 hero layout styles: Cinematic, Portrait, Fullscreen, or Minimal.
              </p>
            </div>
            <Link
              href="/admin/theme/hero"
              className="flex-shrink-0 px-4 py-2 rounded-lg border border-neutral-600 text-neutral-300 text-sm font-medium hover:bg-neutral-800 transition"
            >
              Configure Hero →
            </Link>
          </div>
        </div>
      )}

      {current === 'traditional' && (
        <div className="mt-8 p-4 rounded-xl border border-amber-900/50 bg-amber-950/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-amber-300">Traditional Theme is active</p>
              <p className="text-xs text-neutral-400 mt-1">
                Customize hero images, mantra text, and feature cards for the Traditional theme.
              </p>
            </div>
            <Link
              href="/admin/theme/traditional"
              className="flex-shrink-0 px-4 py-2 rounded-lg border border-amber-700 text-amber-300 text-sm font-medium hover:bg-amber-950/40 transition"
            >
              Configure →
            </Link>
          </div>
        </div>
      )}

      {current === 'heritage' && (
        <div className="mt-8 p-4 rounded-xl border border-amber-900/50 bg-amber-950/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-amber-300">Heritage Library Theme is active</p>
              <p className="text-xs text-neutral-400 mt-1">
                Configure the hero banner, homepage sections, gallery and events for the Heritage Library theme.
              </p>
            </div>
            <Link
              href="/admin/theme/heritage"
              className="flex-shrink-0 px-4 py-2 rounded-lg border border-amber-700 text-amber-300 text-sm font-medium hover:bg-amber-950/40 transition"
            >
              Configure →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
