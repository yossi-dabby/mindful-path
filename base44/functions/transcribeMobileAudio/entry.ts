import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const MAX_REQUEST_BYTES = 4_096;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
const TRUSTED_UPLOAD_HOST_SUFFIXES = ['base44.app', 'base44.com'];

function isTrustedUploadHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!normalized || normalized === 'localhost' || normalized.endsWith('.localhost') || normalized.endsWith('.local')) {
    return false;
  }

  // Reject all literal IPv4/IPv6 targets, including loopback, link-local and
  // cloud metadata addresses. Only Base44-controlled upload hosts are allowed.
  if (/^[0-9.]+$/.test(normalized) || normalized.includes(':')) return false;

  return TRUSTED_UPLOAD_HOST_SUFFIXES.some(
    (suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`),
  );
}

function isOwnedBase44Upload(fileUrl: unknown, userId: string): fileUrl is string {
  if (typeof fileUrl !== 'string' || !fileUrl.trim() || !userId) return false;

  try {
    const parsed = new URL(fileUrl.trim());
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      !isTrustedUploadHost(parsed.hostname)
    ) {
      return false;
    }

    const segments = parsed.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return '';
        }
      });

    const publicIndex = segments.indexOf('public');
    return segments.includes('files') && publicIndex >= 0 && segments[publicIndex + 1] === userId;
  } catch {
    return false;
  }
}

async function readBoundedAudio(response: Response): Promise<Blob> {
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const allowedType =
    contentType.startsWith('audio/') ||
    contentType === 'video/mp4' ||
    contentType === 'application/octet-stream';

  if (!allowedType) throw new Error('Unsupported audio content type.');

  const declaredSize = Number(response.headers.get('content-length') || 0);
  if (Number.isFinite(declaredSize) && declaredSize > MAX_AUDIO_BYTES) {
    throw new Error('Audio file is too large.');
  }
  if (!response.body) throw new Error('Audio file has no content.');

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_AUDIO_BYTES) {
        await reader.cancel();
        throw new Error('Audio file is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (totalBytes === 0) throw new Error('Audio file is empty.');
  return new Blob(chunks, { type: contentType || 'audio/webm' });
}

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
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, {
        status: 405,
        headers: { Allow: 'POST' },
      });
    }

    const declaredRequestSize = Number(req.headers.get('content-length') || 0);
    if (Number.isFinite(declaredRequestSize) && declaredRequestSize > MAX_REQUEST_BYTES) {
      return Response.json({ error: 'Request too large' }, { status: 413 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!isOwnedBase44Upload(file_url, user.id)) {
      return Response.json({ error: 'File not found or not accessible' }, { status: 403 });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_TRANSCRIPTION_KEY'),
    });

    // Reject redirects so a trusted URL cannot bounce the server to an
    // internal target. Timeout and bounded streaming prevent resource exhaustion.
    const audioResponse = await fetch(file_url, {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: 'audio/*,video/mp4,application/octet-stream' },
    });
    if (!audioResponse.ok) {
      return Response.json({ error: 'Failed to fetch audio file' }, { status: 502 });
    }

    const audioBlob = await readBoundedAudio(audioResponse);

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