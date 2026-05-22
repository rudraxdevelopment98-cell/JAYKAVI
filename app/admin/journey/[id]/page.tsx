import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MilestoneForm from '../MilestoneForm';
import DeleteButton from '../../_components/DeleteButton';
import { updateMilestone, deleteMilestone } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditMilestonePage({ params }: { params: { id: string } }) {
  const m = await prisma.journeyMilestone.findUnique({ where: { id: params.id } });
  if (!m) notFound();

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/journey" className="text-sm text-neutral-400 hover:text-white">
          ← Journey
        </Link>
        <h1 className="text-3xl font-semibold truncate">{m.title}</h1>
      </div>

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
  );
}
