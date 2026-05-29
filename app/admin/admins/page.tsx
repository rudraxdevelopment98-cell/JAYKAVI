import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Env "owner" admins — read from ADMIN_EMAILS, shown but not editable/removable.
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

  if (!email || !email.includes('@')) return;
  if (getEnvAdmins().includes(email)) return; // already a permanent owner

  await prisma.adminUser.upsert({
    where: { email },
    update: { name, role, note },
    create: { email, name, role, note },
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

  await prisma.adminUser.update({ where: { id }, data: { name, role, note } });
  revalidatePath('/admin/admins');
}

async function removeAdmin(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath('/admin/admins');
}

export default async function AdminAdminsPage() {
  const [admins, session] = await Promise.all([getAdmins(), auth()]);
  const envAdmins = getEnvAdmins();
  const currentEmail = (session?.user?.email ?? '').toLowerCase();

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
  const labelCls = 'block text-xs font-medium text-neutral-400 mb-1';

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">Admins</h1>
      <p className="text-neutral-400 mt-1 mb-6 text-sm">
        People who can sign in and manage this site. Anyone added here can log in with their
        Google account using the email below.
      </p>

      {/* Owners (from .env) */}
      <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-2">
        Owners
      </h2>
      <div className="space-y-2 mb-8">
        {envAdmins.length === 0 ? (
          <p className="text-sm text-neutral-500">None configured.</p>
        ) : (
          envAdmins.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"
            >
              <div>
                <div className="font-medium text-neutral-100">
                  {email}
                  {email === currentEmail && (
                    <span className="ml-2 text-xs text-amber-400">(you)</span>
                  )}
                </div>
                <div className="text-xs text-neutral-500">Permanent owner · cannot be removed</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-900/40 text-amber-300 flex-shrink-0">
                Owner
              </span>
            </div>
          ))
        )}
      </div>

      {/* Managed admins */}
      <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide mb-2">
        Added admins
      </h2>
      <div className="space-y-3 mb-8">
        {admins.length === 0 ? (
          <p className="text-sm text-neutral-500">No extra admins yet. Add one below.</p>
        ) : (
          admins.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60"
            >
              <form action={updateAdmin} className="space-y-3">
                <input type="hidden" name="id" value={a.id} />
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-neutral-100">
                    {a.email}
                    {a.email.toLowerCase() === currentEmail && (
                      <span className="ml-2 text-xs text-amber-400">(you)</span>
                    )}
                  </div>
                </div>
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
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="text-sm px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    formAction={removeAdmin}
                    className="text-sm px-4 py-2 border border-red-900/60 text-red-400 rounded-md hover:bg-red-950/40 transition"
                  >
                    Remove
                  </button>
                </div>
              </form>
            </div>
          ))
        )}
      </div>

      {/* Add new */}
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
        <button
          type="submit"
          className="text-sm px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
        >
          Add admin
        </button>
      </form>
    </div>
  );
}
