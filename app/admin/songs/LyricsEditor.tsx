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
  // Save selection before focus leaves (clicking toolbar button loses it)
  const sel = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  function saveSelection() {
    const ta = ref.current;
    if (!ta) return;
    sel.current = { start: ta.selectionStart, end: ta.selectionEnd };
  }

  function applyTool(tool: typeof TOOLS[0]) {
    const ta = ref.current;
    if (!ta) return;
    // Restore the saved selection (clicking a button moved focus away)
    ta.focus();
    ta.setSelectionRange(sel.current.start, sel.current.end);
    const start = sel.current.start;
    const end = sel.current.end;
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

    // Write via native setter so React tracks the change
    const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    nativeSet?.call(ta, newVal);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.setSelectionRange(newCursor, newCursor);
    sel.current = { start: newCursor, end: newCursor };
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
              onMouseDown={(e) => {
                // Prevent the button from stealing focus/selection
                e.preventDefault();
                applyTool(t);
              }}
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
        onSelect={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        placeholder="Paste or type lyrics here… Use the toolbar above for bold, italic, and stanza breaks."
        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm font-mono focus:outline-none focus:border-neutral-600 leading-relaxed"
      />
      <p className="text-xs text-neutral-600">**bold**, *italic*, blank line = new stanza. The toolbar inserts formatting at the cursor.</p>
    </div>
  );
}
