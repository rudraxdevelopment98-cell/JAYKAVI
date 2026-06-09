import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ADMIN_SECTIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

function getEnvAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function getAdmins() {
  try {
    return await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
  } catch {
    return [];
  }
}

async function addAdmin(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');

  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const name = (formData.get('name') as string || '').trim() || null;
  const role = (formData.get('role') as string || '').trim() || 'Admin';
  const note = (formData.get('note') as string || '').trim() || null;
  const permissions = formData.getAll('permissions').map(String).filter(Boolean);

  if (!email || !email.includes('@')) return;
  if (getEnvAdmins().includes(email)) return;

  await prisma.adminUser.upsert({
    where: { email },
    update: { name, role, note, permissions },
    create: { email, name, role, note, permissions },
  });
  await logActivity({
    actorEmail: session.user?.email,
    action: 'create',
    entity: 'Admin',
    label: email,
    detail: `permissions: ${permissions.join(', ') || 'none'}`,
  });
  revalidatePath('/admin/admins');
}

async function updateAdmin(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string || '').trim() || null;
  const role = (formData.get('role') as string || '').trim() || 'Admin';
  const note = (formData.get('note') as string || '').trim() || null;
  let permissions = formData.getAll('permissions').map(String).filter(Boolean);

  const { isEnvAdmin: checkEnvAdmin } = await import('@/auth');
  if (permissions.includes('all') && !checkEnvAdmin(session.user?.email)) {
    permissions = permissions.filter((p) => p !== 'all');
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: { name, role, note, permissions },
  });
  await logActivity({
    actorEmail: session.user?.email,
    action: 'update',
    entity: 'Admin',
    label: updated.email,
    detail: `permissions: ${permissions.join(', ') || 'none'}`,
  });
  revalidatePath('/admin/admins');
}

async function removeAdmin(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const existing = await prisma.adminUser.findUnique({ where: { id }, select: { email: true } });
  await prisma.adminUser.delete({ where: { id } });
  await logActivity({
    actorEmail: session.user?.email,
    action: 'delete',
    entity: 'Admin',
    label: existing?.email ?? id,
  });
  revalidatePath('/admin/admins');
}

export default async function AdminAdminsPage() {
  const [allAdmins, session] = await Promise.all([getAdmins(), auth()]);
  const envAdmins = getEnvAdmins();
  const currentEmail = (session?.user?.email ?? '').toLowerCase();

  // Env-owners are shown in the "Owners" section above. A DB AdminUser row can
  // also exist for an owner (e.g. created when they edit their profile) — don't
  // list those again here, otherwise editing your profile looks like it created
  // a new admin.
  const admins = allAdmins.filter((a) => !envAdmins.includes(a.email.toLowerCase()));

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
  const labelCls = 'block text-xs font-medium text-neutral-400 mb-1';

  return (
    <>
      <AdminPageHeader
        title="Admins"
        subtitle="People who can sign in and manage this site. Anyone added here can log in with their Google account using the email below."
      />
      <div className="max-w-3xl">

      {/* ── Owners ── */}
      <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-2">
        Owners
      </h2>
      <p className="text-xs text-neutral-500 mb-3">
        Set via the <code className="text-neutral-400 bg-neutral-800 px-1 py-0.5 rounded">ADMIN_EMAILS</code> environment variable.
        Owners always have full access to everything — their permissions cannot be restricted.
      </p>
      <div className="space-y-2 mb-8">
        {envAdmins.length === 0 ? (
          <p className="text-sm text-neutral-500">None configured.</p>
        ) : (
          envAdmins.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-800/40 flex items-center justify-center text-xs font-semibold text-amber-300 flex-shrink-0">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-neutral-100 text-sm">
                    {email}
                    {email === currentEmail && (
                      <span className="ml-2 text-xs text-amber-400">(you)</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">Permanent owner · full access · cannot be removed</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-900/40 text-amber-300 border border-amber-800/40 flex-shrink-0">
                Owner
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Added admins (collapsible) ── */}
      <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-2">
        Added admins
      </h2>
      <div className="space-y-2 mb-8">
        {admins.length === 0 ? (
          <p className="text-sm text-neutral-500">No extra admins yet. Add one below.</p>
        ) : (
          admins.map((a) => (
            <details
              key={a.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none hover:bg-neutral-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300 flex-shrink-0">
                    {(a.name || a.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-100 text-sm truncate">
                      {a.email}
                      {a.email.toLowerCase() === currentEmail && (
                        <span className="ml-2 text-xs text-amber-400">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {a.name ? `${a.name} · ` : ''}{a.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-neutral-600 hidden sm:block">
                    {(a.permissions ?? []).length === 0
                      ? 'Full access'
                      : `${(a.permissions ?? []).length} section${(a.permissions ?? []).length !== 1 ? 's' : ''}`}
                  </span>
                  <svg className="details-chevron text-neutral-600 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </summary>

              <div className="px-4 pb-4 pt-3 border-t border-neutral-800/60">
                <form action={updateAdmin} className="space-y-3">
                  <input type="hidden" name="id" value={a.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Name</label>
                      <input name="name" defaultValue={a.name ?? ''} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Role</label>
                      <input name="role" defaultValue={a.role} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Note</label>
                    <input
                      name="note"
                      defaultValue={a.note ?? ''}
                      className={inputCls}
                      placeholder="e.g. manages song uploads"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Allowed sections</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {ADMIN_SECTIONS.map((s) => (
                        <label
                          key={s.key}
                          className="flex items-center gap-2 text-sm text-neutral-300 px-2 py-1.5 rounded-md border border-neutral-800 bg-neutral-900/40 cursor-pointer hover:border-neutral-600"
                        >
                          <input
                            type="checkbox"
                            name="permissions"
                            value={s.key}
                            defaultChecked={(a.permissions ?? []).includes(s.key)}
                            className="accent-amber-500"
                          />
                          {s.label}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Leave all unchecked for full access. Check specific sections to restrict this admin to only those areas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="text-sm px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
                    >
                      Save changes
                    </button>
                    <button
                      type="submit"
                      formAction={removeAdmin}
                      className="text-sm px-4 py-2 border border-red-900/60 text-red-400 rounded-md hover:bg-red-950/40 transition"
                    >
                      Remove admin
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))
        )}
      </div>

      {/* ── Add new admin ── */}
      <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-3">
        Add an admin
      </h2>
      <form
        action={addAdmin}
        className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3"
      >
        <div>
          <label className={labelCls}>Google email *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="person@gmail.com"
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1">
            They must sign in with this exact Google account.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Name</label>
            <input name="name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <input name="role" defaultValue="Admin" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Note</label>
          <input name="note" className={inputCls} placeholder="optional" />
        </div>
        <div>
          <label className={labelCls}>Allowed sections</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {ADMIN_SECTIONS.map((s) => (
              <label
                key={s.key}
                className="flex items-center gap-2 text-sm text-neutral-300 px-2 py-1.5 rounded-md border border-neutral-800 bg-neutral-900/40 cursor-pointer hover:border-neutral-600"
              >
                <input
                  type="checkbox"
                  name="permissions"
                  value={s.key}
                  className="accent-amber-500"
                />
                {s.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Leave all unchecked for full access to all sections.
          </p>
        </div>
        <button
          type="submit"
          className="text-sm px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
        >
          Add admin
        </button>
      </form>

      <style>{`
        summary { list-style: none; }
        summary::-webkit-details-marker { display: none; }
        summary::marker { display: none; }
        .details-chevron { transition: transform .2s ease; }
        details[open] .details-chevron { transform: rotate(180deg); }
        details[open] { border-color: rgb(64 64 64 / 0.6); }
      `}</style>
      </div>
    </>
  );
}
