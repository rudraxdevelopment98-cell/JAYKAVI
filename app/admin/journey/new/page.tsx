import Link from 'next/link';
import MilestoneForm from '../MilestoneForm';
import { createMilestone } from '../actions';

export default function NewMilestonePage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/journey" className="text-sm text-neutral-400 hover:text-white">
          ← Journey
        </Link>
        <h1 className="text-3xl font-semibold">New Milestone</h1>
      </div>
      <MilestoneForm action={createMilestone} submitLabel="Create milestone" />
    </div>
  );
}
