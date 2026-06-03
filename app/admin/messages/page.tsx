import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

async function markRead(id: string) {
  'use server';
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath('/admin/messages');
}

async function markAllRead() {
  'use server';
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');
  await prisma.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath('/admin/messages');
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Contact Messages</h1>
          <p className="text-neutral-400 mt-1">
            {messages.length} message{messages.length !== 1 ? 's' : ''} total
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-900/60 text-blue-300 text-xs rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllRead}>
            <button
              type="submit"
              className="text-sm px-3 py-1.5 border border-neutral-700 rounded-md hover:bg-neutral-800 transition"
            >
              Mark all read
            </button>
          </form>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="px-5 py-10 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-xl border transition ${
                msg.read
                  ? 'bg-neutral-900/40 border-neutral-800'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <div className="font-medium text-neutral-100">{msg.name}</div>
                    <div className="text-sm text-neutral-400">{msg.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                  {!msg.read && (
                    <form action={markRead.bind(null, msg.id)}>
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 border border-neutral-700 rounded hover:bg-neutral-800 transition text-neutral-400"
                      >
                        Mark read
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {msg.subject && (
                <div className="mt-3 text-sm font-medium text-neutral-300">
                  Subject: {msg.subject}
                </div>
              )}

              <div className="mt-2 text-sm text-neutral-300 leading-relaxed">
                {msg.message.length > 300
                  ? msg.message.slice(0, 300) + '…'
                  : msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
