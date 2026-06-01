'use client';
import { useEffect, useState } from 'react';
export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  useEffect(() => {
    const stored = localStorage.getItem('adminTheme') as 'dark'|'light' | null;
    const t = stored ?? 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-admin-theme', t);
  }, []);
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('adminTheme', next);
    document.documentElement.setAttribute('data-admin-theme', next);
  }
  return (
    <button onClick={toggle} className="w-full px-3 py-2 text-left text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition">
      {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
    </button>
  );
}
