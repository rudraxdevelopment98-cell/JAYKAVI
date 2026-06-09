import MilestoneForm from '../MilestoneForm';
import { createMilestone } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export default function NewMilestonePage() {
  return (
    <>
      <AdminPageHeader title="New Milestone" backHref="/admin/journey" backLabel="Journey" />
      <div className="max-w-xl">
        <MilestoneForm action={createMilestone} submitLabel="Create milestone" />
      </div>
    </>
  );
}
