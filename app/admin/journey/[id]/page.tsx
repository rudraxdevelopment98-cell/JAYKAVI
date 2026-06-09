import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MilestoneForm from '../MilestoneForm';
import DeleteButton from '../../_components/DeleteButton';
import { updateMilestone, deleteMilestone } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function EditMilestonePage({ params }: { params: { id: string } }) {
  const m = await prisma.journeyMilestone.findUnique({ where: { id: params.id } });
  if (!m) notFound();

  return (
    <>
      <AdminPageHeader title={m.title} backHref="/admin/journey" backLabel="Journey" />
      <div className="max-w-xl">
      <MilestoneForm
        initial={{
          title: m.title,
          year: m.year,
          description: m.description,
          imageUrl: m.imageUrl,
          sortOrder: m.sortOrder,
        }}
        action={updateMilestone.bind(null, m.id)}
        submitLabel="Save changes"
        showSortOrder
      />

      <div className="mt-8 pt-6 border-t border-neutral-800">
        <DeleteButton
          onConfirm={async () => {
            'use server';
            await deleteMilestone(m.id);
          }}
          label="Delete milestone"
          confirmText={`Delete "${m.title}"?`}
        />
      </div>
      </div>
    </>
  );
}
