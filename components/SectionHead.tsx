import Link from 'next/link';

export default function SectionHead({ tag, title, href, hrefLabel, center }: {
  tag?: string; title: string; href?: string; hrefLabel?: string; center?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: center ? 'center' : 'flex-end',
      justifyContent: center ? 'center' : 'space-between',
      flexDirection: center ? 'column' : 'row',
      textAlign: center ? 'center' : 'left',
      marginBottom: 42, flexWrap: 'wrap', gap: 16,
    }}>
      <div>
        {tag && <div className="accent" style={{ fontSize: '.76rem', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{tag}</div>}
        <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, letterSpacing: '-.01em', margin: 0 }}>{title}</h2>
      </div>
      {href && hrefLabel && (
        <Link href={href} className="text-muted" style={{ textDecoration: 'none', fontSize: '.9rem', borderBottom: '1px solid var(--line)', paddingBottom: 3 }}>{hrefLabel}</Link>
      )}
    </div>
  );
}
