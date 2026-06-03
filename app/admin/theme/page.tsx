import { getActiveTheme } from '@/lib/data';
import { SITE_THEMES } from '@/lib/themes';
import { applyTheme } from './actions';

export const dynamic = 'force-dynamic';

export default async function SiteThemePage() {
  const current = await getActiveTheme();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold mb-1">Site Theme</h1>
      <p className="text-neutral-400 mb-8 text-sm">
        Choose the visual theme for your website. All visitors will see the selected theme.
        Users can still switch between <strong>dark</strong> and <strong>light</strong> mode
        inside whichever theme you pick.
      </p>

      <form action={applyTheme}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {SITE_THEMES.map((theme) => {
            const active = current === theme.key;
            return (
              <label
                key={theme.key}
                className={`relative flex flex-col gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                  active
                    ? 'border-amber-500 bg-amber-950/20'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.key}
                  defaultChecked={active}
                  className="sr-only"
                />

                {/* Colour swatches — dark & light preview side by side */}
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
                    {active && (
                      <span className="text-xs font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Selection ring */}
                {active && (
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

      <div className="mt-10 pt-8 border-t border-neutral-800 text-xs text-neutral-500 space-y-1">
        <p>New themes can be added by a developer — each theme just needs a CSS block and one entry in <code>lib/themes.ts</code>.</p>
        <p>The theme change takes effect for all visitors immediately after saving.</p>
      </div>
    </div>
  );
}
