'use client';
import { useState } from 'react';

const VARIANTS = [
  {
    key: 'cinematic',
    label: 'Cinematic',
    description: 'Animated aurora orbs, moving grid, rising particles — the signature JAYKAVI look.',
    preview: (
      <div style={{ background: '#09090f', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,42,134,.55), transparent 70%)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,107,255,.45), transparent 70%)', filter: 'blur(18px)' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '14px 14px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)' }} />
        {/* Text lines */}
        <div style={{ position: 'absolute', left: '14%', top: '28%', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ width: 24, height: 3, borderRadius: 2, background: 'rgba(99,200,160,.8)' }} />
          <div style={{ width: 52, height: 5, borderRadius: 2, background: 'rgba(255,255,255,.18)' }} />
          <div style={{ width: 72, height: 12, borderRadius: 2, background: 'rgba(255,255,255,.65)', marginTop: 2 }} />
          <div style={{ width: 52, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.18)', marginTop: 4 }} />
        </div>
      </div>
    ),
  },
  {
    key: 'portrait',
    label: 'Portrait',
    description: 'Large artist photo on the left, name and stats on the right. Elegant and editorial.',
    preview: (
      <div style={{ background: '#090910', width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
        {/* Photo panel */}
        <div style={{ width: '42%', flexShrink: 0, background: 'linear-gradient(155deg, #1a1830, #0e0c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ width: 24, height: 34, borderRadius: 3, background: 'linear-gradient(160deg, #2a2045, #140e2a)', border: '1px solid rgba(255,255,255,.08)' }} />
        </div>
        {/* Content panel */}
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
          <div style={{ width: 18, height: 2, borderRadius: 1, background: 'rgba(99,200,160,.7)' }} />
          <div style={{ width: 44, height: 4, borderRadius: 1, background: 'rgba(255,255,255,.2)' }} />
          <div style={{ width: 56, height: 9, borderRadius: 1, background: 'rgba(255,255,255,.7)', marginTop: 2 }} />
          <div style={{ width: 44, height: 2, borderRadius: 1, background: 'rgba(255,255,255,.14)', marginTop: 3 }} />
          <div style={{ width: 30, height: 7, borderRadius: 2, background: 'rgba(99,200,160,.85)', marginTop: 4 }} />
        </div>
      </div>
    ),
  },
  {
    key: 'fullscreen',
    label: 'Fullscreen',
    description: 'Full-viewport background image or video with a dark overlay. Immersive and dramatic.',
    preview: (
      <div style={{ background: '#050510', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Simulated photo bg */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0e1a30 0%, #1a1030 50%, #0a1220 100%)' }} />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.8), rgba(0,0,0,.3))' }} />
        {/* Badge */}
        <div style={{ position: 'absolute', top: '16%', left: '12%', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '2px 8px' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(99,200,160,.9)', boxShadow: '0 0 6px rgba(99,200,160,.6)' }} />
          <div style={{ width: 22, height: 2, borderRadius: 1, background: 'rgba(255,255,255,.35)' }} />
        </div>
        {/* Name */}
        <div style={{ position: 'absolute', left: '12%', top: '38%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 1, background: 'rgba(255,255,255,.28)' }} />
          <div style={{ width: 68, height: 11, borderRadius: 1, background: 'rgba(255,255,255,.85)', marginTop: 2 }} />
        </div>
        {/* Bottom stats bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 18, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 6, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, borderRight: i < 3 ? '1px solid rgba(255,255,255,.06)' : 'none', paddingRight: 8 }}>
              <div style={{ width: '70%', height: 3, background: 'rgba(255,255,255,.5)', borderRadius: 1 }} />
              <div style={{ width: '90%', height: 2, background: 'rgba(255,255,255,.18)', borderRadius: 1 }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'Editorial typographic layout. Massive name, thin rules, no animations.',
    preview: (
      <div style={{ background: 'var(--bg, #0a0a0a)', width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <div style={{ width: 22, height: 2, background: 'rgba(255,255,255,.2)', borderRadius: 1 }} />
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)' }} />
          <div style={{ width: 18, height: 2, background: 'rgba(255,255,255,.2)', borderRadius: 1 }} />
        </div>
        {/* Top rule */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.12)', marginBottom: 6 }} />
        {/* First name */}
        <div style={{ fontSize: 0, height: 6, background: 'rgba(255,255,255,.25)', borderRadius: 1, width: '55%', marginBottom: 4 }} />
        {/* Last name */}
        <div style={{ fontSize: 0, height: 16, background: 'rgba(255,255,255,.75)', borderRadius: 1, width: '90%', marginBottom: 4 }} />
        {/* Bottom rule */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.12)', marginBottom: 8 }} />
        {/* Tagline */}
        <div style={{ width: '80%', height: 2, background: 'rgba(255,255,255,.18)', borderRadius: 1, marginBottom: 3 }} />
        <div style={{ width: '60%', height: 2, background: 'rgba(255,255,255,.12)', borderRadius: 1, marginBottom: 8 }} />
        {/* Links */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 32, height: 3, background: 'rgba(255,255,255,.55)', borderRadius: 1, borderBottom: '1px solid rgba(255,255,255,.55)' }} />
          <div style={{ width: 26, height: 3, background: 'rgba(255,255,255,.25)', borderRadius: 1 }} />
        </div>
      </div>
    ),
  },
] as const;

export default function HeroVariantPicker({ current }: { current: string }) {
  const [selected, setSelected] = useState(current);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {VARIANTS.map((v) => {
        const isSelected = selected === v.key;
        return (
          <label
            key={v.key}
            className={`relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              isSelected
                ? 'border-amber-500 bg-amber-950/20'
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
            }`}
            onClick={() => setSelected(v.key)}
          >
            <input
              type="radio"
              name="variant"
              value={v.key}
              checked={isSelected}
              onChange={() => setSelected(v.key)}
              className="sr-only"
            />

            {/* Mini preview */}
            <div className="h-[88px] rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
              {v.preview}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">{v.label}</span>
                {isSelected && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
                {!isSelected && v.key === current && (
                  <span className="text-[10px] font-semibold text-green-400 bg-green-950/50 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{v.description}</p>
            </div>

            {isSelected && (
              <span className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
            )}
          </label>
        );
      })}
    </div>
  );
}
