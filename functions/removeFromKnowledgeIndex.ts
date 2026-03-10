/**
 * STAGE 2 — KNOWLEDGE BASE FOUNDATION
 * removeFromKnowledgeIndex
 *
 * Removes all indexed chunks for a given content record from the external
 * knowledge index when a record is deleted or archived.
 *
 * This function is the deletion counterpart to upsertKnowledgeIndex.
 * It is intended to be called by an automation (Stage 2 defines the hook;
 * automation activation is deferred until Stage 3).
 *
 * SAFE NO-OP BEHAVIOR:
 * If no provider is configured (same env vars as upsertKnowledgeIndex),
 * the function returns a safe no-op response without error.
 *
 * INPUT:
 *   {
 *     document_id: string,   // Format: "EntityType::record_id"
 *     entity_type?: string,  // Optional — for validation and logging
 *     record_id?: string,    // Optional — for logging
 *     dry_run?: boolean,     // If true, log without deleting (default: false)
 *   }
 *
 * OUTPUT:
 *   {
 *     success: boolean,
 *     mode: 'live' | 'dry_run' | 'no_op',
 *     provider: string | null,
 *     document_id: string,
 *     deleted_count: number,   // Number of chunk vectors deleted
 *     errors: string[],
 *     summary: string,
 *   }
 *
 * BEHAVIOR: Admin-only. Safe no-op without provider configuration.
 * NOT connected to any agent in Stage 2.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_ENTITY_TYPES = ['Exercise', 'Resource', 'JournalTemplate', 'Psychoeducation'];

function getProviderConfig() {
  const provider = Deno.env.get('KNOWLEDGE_PROVIDER');
  const embedding_key = Deno.env.get('KNOWLEDGE_EMBEDDING_KEY');
  const index_key = Deno.env.get('KNOWLEDGE_INDEX_KEY');
  const index_host = Deno.env.get('KNOWLEDGE_INDEX_HOST');
  const index_name = Deno.env.get('KNOWLEDGE_INDEX_NAME');

  if (!provider || !index_key) {
    return null;
  }

  return { provider, embedding_key, index_key, index_host, index_name };
}

/**
 * Provider-agnostic vector deletion stub.
 * In Stage 2: documents the contract without executing live calls.
 * In Stage 3+: implement deletion by document_id prefix filter or namespace delete.
 *
 * All providers must support deleting all vectors whose ID starts with
 * `${document_id}::chunk_` — this is the naming convention set in chunkContentDocument.
 *
 * Supported provider patterns (to be implemented):
 *
 * PINECONE:
 *   DELETE by metadata filter: { document_id: { $eq: document_id } }
 *   or by ID prefix if the index supports it.
 *
 * WEAVIATE:
 *   DELETE WHERE document_id = document_id
 *
 * QDRANT:
 *   DELETE by payload filter: { key: 'document_id', match: { value: document_id } }
 */
async function deleteVectorsByDocumentId(document_id, config) {
  // Stage 2 stub — actual implementation added in Stage 3.
  throw new Error('deleteVectorsByDocumentId: No provider implemented yet. Configure KNOWLEDGE_PROVIDER.');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { document_id, entity_type, record_id, dry_run = false } = body;

    // Validate document_id
    if (!document_id || typeof document_id !== 'string') {
      return Response.json({
        error: 'document_id is required. Format: "EntityType::record_id"',
      }, { status: 400 });
    }

    // Optionally validate entity_type if provided
    if (entity_type && !ALLOWED_ENTITY_TYPES.includes(entity_type)) {
      return Response.json({
        error: `Invalid entity_type. Allowed: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
      }, { status: 400 });
    }

    // Validate document_id format loosely
    if (!document_id.includes('::')) {
      return Response.json({
        error: 'document_id format invalid. Expected: "EntityType::record_id"',
      }, { status: 400 });
    }

    // Safety check: ensure document_id does not reference a private user entity
    const [id_entity_type] = document_id.split('::');
    if (!ALLOWED_ENTITY_TYPES.includes(id_entity_type)) {
      return Response.json({
        error: `document_id references a non-content entity type: '${id_entity_type}'. This function only handles shared content entities.`,
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
        document_id,
        deleted_count: 0,
        errors: [],
        summary: `No-op: KNOWLEDGE_PROVIDER or KNOWLEDGE_INDEX_KEY are not configured. No deletion was attempted for document '${document_id}'. Set the required environment variables to enable live index management.`,
      });
    }

    // DRY RUN
    if (dry_run) {
      return Response.json({
        success: true,
        mode: 'dry_run',
        provider: config.provider,
        document_id,
        deleted_count: 0,
        errors: [],
        summary: `Dry run: Would delete all vectors for document '${document_id}' from provider '${config.provider}'. No data was removed. Set dry_run=false to execute.`,
      });
    }

    // LIVE MODE: Stage 2 stub — provider calls not yet implemented.
    let deleted_count = 0;
    const errors = [];

    try {
      deleted_count = await deleteVectorsByDocumentId(document_id, config);
    } catch (err) {
      errors.push(err.message);
    }

    return Response.json({
      success: errors.length === 0,
      mode: 'live',
      provider: config.provider,
      document_id,
      deleted_count,
      errors,
      summary: errors.length === 0
        ? `Deleted ${deleted_count} vectors for document '${document_id}' from provider '${config.provider}'.`
        : `Deletion attempted for '${document_id}' with errors.`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});