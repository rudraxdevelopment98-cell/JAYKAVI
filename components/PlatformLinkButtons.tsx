import type { PlatformLink } from '@/lib/types';

const LABELS: Record<string, string> = {
  youtube: 'YouTube', spotify: 'Spotify', amazon_music: 'Amazon Music',
  apple_music: 'Apple Music', jiosaavn: 'JioSaavn', gaana: 'Gaana',
  wynk: 'Wynk', soundcloud: 'SoundCloud', other: 'Listen',
};

export default function PlatformLinkButtons({ links, compact = false }: { links: PlatformLink[]; compact?: boolean }) {
  const valid = (links ?? []).filter((l) => l.url && l.url.startsWith('http'));
  if (valid.length === 0) {
    return <span className="text-muted" style={{ fontSize: '.8rem' }}>Links coming soon</span>;
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {valid.map((l) => (
        <a
          key={l.platform + l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="platform-btn"
          style={{
            fontSize: compact ? '.7rem' : '.85rem',
            padding: compact ? '5px 11px' : '9px 18px',
          }}
        >
          {LABELS[l.platform] ?? l.platform}
        </a>
      ))}
      <style>{`
        .platform-btn {
          border-radius: 100px;
          border: 1px solid var(--line);
          text-decoration: none;
          background: var(--panel);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: var(--text);
          transition: background .2s, border-color .2s, transform .2s;
          display: inline-block;
        }
        .platform-btn:hover {
          background: var(--panel-solid);
          border-color: var(--accent);
          transform: translateY(-2px);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
