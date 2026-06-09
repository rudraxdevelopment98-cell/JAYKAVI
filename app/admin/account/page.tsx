import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isEnvAdmin } from '@/auth';
import { saveMyAccount } from './actions';
import AccountForm from './AccountForm';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function MyAccountPage() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) redirect('/admin/login');

  const email = session.user?.email?.toLowerCase() ?? '';

  let record: any = null;
  try {
    record = await prisma.adminUser.findUnique({ where: { email } });
  } catch {
    record = null;
  }

  const profile = {
    email,
    name: record?.name ?? session.user?.name ?? '',
    role: record?.role ?? (isEnvAdmin(email) ? 'Owner' : 'Admin'),
    title: record?.title ?? '',
    phone: record?.phone ?? '',
    photoUrl: record?.photoUrl ?? '',
    bio: record?.bio ?? '',
  };

  const permissions: string[] = (session as any).permissions ?? [];

  return (
    <>
      <AdminPageHeader
        title={<>My Profile</>}
        subtitle={
          <>
            Your personal admin details. Your sign-in email and access level are managed by the owner and can’t be changed here.
          </>
        }
      />
      <div className="max-w-2xl">
        <AccountForm profile={profile} permissions={permissions} action={saveMyAccount} />
      </div>
    </>
  );
}
