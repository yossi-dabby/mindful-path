# Mobile voice draft transcription: HTTP 403 correction

## Trigger and diagnosis

After PR #1040 was published, a mobile screenshot showed an existing voice draft
(`audio/mp4;codecs=opus`, approximately 35 KB) and a transcription HTTP 403.
Desktop transcription was reported working.

`Chat.jsx` routes mobile transcription to `transcribeMobileAudio`; desktop uses
`Core.InvokeLLM`. The mobile function's explicit 403 occurs before audio decoding
or Whisper: its URL guard requires a Base44 hostname, a `files` path component,
and the current user's ID immediately after `public`. `Core.UploadFile` only
contracts to return a storage URL; that URL is not an ownership credential. The
production app's source was read through the Base44 code API and matches this
handler. A request with a storage path lacking that user-ID layout reproduces
403 in the actual handler. Changing the codec or MIME label cannot fix that
rejection.

The production function-log API returned no lines. The screenshot does not
contain a network trace or the rejected URL, so correlation with a particular
production request remains unverified. The demonstrated code defect is fixed
without relaxing URL guards or adding storage-domain exceptions.

## Resulting behavior

- Mobile sends the local `File` directly using authenticated
  `base44.functions.invoke('transcribeMobileAudio', { file })`. The installed SDK
  turns File parameters into multipart requests and carries its normal auth.
- The function authenticates before consuming multipart bytes, limits wire bytes
  even without Content-Length, requires one non-empty audio file, and retains
  the 25 MiB audio limit. MIME, safe provider filename and generic failure
  responses remain enforced. The local draft is not uploaded to public storage
  merely to transcribe it.
- The existing Android WAV conversion and original-file fallback remain. A
  failed request keeps the local recording and typed text available for retry.
  A successful result is appended to the composer, without automatic sending.
- Desktop upload/InvokeLLM and local browser recognition paths are preserved.
- Older `{ file_url }` clients keep the original host, ownership, redirect,
  timeout and bounded-download checks. Arbitrary URLs are still rejected.
- No entity/schema, clinical prompt, retrieval, agent wiring, secret, or runtime
  configuration changes.

## Verification

`test/security/mobileAudioTranscriptionHandler.test.js` executes the actual
TypeScript request handler with only provider/auth/network I/O replaced. It
covers MP4/Opus, WAV, WebM, Ogg and video/mp4, exact audio bytes, Hebrew output,
authentication before body parsing, malformed/duplicate/empty/non-audio input,
declared and streamed size limits, provider failure, the old 403, and legacy
SSRF protection. Existing production hardening assertions remain intact.

`tests/e2e/chat-voice-transcription.spec.ts` checks the actual SDK multipart
request, filename and MIME, desktop fallbacks, Android conversion, transcript-only
send, no automatic send, and failure/retry with an undecodable MP4/Opus draft.
These browser tests use synthetic recordings and mocked services; they do not
claim physical-device microphone, native WebView codec or live Whisper validation.

## Release

Merge through the normal reviewed PR to `main`. Publish the updated backend
function together with the frontend; an old JSON-only backend cannot process a
new multipart request. No secret or environment value needs to change. After
publishing, record a short sample on the affected phone, transcribe, edit and
send; also verify the previously working desktop flow. The user's own recording
must not be copied into test fixtures or logs.
