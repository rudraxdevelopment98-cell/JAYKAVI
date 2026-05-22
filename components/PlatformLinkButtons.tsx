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
        <a key={l.platform + l.url} href={l.url} target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: compact ? '.7rem' : '.85rem',
            padding: compact ? '5px 11px' : '9px 16px',
            borderRadius: 100, border: '1px solid var(--line)',
            textDecoration: 'none', background: 'var(--panel)', backdropFilter: 'blur(8px)',
            transition: 'transform .2s',
          }}>
          {LABELS[l.platform] ?? l.platform}
        </a>
      ))}
    </div>
  );
}
