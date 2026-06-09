import { getActiveTheme } from '@/lib/data';
import ThemeSelector from './ThemeSelector';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function SiteThemePage() {
  const current = await getActiveTheme();

  return (
    <>
      <AdminPageHeader
        title={<>Site Theme</>}
        subtitle={
          <>
            Choose the visual theme for your website. All visitors will see the selected theme.
            Users can still switch between <strong>dark</strong> and <strong>light</strong> mode
            inside whichever theme you pick.
          </>
        }
      />
      <div className="max-w-3xl">
      <ThemeSelector current={current} />

      <div className="mt-8 pt-8 border-t border-neutral-800 text-xs text-neutral-500 space-y-1">
        <p>New themes can be added by a developer — each theme just needs a CSS block and one entry in <code>lib/themes.ts</code>.</p>
        <p>The theme change takes effect for all visitors immediately after saving.</p>
      </div>
      </div>
    </>
  );
}
