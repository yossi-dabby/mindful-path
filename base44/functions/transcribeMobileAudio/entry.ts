import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

/**
 * Backend transcription endpoint for mobile audio recordings.
 * Uses OpenAI Whisper which natively handles mp4, m4a, webm, wav, ogg, mp3 —
 * bypassing the Base44 InvokeLLM file-format restrictions that cause Android failures.
 *
 * Called exclusively from the mobile transcription path in pages/Chat.
 * The web transcription path (InvokeLLM) is unchanged.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_TRANSCRIPTION_KEY'),
    });

    // Fetch the uploaded audio file
    const audioResponse = await fetch(file_url);
    if (!audioResponse.ok) {
      return Response.json(
        { error: `Failed to fetch audio file: ${audioResponse.statusText}` },
        { status: audioResponse.status }
      );
    }

    const audioBlob = await audioResponse.blob();

    // Determine a safe filename with extension for Whisper
    // Whisper uses the filename extension to detect format; default to webm which is safe
    let extension = 'webm';
    const contentType = audioBlob.type || '';
    if (contentType.includes('mp4') || contentType.includes('m4a')) extension = 'mp4';
    else if (contentType.includes('ogg')) extension = 'ogg';
    else if (contentType.includes('wav')) extension = 'wav';
    else if (contentType.includes('mpeg') || contentType.includes('mp3')) extension = 'mp3';

    const audioFile = new File([audioBlob], `audio.${extension}`, { type: audioBlob.type || 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return Response.json({ transcription });
  } catch (error) {
    console.error('[transcribeMobileAudio] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});