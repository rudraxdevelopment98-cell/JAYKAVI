import { cn } from '@/lib/utils/cn';

const LAURELS = [
  'Cannes Film Festival',
  'Sundance',
  'TIFF',
  'Berlin International',
  'Venice Film Festival',
  'BAFTA Nominated',
  'Academy Shortlist',
  'Tribeca',
];

export function LogoReel() {
  return (
    <section className="py-12 border-y border-[var(--color-border)] overflow-hidden">
      <div className="flex">
        {/* Double the list for seamless loop */}
        <div className="flex gap-12 animate-marquee whitespace-nowrap flex-shrink-0">
          {[...LAURELS, ...LAURELS].map((name, i) => (
            <div key={i} className="flex items-center gap-12 flex-shrink-0">
              <span className="text-sm tracking-[0.15em] uppercase text-[var(--color-text-muted)] font-light">
                {name}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent-gold)] opacity-50 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
