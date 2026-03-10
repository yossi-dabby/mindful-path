/**
 * STAGE 2 — KNOWLEDGE BASE FOUNDATION
 * retrieveRelevantContent
 *
 * Accepts a natural-language query and returns the most relevant content
 * chunks from the knowledge index, filtered by entity type and language.
 *
 * This function defines the RETRIEVAL CONTRACT that agents will use in Stage 3.
 * In Stage 2: the function exists, the contract is defined, but it is NOT
 * connected to any agent tool_config. It returns a safe no-op response
 * until a provider is configured.
 *
 * IMPORTANT: This function does NOT modify any data. It is read-only.
 *
 * SAFE NO-OP BEHAVIOR:
 * If no provider is configured, returns an empty results array with mode 'no_op'.
 * No error is thrown. This ensures the function is safe to call at any time.
 *
 * INPUT:
 *   {
 *     query: string,                    // Natural-language retrieval query
 *     entity_types?: string[],          // Filter by entity type (default: all 4)
 *     language?: string,                // Filter by language (default: 'en')
 *     top_k?: number,                   // Number of results to return (default: 5, max: 20)
 *     min_score?: number,               // Minimum similarity score threshold (default: 0.0)
 *     dry_run?: boolean,                // Return contract schema only, no retrieval
 *   }
 *
 * OUTPUT:
 *   {
 *     results: [
 *       {
 *         chunk_id: string,
 *         document_id: string,
 *         entity_type: string,
 *         record_id: string,
 *         title: string,
 *         slug: string | null,
 *         chunk_text: string,          // The retrieved text snippet
 *         score: number,               // Similarity score (0.0 – 1.0)
 *         chunk_index: number,
 *         language: string,
 *         metadata: object,            // Full metadata from the indexed document
 *       }
 *     ],
 *     total_results: number,
 *     query: string,
 *     mode: 'live' | 'dry_run' | 'no_op',
 *     provider: string | null,
 *     filters_applied: object,
 *   }
 *
 * BEHAVIOR:
 *   - Requires authentication (any authenticated user).
 *   - Safe no-op without provider configuration.
 *   - NOT connected to any agent tool_config in Stage 2.
 *   - Will be added to agent tool_configs in Stage 3.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_ENTITY_TYPES = ['Exercise', 'Resource', 'JournalTemplate', 'Psychoeducation'];
const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 20;
const SUPPORTED_LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

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
 * Provider-agnostic query embedding stub.
 * Identical interface to generateEmbedding in upsertKnowledgeIndex.
 * In Stage 3+: both functions should share a common utility.
 */
async function generateQueryEmbedding(query, config) {
  // Stage 2 stub — actual implementation added in Stage 3.
  throw new Error('generateQueryEmbedding: No provider implemented yet. Configure KNOWLEDGE_PROVIDER.');
}

/**
 * Provider-agnostic vector search stub.
 * In Stage 2: documents the contract without executing live calls.
 * In Stage 3+: implement with the chosen provider.
 *
 * Expected return format:
 *   [{
 *     chunk_id, document_id, entity_type, record_id, title, slug,
 *     chunk_text, score, chunk_index, language, metadata
 *   }]
 *
 * Provider patterns (to be implemented):
 *
 * PINECONE:
 *   POST /query with vector + metadata filter
 *   filter: { entity_type: { $in: entity_types }, language: { $eq: language } }
 *
 * WEAVIATE:
 *   nearVector + where filter (entity_type, language)
 *
 * QDRANT:
 *   POST /collections/{name}/points/search with filter
 */
async function searchVectors(query_embedding, filters, top_k, config) {
  // Stage 2 stub — actual implementation added in Stage 3.
  throw new Error('searchVectors: No provider implemented yet. Configure KNOWLEDGE_PROVIDER.');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Requires authentication — any authenticated user.
    // NOTE: In Stage 3, when this function is added to agent tool_configs,
    // the agent will call it with the user's auth token. The auth check
    // intentionally does NOT require admin role here.
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      query,
      entity_types,
      language = 'en',
      top_k,
      min_score = 0.0,
      dry_run = false,
    } = body;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json({ error: 'query must be a non-empty string' }, { status: 400 });
    }

    // Validate and normalize entity_types filter
    const effective_entity_types = Array.isArray(entity_types) && entity_types.length > 0
      ? entity_types.filter(t => ALLOWED_ENTITY_TYPES.includes(t))
      : [...ALLOWED_ENTITY_TYPES];

    if (effective_entity_types.length === 0) {
      return Response.json({
        error: `entity_types contains no valid values. Allowed: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
      }, { status: 400 });
    }

    // Validate language
    const effective_language = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';

    // Validate and clamp top_k
    const effective_top_k = Math.min(MAX_TOP_K, Math.max(1, top_k || DEFAULT_TOP_K));

    const filters_applied = {
      entity_types: effective_entity_types,
      language: effective_language,
      top_k: effective_top_k,
      min_score,
    };

    // DRY RUN: return the contract schema only, no retrieval
    if (dry_run) {
      return Response.json({
        results: [],
        total_results: 0,
        query: query.trim(),
        mode: 'dry_run',
        provider: getProviderConfig()?.provider || null,
        filters_applied,
        schema: {
          result_fields: [
            'chunk_id', 'document_id', 'entity_type', 'record_id',
            'title', 'slug', 'chunk_text', 'score', 'chunk_index',
            'language', 'metadata',
          ],
          note: 'Dry run complete. Retrieval contract is valid. Set dry_run=false with a configured provider to retrieve live results.',
        },
      });
    }

    // Check provider configuration
    const config = getProviderConfig();

    // SAFE NO-OP: provider not configured
    if (!config) {
      return Response.json({
        results: [],
        total_results: 0,
        query: query.trim(),
        mode: 'no_op',
        provider: null,
        filters_applied,
        note: 'No-op: KNOWLEDGE_PROVIDER, KNOWLEDGE_EMBEDDING_KEY, or KNOWLEDGE_INDEX_KEY are not configured. Configure the required environment variables and index content using upsertKnowledgeIndex to enable live retrieval.',
      });
    }

    // LIVE MODE: Stage 2 stubs — provider calls not yet implemented.
    const query_embedding = await generateQueryEmbedding(query.trim(), config);
    const raw_results = await searchVectors(query_embedding, filters_applied, effective_top_k, config);

    // Apply minimum score filter
    const filtered_results = raw_results.filter(r => r.score >= min_score);

    return Response.json({
      results: filtered_results,
      total_results: filtered_results.length,
      query: query.trim(),
      mode: 'live',
      provider: config.provider,
      filters_applied,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});