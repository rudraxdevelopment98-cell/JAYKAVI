import { prisma } from './prisma';

export interface ActivityEntry {
  actorEmail?: string | null;
  action: string; // login | create | update | delete
  entity: string; // Song | Singer | Admin | Config | Auth | ...
  label?: string | null;
  detail?: string | null;
}

// Record an admin action. Logging must NEVER break the underlying operation,
// so all errors are swallowed.
export async function logActivity(entry: ActivityEntry): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        entity: entry.entity,
        label: entry.label ?? null,
        detail: entry.detail ?? null,
      },
    });
    // Occasionally prune old entries (≈1 in 25 writes) so the table stays
    // small without adding a delete query to every single action.
    if (Math.random() < 0.04) {
      const { pruneOldLogs } = await import('./backup');
      await pruneOldLogs();
    }
  } catch {
    /* ignore — never let logging failures surface to the user */
  }
}
