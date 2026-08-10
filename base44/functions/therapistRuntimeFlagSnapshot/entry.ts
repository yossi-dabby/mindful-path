import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import {
  THERAPIST_RUNTIME_FLAG_SCHEMA,
  buildTherapistRuntimeFlagSnapshot,
} from './runtimeFlagContract.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const flags = buildTherapistRuntimeFlagSnapshot((envName) => Deno.env.get(envName));

  return Response.json({
    schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
    flags,
    generated_at: new Date().toISOString(),
  });
});
