import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { buildRuntimeCapabilitySnapshot } from '@/lib/runtimeCapabilityDiagnostic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

/**
 * AiRuntimeCapabilitiesPanel
 *
 * Admin diagnostic — read only.
 *
 * Displays the canonical AI runtime capability snapshot for the CBT Therapist
 * and AI Companion agents.  Shows which AI capabilities are ACTUALLY active at
 * runtime rather than merely configured in env vars.
 *
 * SAFETY RULES:
 *   - Shown only to admin users (enforced both here and in the backend function).
 *   - No secret values, API keys, or credentials are displayed.
 *   - No private user data, conversation content, or formulation content.
 *   - This panel is read-only and diagnostic-only.
 *   - No action buttons that change flag values or agent behavior.
 *   - Backend function enforces admin-only independently (403 for non-admin).
 *
 * @param {{ user: object }} props
 */
export default function AiRuntimeCapabilitiesPanel({ user }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Frontend-derived fields (flag registry + wiring resolvers)
      const frontendFields = buildRuntimeCapabilitySnapshot();

      // Backend-derived fields (admin-only Deno function)
      const backendRes = await base44.functions.invoke('adminRuntimeDiagnostic');
      const backendFields = backendRes?.data ?? {};

      setSnapshot({ ...frontendFields, ...backendFields });
    } catch (err) {
      setError(err?.message || 'Failed to load diagnostic snapshot');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only load for admin users — frontend gate in addition to backend gate
    if (user?.role === 'admin') {
      loadSnapshot();
    }
  }, [user, loadSnapshot]);

  // ── Non-admin gate ─────────────────────────────────────────────────────────
  if (!user || user.role !== 'admin') {
    return null;
  }

  // ── Helper renderers ───────────────────────────────────────────────────────

  function CapabilityBadge({ value, unusedLabel }) {
    if (unusedLabel) {
      return (
        <Badge variant="outline" className="text-muted-foreground border-dashed text-xs">
          Configured but unused
        </Badge>
      );
    }
    if (value === true) {
      return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Enabled</Badge>;
    }
    if (value === false) {
      return <Badge variant="outline" className="text-muted-foreground text-xs">Disabled</Badge>;
    }
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Unavailable</Badge>
    );
  }

  function CapabilityRow({ label, value, unusedLabel, mono }) {
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
        <span className={`text-xs ${mono ? 'font-mono' : ''} text-muted-foreground`}>{label}</span>
        {unusedLabel
          ? <CapabilityBadge unusedLabel />
          : typeof value === 'string'
            ? <span className="font-mono text-xs text-foreground">{value}</span>
            : <CapabilityBadge value={value} />
        }
      </div>
    );
  }

  function Section({ title, children }) {
    return (
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3">{title}</p>
        {children}
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
              AI Runtime Capabilities
            </CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
              <Info className="w-3 h-3 flex-shrink-0" />
              Admin diagnostic — read only. Reflects actual runtime state, not mere env-var presence.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSnapshot}
            disabled={loading}
            className="gap-1.5 text-xs h-7 px-2 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-1">
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs p-2 rounded border border-destructive/30 bg-destructive/5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading && !snapshot && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Loading capability snapshot…
          </div>
        )}

        {snapshot && (
          <div className="space-y-0">

            {/* ── CBT Therapist ─────────────────────────────────────────── */}
            <Section title="CBT Therapist — Active Wiring">
              <CapabilityRow label="Master gate"              value={snapshot.therapist_master_enabled} />
              <CapabilityRow label="Selected wiring"         value={snapshot.selected_therapist_wiring} mono />
              <CapabilityRow label="Stage"                   value={snapshot.selected_therapist_stage} />
              <CapabilityRow label="Phase"                   value={snapshot.selected_therapist_phase} />
            </Section>

            <Section title="CBT Therapist — Frontend Flags">
              <CapabilityRow label="Workflow engine"             value={snapshot.workflow_enabled} />
              <CapabilityRow label="Retrieval orchestration"     value={snapshot.retrieval_orchestration_enabled} />
              <CapabilityRow label="Live retrieval (allowlist)"  value={snapshot.live_retrieval_enabled} />
              <CapabilityRow label="Safety mode"                 value={snapshot.safety_mode_enabled} />
              <CapabilityRow label="Formulation context"         value={snapshot.formulation_context_enabled} />
              <CapabilityRow label="Formulation-led"             value={snapshot.formulation_led_effective} />
              <CapabilityRow label="Continuity layer"            value={snapshot.continuity_layer_enabled} />
              <CapabilityRow label="Strategy layer"              value={snapshot.strategy_layer_enabled} />
              <CapabilityRow label="Longitudinal layer"          value={snapshot.longitudinal_layer_enabled} />
              <CapabilityRow label="Knowledge layer"             value={snapshot.knowledge_layer_enabled} />
              <CapabilityRow label="Competence layer"            value={snapshot.competence_layer_enabled} />
              <CapabilityRow label="Planner-first (V12)"         value={snapshot.planner_first_enabled} />
              <CapabilityRow label="Action-first demotion (wiring)" value={snapshot.action_first_demotion_present} />
            </Section>

            <Section title="CBT Therapist — Backend Flags">
              <CapabilityRow label="Memory backend"          value={snapshot.therapist_memory_backend_enabled} />
              <CapabilityRow label="Summarization backend"   value={snapshot.therapist_summarization_backend_enabled} />
              <CapabilityRow label="Longitudinal backend"    value={snapshot.therapist_longitudinal_backend_enabled} />
              <CapabilityRow label="Trusted ingestion"       value={snapshot.trusted_ingestion_backend_enabled} />
            </Section>

            {/* ── AI Companion ──────────────────────────────────────────── */}
            <Section title="AI Companion — Active Wiring">
              <CapabilityRow label="Master gate"         value={snapshot.companion_master_enabled} />
              <CapabilityRow label="Selected wiring"     value={snapshot.selected_companion_wiring} mono />
              <CapabilityRow label="Warmth layer"        value={snapshot.companion_warmth_enabled} />
              <CapabilityRow label="Continuity layer"    value={snapshot.companion_continuity_enabled} />
            </Section>

            {/* ── Knowledge Infrastructure ──────────────────────────────── */}
            <Section title="Knowledge Infrastructure — Backend">
              <CapabilityRow label="Knowledge retrieval"  value={snapshot.knowledge_retrieval_backend_enabled} />
              <CapabilityRow label="Knowledge index"      value={snapshot.knowledge_index_backend_enabled} />
            </Section>

            {/* ── Super CBT Agent ───────────────────────────────────────── */}
            <Section title="Super CBT Agent (Scaffold Only)">
              <CapabilityRow label="Flag configured (VITE env)"   value={snapshot.super_cbt_flag_configured} />
              <CapabilityRow label="Routed in production"         value={snapshot.super_cbt_routed_in_production} />
            </Section>

            {/* ── Configured-but-unused secrets ─────────────────────────── */}
            {Array.isArray(snapshot.configured_but_unused) && snapshot.configured_but_unused.length > 0 && (
              <Section title="Configured-but-unused Secret Names">
                {snapshot.configured_but_unused.map((name) => (
                  <CapabilityRow key={name} label={name} unusedLabel mono />
                ))}
              </Section>
            )}

            {/* ── Metadata ──────────────────────────────────────────────── */}
            <div className="pt-2 text-xs text-muted-foreground/60 border-t border-border/30 mt-2">
              Diagnostic v{snapshot.diagnostic_version} · generated {snapshot.generated_at}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
