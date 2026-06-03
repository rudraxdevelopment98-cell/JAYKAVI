// Renders a JSON-LD <script> for structured data (SEO rich results).
// Server component — safe to drop into any page.

// JSON.stringify does NOT escape </script>, which would break out of the
// script block and allow stored XSS. Escape the five dangerous characters.
function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/\//g, '\\u002f');
}

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
