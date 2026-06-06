import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ── data model ────────────────────────────────────────────────────────────────

const PUBLIC_GROUPS = [
  {
    label: 'Home',
    color: '#f59e0b',
    routes: [
      { path: '/', label: 'Homepage', note: '3 themes: Cinematic · Traditional · Heritage' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' },
    ],
  },
  {
    label: 'Music',
    color: '#10b981',
    routes: [
      { path: '/songs', label: 'Songs archive', note: 'Search · filter · 16:9 tiles' },
      { path: '/songs/[slug]', label: 'Song detail', note: 'Lyrics · credits · embed · share' },
      { path: '/lyrics', label: 'Lyrics browser' },
    ],
  },
  {
    label: 'Discover',
    color: '#6366f1',
    routes: [
      { path: '/explore', label: 'Explore', note: 'Collections + Singers tabs' },
      { path: '/explore?tab=singers', label: '↳ Singers tab' },
      { path: '/collections/[slug]', label: 'Collection detail' },
      { path: '/singers/[id]', label: 'Singer profile' },
    ],
  },
  {
    label: 'Editorial',
    color: '#ec4899',
    routes: [
      { path: '/journey', label: 'Journey timeline' },
      { path: '/blog', label: 'Blog list' },
      { path: '/blog/[slug]', label: 'Blog post' },
    ],
  },
];

const ADMIN_GROUPS = [
  {
    label: 'Dashboard',
    color: '#f59e0b',
    routes: [
      { path: '/admin', label: 'Dashboard', note: 'Stats overview' },
      { path: '/admin/account', label: 'My Profile', note: 'Per-admin editable' },
      { path: '/admin/analytics', label: 'Analytics', note: 'Daily views chart' },
      { path: '/admin/logs', label: 'Activity Log' },
      { path: '/admin/sitemap', label: 'Site Map ← you are here', current: true },
    ],
  },
  {
    label: 'Content',
    color: '#10b981',
    routes: [
      { path: '/admin/songs', label: 'Songs', note: 'List · search · bulk edit' },
      { path: '/admin/songs/new', label: '↳ New song' },
      { path: '/admin/songs/[id]', label: '↳ Edit song', note: 'Full form + lyrics editor' },
      { path: '/admin/collections', label: 'Collections' },
      { path: '/admin/singers', label: 'Singers' },
      { path: '/admin/journey', label: 'Journey milestones' },
      { path: '/admin/blog', label: 'Blog posts' },
      { path: '/admin/notebook', label: 'Notebook', note: 'Tags · pin · focus mode' },
      { path: '/admin/notebook/[id]', label: '↳ Note editor', note: 'TipTap rich editor' },
    ],
  },
  {
    label: 'Discover',
    color: '#6366f1',
    routes: [
      { path: '/admin/harvester', label: 'Song Harvester', note: 'YouTube → candidates → approve' },
      { path: '/admin/harvester/config', label: '↳ Harvester config' },
    ],
  },
  {
    label: 'People',
    color: '#ec4899',
    routes: [
      { path: '/admin/profile', label: 'Artist Profile', note: 'Bio · credits · languages' },
      { path: '/admin/admins', label: 'Admins', note: 'Roles · permissions' },
      { path: '/admin/contact', label: 'Contact & Social' },
      { path: '/admin/messages', label: 'Contact Messages' },
    ],
  },
  {
    label: 'System',
    color: '#94a3b8',
    routes: [
      { path: '/admin/theme', label: 'Site Theme', note: 'Switch + configure themes' },
      { path: '/admin/theme/traditional', label: '↳ Traditional settings' },
      { path: '/admin/theme/heritage', label: '↳ Heritage settings' },
      { path: '/admin/backup', label: 'Backup', note: 'JSON snapshot · restore' },
    ],
  },
];

const API_ROWS = [
  { path: '/api/harvest', label: 'POST /api/harvest', note: 'Trigger harvest run' },
  { path: '/api/admin/import-playlist', label: 'POST import-playlist', note: 'YouTube playlist → candidates' },
  { path: '/api/admin/import-excel', label: 'POST import-excel', note: 'Excel sheet → candidates' },
  { path: '/api/admin/sync-views', label: 'POST sync-views', note: 'Pull YouTube view counts' },
  { path: '/api/admin/backup-download', label: 'GET backup-download', note: 'Full JSON export' },
  { path: '/api/admin/backup-restore', label: 'POST backup-restore', note: 'Restore from JSON' },
  { path: '/api/sign-upload', label: 'POST sign-upload', note: 'Cloudinary signed upload' },
  { path: '/api/upload', label: 'POST upload', note: 'Image upload (admin)' },
  { path: '/api/upload-video', label: 'POST upload-video', note: 'Video upload redirect' },
  { path: '/api/track', label: 'POST track', note: 'Page-view counter' },
  { path: '/api/contact', label: 'POST contact', note: 'Contact form submission' },
  { path: '/api/cron/harvest', label: 'GET cron/harvest', note: 'Auto-harvest (weekly)' },
  { path: '/api/cron/backup', label: 'GET cron/backup', note: 'Auto-backup (weekly)' },
  { path: '/api/cron/sync-views', label: 'GET cron/sync-views', note: 'Auto sync views (daily)' },
];

const DATA_MODELS = [
  { name: 'Song', fields: 'title · subtitle · slug · lyrics · tags', color: '#10b981', relations: ['Singer', 'Collection', 'PlatformLink', 'LyricsTranslation'] },
  { name: 'Singer', fields: 'name · photo · bio', color: '#6366f1', relations: [] },
  { name: 'Collection', fields: 'title · slug · year · cover', color: '#f59e0b', relations: [] },
  { name: 'Note', fields: 'title · content · tags · pinned', color: '#ec4899', relations: ['NoteFolder'] },
  { name: 'Post', fields: 'title · slug · content · published', color: '#14b8a6', relations: [] },
  { name: 'HarvestCandidate', fields: 'rawTitle · cleanTitle · youtubeId · status', color: '#f97316', relations: ['HarvestRun'] },
  { name: 'Lyricist', fields: 'name · bio · languages', color: '#a78bfa', relations: [] },
  { name: 'AdminUser', fields: 'email · role · permissions', color: '#94a3b8', relations: [] },
];

// ── components ────────────────────────────────────────────────────────────────

function GroupCard({
  group,
  baseHref = '',
}: {
  group: { label: string; color: string; routes: { path: string; label: string; note?: string; current?: boolean }[] };
  baseHref?: string;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: group.color + '30', background: group.color + '08' }}
    >
      <div
        className="px-3 py-2 text-xs font-bold uppercase tracking-widest"
        style={{ background: group.color + '20', color: group.color }}
      >
        {group.label}
      </div>
      <ul className="divide-y" style={{ borderColor: group.color + '15' }}>
        {group.routes.map((r) => (
          <li key={r.path}>
            <Link
              href={baseHref + r.path.replace(/\[.*?\]/g, '').replace(/\?.*$/, '')}
              target={baseHref ? '_blank' : undefined}
              className={`flex items-start gap-2 px-3 py-2 hover:bg-white/5 transition ${r.current ? 'bg-amber-500/10' : ''}`}
            >
              <span
                className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: group.color, opacity: r.label.startsWith('↳') ? 0.4 : 1, marginTop: 6 }}
              />
              <div className="min-w-0">
                <span className={`text-sm ${r.label.startsWith('↳') ? 'text-neutral-400' : 'text-neutral-200'} ${r.current ? 'text-amber-300 font-medium' : ''}`}>
                  {r.label}
                </span>
                <code className="block text-[10px] text-neutral-600 font-mono mt-0.5">{r.path}</code>
                {r.note && <p className="text-[11px] text-neutral-500 mt-0.5">{r.note}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function SiteMapPage() {
  return (
    <div className="max-w-7xl space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Site Map</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Full architecture overview — every public route, admin section, API endpoint, and data model in one place.
        </p>
      </div>

      {/* ── Public + Admin columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Public */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <h2 className="text-base font-semibold">Public Site</h2>
            <a
              href="/"
              target="_blank"
              className="ml-auto text-xs text-neutral-500 hover:text-amber-400 transition"
            >
              Open site ↗
            </a>
          </div>
          <div className="space-y-3">
            {PUBLIC_GROUPS.map((g) => (
              <GroupCard key={g.label} group={g} baseHref="" />
            ))}
          </div>
        </section>

        {/* Admin */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="text-base font-semibold">Admin Panel</h2>
            <Link
              href="/admin"
              className="ml-auto text-xs text-neutral-500 hover:text-amber-400 transition"
            >
              Dashboard →
            </Link>
          </div>
          <div className="space-y-3">
            {ADMIN_GROUPS.map((g) => (
              <GroupCard key={g.label} group={g} baseHref="" />
            ))}
          </div>
        </section>
      </div>

      {/* ── Data model ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
          <h2 className="text-base font-semibold">Database Models</h2>
          <span className="ml-2 text-xs text-neutral-500">Prisma · Neon PostgreSQL</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DATA_MODELS.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border p-4"
              style={{ borderColor: m.color + '40', background: m.color + '08' }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: m.color }}>{m.name}</p>
              <p className="text-[11px] text-neutral-500 mb-2 leading-relaxed">{m.fields}</p>
              {m.relations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t" style={{ borderColor: m.color + '20' }}>
                  {m.relations.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] px-1.5 py-0.5 rounded-full border"
                      style={{ color: m.color, borderColor: m.color + '50', background: m.color + '10' }}
                    >
                      → {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── API routes ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          <h2 className="text-base font-semibold">API Routes</h2>
          <span className="ml-2 text-xs text-neutral-500">Next.js Route Handlers</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {API_ROWS.map((r) => (
            <div
              key={r.path}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50"
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400/70 flex-shrink-0" />
              <div className="min-w-0">
                <code className="text-xs text-orange-300 font-mono break-all">{r.label}</code>
                <p className="text-[11px] text-neutral-500 mt-0.5">{r.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Auth flow ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <h2 className="text-base font-semibold">Auth Flow</h2>
          <span className="ml-2 text-xs text-neutral-500">NextAuth v5 · JWT · Google / Email</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
          {[
            ['Visitor hits /admin/*', 'neutral'],
            ['→', 'arrow'],
            ['Middleware checks session', 'neutral'],
            ['→', 'arrow'],
            ['No session → /admin/login', 'red'],
            ['→', 'arrow'],
            ['Google OAuth or magic link', 'neutral'],
            ['→', 'arrow'],
            ['JWT created · email in ADMIN_EMAILS?', 'neutral'],
            ['→', 'arrow'],
            ['session.isAdmin = true', 'green'],
            ['→', 'arrow'],
            ['Admin panel shown with filtered nav', 'green'],
          ].map(([label, type], i) =>
            type === 'arrow' ? (
              <span key={i} className="text-neutral-600">›</span>
            ) : (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-lg border text-xs ${
                  type === 'red'   ? 'border-red-800 bg-red-950/40 text-red-300' :
                  type === 'green' ? 'border-green-800 bg-green-950/40 text-green-300' :
                                     'border-neutral-800 bg-neutral-900/50 text-neutral-300'
                }`}
              >
                {label}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Theme system ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <h2 className="text-base font-semibold">Theme System</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Cinematic (default)', slug: 'default', desc: 'Dark film-grade hero, gold accents, full-bleed background', color: '#f59e0b' },
            { name: 'Traditional', slug: 'traditional', desc: 'Gujarati devotional colors, hero video, feature tiles', color: '#f97316' },
            { name: 'Heritage Library', slug: 'heritage', desc: 'Split hero, stats strip, book-spine cards, gramophone player', color: '#a78bfa' },
          ].map((t) => (
            <Link
              key={t.slug}
              href="/admin/theme"
              className="rounded-xl border p-4 hover:border-neutral-600 transition"
              style={{ borderColor: t.color + '40', background: t.color + '08' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: t.color }}>{t.name}</p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">{t.desc}</p>
              <code className="text-[10px] text-neutral-600 mt-2 block">activeTheme = &quot;{t.slug}&quot;</code>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="text-xs text-neutral-700 pb-6">
        Auto-generated from source — update <code className="text-neutral-600">app/admin/sitemap/page.tsx</code> as routes change.
      </p>
    </div>
  );
}
