'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark or light theme"
      style={{
        background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)',
        width: 42, height: 42, borderRadius: '50%', cursor: 'pointer', fontSize: '1.05rem',
        backdropFilter: 'blur(10px)', transition: 'transform .4s, box-shadow .4s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(40deg) scale(1.08)'; e.currentTarget.style.boxShadow = 'var(--glow)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {theme === 'dark' ? '◐' : '◑'}
    </button>
  );
}
