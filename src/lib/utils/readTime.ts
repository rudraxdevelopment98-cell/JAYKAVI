const WORDS_PER_MINUTE = 200;

export function calculateReadTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}
