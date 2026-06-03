// Renders a JSON-LD <script> for structured data (SEO rich results).
// Server component — safe to drop into any page.
export default function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
