import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Mobile-only backend transcription endpoint.
 *
 * Accepts a base64-encoded audio file recorded on Android/mobile and transcribes
 * it using the OpenAI Whisper API (POST /v1/audio/transcriptions).
 *
 * Why this function exists:
 *   1. Android MediaRecorder produces audio/mp4;codecs=opus recordings.
 *   2. Client-side AudioContext.decodeAudioData cannot reliably decode this codec
 *      in Android WebViews — it either throws or returns an empty buffer.
 *   3. Core.InvokeLLM + file_urls does not support raw Android audio/mp4;codecs=opus.
 *
 * The Whisper API natively supports mp3, mp4, mpeg, mpga, m4a, wav, webm, and
 * several other formats, including the audio/mp4 variant produced by Android.
 * By sending the raw bytes directly from the server, we bypass both the client-side
 * decoding limitation and the InvokeLLM file_urls format restriction.
 *
 * This function is ONLY called from the mobile code path in Chat.jsx.
 * The existing web transcription path (Core.InvokeLLM + file_urls) is untouched.
 *
 * INPUT (JSON body):
 *   { file_base64: string, file_name: string, file_type: string }
 *   - file_base64: base64-encoded raw audio bytes
 *   - file_name:   original filename (e.g. "voice-draft-1234567890.m4a")
 *   - file_type:   MIME type (e.g. "audio/mp4", "audio/mp4;codecs=opus", "audio/webm")
 *
 * OUTPUT:
 *   { transcript: string }
 *
 * ENV:
 *   OPENAI_TRANSCRIPTION_KEY  — OpenAI API key for Whisper. Falls back to
 *                               KNOWLEDGE_EMBEDDING_KEY if absent (same OpenAI key space).
 */

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-1';

/** Whisper API hard limit: 25 MB per request */
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

type TranscribeRequestBody = {
  file_base64?: unknown;
  file_name?: unknown;
  file_type?: unknown;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (req) => {
  // ── Auth ──────────────────────────────────────────────────────────────────────
  let user: { email?: string } | null = null;
  try {
    const base44 = createClientFromRequest(req);
    user = await base44.auth.me();
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── API key ───────────────────────────────────────────────────────────────────
  const openaiKey =
    Deno.env.get('OPENAI_TRANSCRIPTION_KEY') ||
    Deno.env.get('KNOWLEDGE_EMBEDDING_KEY');
  if (!openaiKey) {
    console.error('[transcribeMobileAudio] Missing OPENAI_TRANSCRIPTION_KEY / KNOWLEDGE_EMBEDDING_KEY');
    return Response.json(
      { error: 'Transcription service not configured on server' },
      { status: 503 },
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────────
  let body: TranscribeRequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { file_base64, file_name, file_type } = body ?? {};

  if (
    typeof file_base64 !== 'string' ||
    typeof file_name !== 'string' ||
    typeof file_type !== 'string' ||
    !file_base64 ||
    !file_name ||
    !file_type
  ) {
    return Response.json(
      { error: 'Missing or invalid file_base64, file_name, or file_type' },
      { status: 400 },
    );
  }

  // ── Decode base64 → bytes ─────────────────────────────────────────────────────
  let bytes: Uint8Array;
  try {
    const binaryStr = atob(file_base64);
    bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
  } catch {
    return Response.json({ error: 'Invalid base64 encoding in file_base64' }, { status: 400 });
  }

  if (bytes.length === 0) {
    return Response.json({ error: 'Audio file is empty (0 bytes)' }, { status: 400 });
  }

  if (bytes.length > MAX_FILE_SIZE_BYTES) {
    return Response.json(
      { error: `Audio file exceeds maximum allowed size (${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB)` },
      { status: 413 },
    );
  }

  // ── Call Whisper API ──────────────────────────────────────────────────────────
  // Use the base MIME type (strip codec parameter) as the Blob type so the
  // Content-Disposition filename extension drives format detection on the API side.
  const baseMimeType = file_type.split(';')[0].trim() || 'audio/mp4';

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: baseMimeType }), file_name);
  form.append('model', WHISPER_MODEL);
  form.append('response_format', 'text');

  let whisperRes: Response;
  try {
    whisperRes = await fetch(WHISPER_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form,
    });
  } catch (fetchError) {
    console.error('[transcribeMobileAudio] Whisper API fetch failed:', getErrorMessage(fetchError));
    return Response.json(
      { error: `Failed to reach transcription service: ${getErrorMessage(fetchError).slice(0, 120)}` },
      { status: 502 },
    );
  }

  if (!whisperRes.ok) {
    const errorBody = await whisperRes.text().catch(() => '');
    console.error(
      '[transcribeMobileAudio] Whisper API error:',
      whisperRes.status,
      errorBody.slice(0, 200),
    );
    return Response.json(
      {
        error: `Transcription service returned status ${whisperRes.status}`,
        detail: errorBody.slice(0, 200),
      },
      { status: 502 },
    );
  }

  // Whisper with response_format=text returns the transcript as plain text.
  const transcript = (await whisperRes.text()).trim();
  if (!transcript) {
    return Response.json(
      { error: 'Transcription service returned an empty transcript' },
      { status: 502 },
    );
  }

  return Response.json({ transcript });
});
