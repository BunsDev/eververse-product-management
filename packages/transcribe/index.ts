import { transcribe } from 'orate';
import { assembly } from 'orate/assembly';

export type { Transcript } from 'assemblyai';

export const createTranscript = async (audio: File) =>
  transcribe({
    model: assembly.stt(),
    audio,
  });
