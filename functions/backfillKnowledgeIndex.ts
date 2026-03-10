/**
 * STAGE 3 — LIVE KNOWLEDGE INDEX WIRING
 * backfillKnowledgeIndex
 *
 * Admin-only, manually-triggered batch backfill. Fetches records from the
 * allowed shared content entities and indexes them via indexContentRecord.
 *
 * This function NEVER runs automatically. It must be triggered explicitly
 * by an admin. It does NOT run on deploy.
 *
 * FEATURE FLAG:
 *   KNOWLEDGE_BACKFILL_ENABLED — must be 'true' to allow live backfill
 *   KNOWLEDGE_INDEX_ENABLED    — must also be 'true' (checked inside indexContentRecord)
 *
 * INPUT:
 *   {
 *     entity_type?: string,    // Scope to one entity type (default: all 4)
 *     batch_size?: number,     // Records per batch (default: 10, max: 50)
 *     offset?: number,         // Pagination offset (default: 0)
 *     dry_run?: boolean,       // Validate without indexing (default: false)
 *   }
 *
 * OUTPUT:
 *   {
 *     success: boolean,
 *     mode: 'live' | 'dry_run' | 'no_op',
 *     entity_types_processed: string[],
 *     total_records_fetched: number,
 *     indexed_count: number,
 *     skipped_count: number,
 *     error_count: number,
 *     record_results: array,
 *     batch_size: number,
 *     offset: number,
 *   }
 *
 * BEHAVIOR: Admin-only. Requires KNOWLEDGE_BACKFILL_ENABLED=true.
 * NOT connected to any agent.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_ENTITY_TYPES = ['Exercise', 'Resource', 'JournalTemplate', 'Psychoeducation'];
const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 50;

// ─── FEATURE FLAG ─────────────────────────────────────────────────────────────
function isBackfillEnabled() {
  return Deno.env.get('KNOWLEDGE_BACKFILL_ENABLED') === 'true';
}

// ─── FETCH RECORDS FOR ONE ENTITY TYPE ────────────────────────────────────────
async function fetchEntityRecords(base44, entity_type, batch_size, offset) {
  // Fetch slightly more than batch_size to account for skipped records,
  // but cap at batch_size for safety.
  switch (entity_type) {
    case 'Exercise':
      return base44.asServiceRole.entities.Exercise.list('-created_date', batch_size, offset);
    case 'Resource':
      return base44.asServiceRole.entities.Resource.list('-created_date', batch_size, offset);
    case 'JournalTemplate':
      return base44.asServiceRole.entities.JournalTemplate.list('-created_date', batch_size, offset);
    case 'Psychoeducation':
      return base44.asServiceRole.entities.Psychoeducation.list('-created_date', batch_size, offset);
    default:
      return [];
  }
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      entity_type,
      batch_size,
      offset = 0,
      dry_run = false,
    } = body;

    // Validate entity_type if provided
    if (entity_type && !ALLOWED_ENTITY_TYPES.includes(entity_type)) {
      return Response.json({
        error: `Invalid entity_type '${entity_type}'. Allowed: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
      }, { status: 400 });
    }

    // Clamp batch_size
    const effective_batch_size = Math.min(
      MAX_BATCH_SIZE,
      Math.max(1, batch_size || DEFAULT_BATCH_SIZE)
    );

    // Determine which entity types to process
    const entity_types_to_process = entity_type
      ? [entity_type]
      : [...ALLOWED_ENTITY_TYPES];

    // ── FEATURE FLAG CHECK ─────────────────────────────────────────────────────
    if (!isBackfillEnabled()) {
      return Response.json({
        success: true,
        mode: 'no_op',
        entity_types_processed: [],
        total_records_fetched: 0,
        indexed_count: 0,
        skipped_count: 0,
        error_count: 0,
        record_results: [],
        batch_size: effective_batch_size,
        offset,
        note: `No-op: KNOWLEDGE_BACKFILL_ENABLED is not set to 'true'. Set this flag to enable controlled backfill. Also ensure KNOWLEDGE_INDEX_ENABLED=true.`,
      });
    }

    // ── FETCH AND PROCESS RECORDS ──────────────────────────────────────────────
    const record_results = [];
    let total_records_fetched = 0;
    let indexed_count = 0;
    let skipped_count = 0;
    let error_count = 0;

    for (const etype of entity_types_to_process) {
      let records = [];
      try {
        records = await fetchEntityRecords(base44, etype, effective_batch_size, offset) || [];
      } catch (err) {
        record_results.push({
          entity_type: etype,
          record_id: null,
          status: 'error',
          reason: `Failed to fetch records: ${err.message}`,
        });
        error_count++;
        continue;
      }

      total_records_fetched += records.length;

      for (const record of records) {
        const record_id = record.id;
        const record_status = record.status || 'active';

        // Skip non-active records immediately (don't even call indexContentRecord)
        if (record_status !== 'active') {
          record_results.push({
            entity_type: etype,
            record_id,
            status: 'skipped',
            reason: `Status is '${record_status}' — only active records are backfilled.`,
          });
          skipped_count++;
          continue;
        }

        if (dry_run) {
          // In dry_run, call indexContentRecord with dry_run=true to validate
          // without actually indexing. This validates the pipeline end-to-end.
          try {
            const res = await base44.asServiceRole.functions.invoke('indexContentRecord', {
              entity_type: etype,
              record_id,
              dry_run: true,
            });
            const result = res?.data || {};
            record_results.push({
              entity_type: etype,
              record_id,
              status: result.action || 'unknown',
              chunks_would_index: result.chunks_indexed,
              reason: result.reason || null,
            });
            if (result.action === 'skipped' || result.action === 'no_op') {
              skipped_count++;
            } else {
              indexed_count++; // would-be indexed count in dry_run
            }
          } catch (err) {
            record_results.push({ entity_type: etype, record_id, status: 'error', reason: err.message });
            error_count++;
          }
          continue;
        }

        // Live indexing: call indexContentRecord
        try {
          const res = await base44.asServiceRole.functions.invoke('indexContentRecord', {
            entity_type: etype,
            record_id,
            event_type: 'upsert',
            dry_run: false,
          });
          const result = res?.data || {};
          record_results.push({
            entity_type: etype,
            record_id,
            status: result.action || 'unknown',
            chunks_indexed: result.chunks_indexed || 0,
            errors: result.errors || [],
          });
          if (result.success && result.action === 'indexed') {
            indexed_count++;
          } else if (result.action === 'skipped' || result.action === 'no_op') {
            skipped_count++;
          } else {
            error_count++;
          }
        } catch (err) {
          record_results.push({ entity_type: etype, record_id, status: 'error', reason: err.message });
          error_count++;
        }
      }
    }

    return Response.json({
      success: error_count === 0,
      mode: dry_run ? 'dry_run' : 'live',
      entity_types_processed: entity_types_to_process,
      total_records_fetched,
      indexed_count,
      skipped_count,
      error_count,
      record_results,
      batch_size: effective_batch_size,
      offset,
      summary: dry_run
        ? `Dry run: ${total_records_fetched} records fetched. ${indexed_count} would be indexed, ${skipped_count} skipped, ${error_count} errors.`
        : `Backfill complete: ${indexed_count} indexed, ${skipped_count} skipped, ${error_count} errors out of ${total_records_fetched} records.`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});