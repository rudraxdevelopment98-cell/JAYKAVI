import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import NoteEditor from '../NoteEditor';

export const dynamic = 'force-dynamic';

export default async function NoteEditorPage({ params }: { params: { id: string } }) {
  const [note, folders] = await Promise.all([
    prisma.note.findUnique({
      where: { id: params.id },
      include: { folder: { select: { id: true, title: true } } },
    }),
    prisma.noteFolder.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  if (!note) notFound();

  return (
    <NoteEditor
      note={{
        id: note.id,
        title: note.title,
        content: note.content,
        published: note.published,
        folderId: note.folderId,
        folderTitle: note.folder?.title ?? null,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      }}
      folders={folders.map((f) => ({ id: f.id, title: f.title }))}
    />
  );
}
