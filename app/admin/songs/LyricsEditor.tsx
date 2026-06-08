'use client';
import { useRef } from 'react';
import FetchLyricsButton from './FetchLyricsButton';

const TOOLS = [
  { label: 'B', title: 'Bold', wrap: ['**','**'] },
  { label: 'I', title: 'Italic', wrap: ['*','*'] },
  { label: '—', title: 'Section break', insert: '\n\n——————\n\n' },
  { label: '↵', title: 'New stanza', insert: '\n\n' },
];

export default function LyricsEditor({ defaultValue = '' }: { defaultValue?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyTool(tool: typeof TOOLS[0]) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;

    let newVal: string;
    let newCursor: number;

    if ('insert' in tool && tool.insert) {
      newVal = val.slice(0, start) + tool.insert + val.slice(end);
      newCursor = start + tool.insert.length;
    } else if ('wrap' in tool && tool.wrap) {
      const [before, after] = tool.wrap;
      const selected = val.slice(start, end) || 'text';
      newVal = val.slice(0, start) + before + selected + after + val.slice(end);
      newCursor = start + before.length + selected.length + after.length;
    } else {
      return;
    }

    ta.value = newVal;
    ta.setSelectionRange(newCursor, newCursor);
    ta.focus();
    // trigger React onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(ta, newVal);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-md w-fit">
          {TOOLS.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.title}
              onClick={() => applyTool(t)}
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white rounded transition"
            >
              {t.label}
            </button>
          ))}
        </div>
        <FetchLyricsButton getTextarea={() => ref.current} />
      </div>
      <textarea
        ref={ref}
        name="lyrics"
        defaultValue={defaultValue}
        rows={14}
        placeholder="Paste or type lyrics here… Use the toolbar above for bold, italic, and stanza breaks."
        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm font-mono focus:outline-none focus:border-neutral-600 leading-relaxed"
      />
      <p className="text-xs text-neutral-600">**bold**, *italic*, blank line = new stanza. The toolbar inserts formatting at the cursor.</p>
    </div>
  );
}
