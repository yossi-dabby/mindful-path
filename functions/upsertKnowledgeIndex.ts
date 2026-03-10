/**
 * STAGE 2 — KNOWLEDGE BASE FOUNDATION
 * upsertKnowledgeIndex
 *
 * Accepts an array of content chunks (output of chunkContentDocument) and
 * sends them to the configured external knowledge index (vector database).
 *
 * PROVIDER-AGNOSTIC DESIGN:
 * This function does not hardcode a single vendor. The active provider is
 * controlled by environment variables. If no provider is configured, the
 * function runs as a SAFE NO-OP and returns a dry-run summary.
 *
 * Required environment variables to enable live indexing:
 *   KNOWLEDGE_PROVIDER       — 'openai_pinecone' | 'cohere_weaviate' | 'openai_qdrant' (extensible)
 *   KNOWLEDGE_EMBEDDING_KEY  — API key for the embedding service
 *   KNOWLEDGE_INDEX_KEY      — API key for the vector index service
 *   KNOWLEDGE_INDEX_HOST     — Host URL for the vector index (e.g., Pinecone index URL)
 *   KNOWLEDGE_INDEX_NAME     — Name of the index / namespace / collection
 *
 * If any required variable is absent → safe no-op, no error, no data loss.
 *
 * INPUT:
 *   {
 *     chunks: array,       // Output of chunkContentDocument
 *     dry_run?: boolean,   // If true, validate and log without indexing (default: false)
 *   }
 *
 * OUTPUT:
 *   {
 *     success: boolean,
 *     mode: 'live' | 'dry_run' | 'no_op',
 *     provider: string | null,
 *     indexed_count: number,
 *     skipped_count: number,
 *     errors: string[],
 *     summary: string,
 *   }
 *
 * BEHAVIOR: Admin-only. Safe no-op without provider configuration.
 * NOT connected to any agent in Stage 2.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Reads and validates the provider configuration from environment variables.
 * Returns null if not fully configured (triggers safe no-op).
 */
function getProviderConfig() {
  const provider = Deno.env.get('KNOWLEDGE_PROVIDER');
  const embedding_key = Deno.env.get('KNOWLEDGE_EMBEDDING_KEY');
  const index_key = Deno.env.get('KNOWLEDGE_INDEX_KEY');
  const index_host = Deno.env.get('KNOWLEDGE_INDEX_HOST');
  const index_name = Deno.env.get('KNOWLEDGE_INDEX_NAME');

  if (!provider || !embedding_key || !index_key) {
    return null;
  }

  return { provider, embedding_key, index_key, index_host, index_name };
}

/**
 * Validate a single chunk object has the required fields.
 */
function validateChunk(chunk) {
  const required = ['chunk_id', 'document_id', 'entity_type', 'record_id', 'text', 'language'];
  for (const field of required) {
    if (!chunk[field]) return `Missing required field: ${field}`;
  }
  if (typeof chunk.text !== 'string' || chunk.text.trim().length === 0) {
    return 'chunk.text must be a non-empty string';
  }
  return null; // valid
}

/**
 * Provider-agnostic embedding call stub.
 * In Stage 2: documents the contract without executing live calls.
 * In Stage 3+: replace with actual provider-specific embedding logic.
 *
 * Expected signature for all providers:
 *   generateEmbedding(text: string, config: object) → number[]
 */
async function generateEmbedding(text, config) {
  // Stage 2 stub — actual implementation added in Stage 3
  // when a provider is selected and credentials are provided.
  //
  // Supported provider patterns (to be implemented):
  //
  // OPENAI:
  //   POST https://api.openai.com/v1/embeddings
  //   model: 'text-embedding-3-small' or 'text-embedding-3-large'
  //   Authorization: Bearer ${config.embedding_key}
  //
  // COHERE:
  //   POST https://api.cohere.ai/v1/embed
  //   model: 'embed-english-v3.0' or 'embed-multilingual-v3.0'
  //   Authorization: Bearer ${config.embedding_key}
  //
  throw new Error('generateEmbedding: No provider implemented yet. Configure KNOWLEDGE_PROVIDER.');
}

/**
 * Provider-agnostic vector upsert stub.
 * In Stage 2: documents the contract without executing live calls.
 * In Stage 3+: replace with actual provider-specific upsert logic.
 *
 * Expected upsert payload format for all providers:
 *   {
 *     id: chunk.chunk_id,
 *     values: float32[],    // embedding vector
 *     metadata: {
 *       document_id, entity_type, record_id, title, slug,
 *       chunk_index, language, version, ...chunk.metadata
 *     },
 *     text: chunk.text,    // stored for retrieval result display
 *   }
 */
async function upsertVector(chunk, embedding, config) {
  // Stage 2 stub — actual implementation added in Stage 3.
  throw new Error('upsertVector: No provider implemented yet. Configure KNOWLEDGE_PROVIDER.');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { chunks, dry_run = false } = body;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return Response.json({ error: 'chunks must be a non-empty array' }, { status: 400 });
    }

    // Validate all chunks before doing any work
    const validation_errors = [];
    for (let i = 0; i < chunks.length; i++) {
      const err = validateChunk(chunks[i]);
      if (err) validation_errors.push(`Chunk ${i}: ${err}`);
    }
    if (validation_errors.length > 0) {
      return Response.json({
        success: false,
        mode: 'validation_error',
        errors: validation_errors,
      }, { status: 400 });
    }

    // Check provider configuration
    const config = getProviderConfig();

    // SAFE NO-OP: provider not configured
    if (!config) {
      return Response.json({
        success: true,
        mode: 'no_op',
        provider: null,
        indexed_count: 0,
        skipped_count: chunks.length,
        errors: [],
        summary: `No-op: KNOWLEDGE_PROVIDER, KNOWLEDGE_EMBEDDING_KEY, or KNOWLEDGE_INDEX_KEY are not configured. ${chunks.length} chunks were validated successfully and would be indexed once a provider is configured. Set the required environment variables to enable live indexing.`,
        chunks_validated: chunks.length,
        chunk_ids_preview: chunks.slice(0, 3).map(c => c.chunk_id),
      });
    }

    // DRY RUN: provider configured but dry_run=true
    if (dry_run) {
      return Response.json({
        success: true,
        mode: 'dry_run',
        provider: config.provider,
        indexed_count: 0,
        skipped_count: chunks.length,
        errors: [],
        summary: `Dry run: ${chunks.length} chunks validated successfully. No data was sent to the index. Set dry_run=false to execute live indexing.`,
        chunks_validated: chunks.length,
      });
    }

    // LIVE MODE: provider configured and dry_run=false
    // Stage 2: live embedding + upsert stubs are not yet implemented.
    // This block will be activated in Stage 3 when generateEmbedding
    // and upsertVector are implemented for the chosen provider.
    const errors = [];
    let indexed_count = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.text, config);
        await upsertVector(chunk, embedding, config);
        indexed_count++;
      } catch (err) {
        errors.push(`${chunk.chunk_id}: ${err.message}`);
      }
    }

    return Response.json({
      success: errors.length === 0,
      mode: 'live',
      provider: config.provider,
      indexed_count,
      skipped_count: chunks.length - indexed_count,
      errors,
      summary: `Indexed ${indexed_count}/${chunks.length} chunks via provider '${config.provider}'.`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});