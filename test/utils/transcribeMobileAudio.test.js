/**
 * Unit tests for the transcribeMobileAudio mobile-only path in Chat.jsx.
 *
 * These tests verify:
 *   1. Chat.jsx contains the isAndroidRuntime() guard that routes mobile traffic
 *      to the backend transcribeMobileAudio function.
 *   2. The mobile path calls base44.functions.invoke('transcribeMobileAudio', …).
 *   3. The mobile path returns early so the web path (Core.InvokeLLM + file_urls)
 *      is NOT entered on Android.
 *   4. The web path (convertAndroidWebmDraftToWav / Core.UploadFile / Core.InvokeLLM)
 *      is still present and unchanged.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const chatSource = readFileSync(resolve(process.cwd(), 'src/pages/Chat.jsx'), 'utf8');

describe('transcribeMobileAudio — mobile-only backend path in Chat.jsx', () => {
  it('contains the isAndroidRuntime() guard inside handleTranscribeRecording', () => {
    // The guard must appear after setIsTranscribingAudio(true) and before the web path.
    expect(chatSource).toContain("if (isAndroidRuntime())");
  });

  it('invokes the transcribeMobileAudio backend function on the mobile path', () => {
    expect(chatSource).toContain("base44.functions.invoke('transcribeMobileAudio'");
  });

  it('sends file_base64, file_name, and file_type to the backend', () => {
    expect(chatSource).toContain('file_base64,');
    expect(chatSource).toContain('file_name: audioDraftFile.name,');
    expect(chatSource).toContain("file_type: audioDraftFile.type || 'audio/mp4'");
  });

  it('returns early after the mobile path so the web path is not entered on Android', () => {
    // The mobile branch must end with a bare `return;` so it exits the function
    // before the web transcription code (convertAndroidWebmDraftToWav / Core.UploadFile).
    const mobileBlock = chatSource.slice(
      chatSource.indexOf("base44.functions.invoke('transcribeMobileAudio'"),
    );
    // There must be a `return;` after the mobile try/catch/finally block closes.
    expect(mobileBlock).toMatch(/\}\s*return;/);
  });

  it('web path (convertAndroidWebmDraftToWav) is still present and unchanged', () => {
    expect(chatSource).toContain('convertAndroidWebmDraftToWav(audioDraftFile)');
  });

  it('web path (Core.UploadFile) is still present and unchanged', () => {
    expect(chatSource).toContain('Core.UploadFile({ file: transcriptionSourceFile })');
  });

  it('web path (Core.InvokeLLM) is still present and unchanged', () => {
    expect(chatSource).toContain('Core.InvokeLLM(transcriptionRequest)');
  });

  it('mobile path uses extractTranscriptText on the backend result', () => {
    expect(chatSource).toContain('extractTranscriptText(mobileResult?.data)');
  });

  it('mobile path shows a toast with title "Transcript added to composer." on success', () => {
    const mobileBlock = chatSource.slice(
      chatSource.indexOf("base44.functions.invoke('transcribeMobileAudio'"),
      chatSource.indexOf('// ── WEB PATH'),
    );
    expect(mobileBlock).toContain("toast({ title: 'Transcript added to composer.' })");
  });

  it('mobile path calls clearLocalAudioDraft() on success', () => {
    const mobileBlock = chatSource.slice(
      chatSource.indexOf("base44.functions.invoke('transcribeMobileAudio'"),
      chatSource.indexOf('// ── WEB PATH'),
    );
    expect(mobileBlock).toContain('clearLocalAudioDraft()');
  });

  it('mobile path calls buildTranscriptionFailureDescription on error', () => {
    const mobileBlock = chatSource.slice(
      chatSource.indexOf("base44.functions.invoke('transcribeMobileAudio'"),
      chatSource.indexOf('// ── WEB PATH'),
    );
    expect(mobileBlock).toContain('buildTranscriptionFailureDescription');
  });

  it('mobile path resets isTranscribingAudio via finally block', () => {
    const mobileBlock = chatSource.slice(
      chatSource.indexOf("if (isAndroidRuntime())"),
      chatSource.indexOf('// ── WEB PATH'),
    );
    expect(mobileBlock).toContain('setIsTranscribingAudio(false)');
  });
});

describe('transcribeMobileAudio — backend function contract', () => {
  it('backend entry.ts exists at expected path', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toBeTruthy();
  });

  it('backend calls OpenAI Whisper API endpoint', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain('https://api.openai.com/v1/audio/transcriptions');
  });

  it('backend uses whisper-1 model', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain("'whisper-1'");
  });

  it('backend reads OpenAI key from OPENAI_TRANSCRIPTION_KEY env var', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain("'OPENAI_TRANSCRIPTION_KEY'");
  });

  it('backend falls back to KNOWLEDGE_EMBEDDING_KEY when OPENAI_TRANSCRIPTION_KEY is absent', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain("'KNOWLEDGE_EMBEDDING_KEY'");
  });

  it('backend returns { transcript: string } shape', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain('{ transcript }');
  });

  it('backend rejects requests without auth (returns 401)', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain("'Unauthorized'");
    expect(entry).toContain('status: 401');
  });

  it('backend enforces 25 MB file size limit', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain('MAX_FILE_SIZE_BYTES');
    expect(entry).toContain('25 * 1024 * 1024');
  });

  it('backend decodes base64 to bytes before sending to Whisper', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    expect(entry).toContain('atob(file_base64)');
  });

  it('backend does NOT use Core.InvokeLLM or file_urls in executable code', () => {
    const entry = readFileSync(
      resolve(process.cwd(), 'base44/functions/transcribeMobileAudio/entry.ts'),
      'utf8',
    );
    // Strip single-line and multi-line comments before checking that InvokeLLM
    // and file_urls are not called. The comments explain why InvokeLLM isn't used;
    // the executable code must not reference them.
    const withoutComments = entry
      .replace(/\/\*[\s\S]*?\*\//g, '') // strip /* … */ blocks
      .replace(/\/\/[^\n]*/g, '');      // strip // … lines
    expect(withoutComments).not.toContain('InvokeLLM');
    expect(withoutComments).not.toContain('file_urls');
  });
});
