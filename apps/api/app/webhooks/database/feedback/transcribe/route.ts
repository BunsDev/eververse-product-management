import type { Feedback } from '@prisma/client';
import { database } from '@repo/backend/database';
import { textToContent } from '@repo/editor/lib/tiptap';
import { createTranscript } from '@repo/transcribe';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Feedback;
  old_record: null;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as InsertPayload;

  if (!body.record.videoUrl && !body.record.audioUrl) {
    return new Response('No video or audio to transcribe', { status: 401 });
  }

  const audioUrl = body.record.videoUrl ?? (body.record.audioUrl as string);
  const audio = await fetch(audioUrl);
  const audioBlob = await audio.blob();
  const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });

  const transcript = await createTranscript(audioFile);

  await database.feedback.update({
    where: { id: body.record.id },
    data: {
      transcript,
      content: textToContent(transcript),
      transcribedAt: new Date(),
    },
    select: { id: true },
  });

  return new Response('Success', { status: 200 });
};
