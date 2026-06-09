import { prisma } from '@/lib/prisma';
import { saveContact } from './actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

async function getContact() {
  return (
    (await prisma.contact.findFirst({ where: { id: 1 } })) ?? {
      id: 1,
      useContactForm: true,
      showEmailPublicly: false,
      instagram: '',
      instagramSecondary: '',
      youtube: '',
      spotify: '',
      jiosaavn: '',
      privateEmail: '',
      privatePhone: '',
      privateNote: '',
      updatedAt: new Date(),
    }
  );
}

export default async function ContactPage() {
  const c = await getContact();

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  return (
    <>
      <AdminPageHeader
        title={<>Contact & Social</>}
        subtitle={
          <>
            Public social links shown on the site and private contact details (admin-only).
          </>
        }
      />
      <div className="max-w-2xl">
      <form action={saveContact} className="space-y-8">
        {/* Public social */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-200">Public social links</h2>

          <div>
            <label className={labelCls}>Instagram (primary URL)</label>
            <input
              name="instagram"
              defaultValue={c.instagram ?? ''}
              placeholder="https://www.instagram.com/jayeshprajapati_official/"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Instagram (secondary handle)</label>
            <input
              name="instagramSecondary"
              defaultValue={c.instagramSecondary ?? ''}
              placeholder="@jaykavi_official"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>YouTube channel URL</label>
            <input name="youtube" defaultValue={c.youtube ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Spotify URL</label>
            <input name="spotify" defaultValue={c.spotify ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>JioSaavn URL</label>
            <input name="jiosaavn" defaultValue={c.jiosaavn ?? ''} className={inputCls} />
          </div>
        </section>

        {/* Public toggles */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-neutral-200">Display settings</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="useContactForm"
              defaultChecked={c.useContactForm}
              className="rounded"
            />
            Show contact form on the public site
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="showEmailPublicly"
              defaultChecked={c.showEmailPublicly}
              className="rounded"
            />
            Show the private email publicly (not recommended)
          </label>
        </section>

        {/* Private contact */}
        <section className="space-y-4 p-5 border border-amber-900/50 bg-amber-950/20 rounded-xl">
          <h2 className="text-lg font-medium text-amber-200">
            Private contact (admin-only)
          </h2>
          <p className="text-xs text-amber-300/80">
            Never displayed publicly unless &ldquo;Show email publicly&rdquo; is checked.
          </p>
          <div>
            <label className={labelCls}>Email</label>
            <input
              name="privateEmail"
              type="email"
              defaultValue={c.privateEmail ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              name="privatePhone"
              defaultValue={c.privatePhone ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Internal note</label>
            <textarea
              name="privateNote"
              defaultValue={c.privateNote ?? ''}
              rows={2}
              className={inputCls}
            />
          </div>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
          >
            Save contact info
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
