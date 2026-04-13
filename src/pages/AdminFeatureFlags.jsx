import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const FLAG_KEYS = [
  'THERAPIST_UPGRADE_ENABLED',
  'THERAPIST_UPGRADE_MEMORY_ENABLED',
  'THERAPIST_UPGRADE_WORKFLOW_ENABLED',
];

// Expected "fully upgraded" target state (what preview/sandbox has enabled)
const TARGET_STATE = {
  THERAPIST_UPGRADE_ENABLED: true,
  THERAPIST_UPGRADE_MEMORY_ENABLED: true,
  THERAPIST_UPGRADE_WORKFLOW_ENABLED: true,
};

const FLAG_DESCRIPTIONS = {
  THERAPIST_UPGRADE_ENABLED: 'Master gate — enables the Stage 2 therapist upgrade path.',
  THERAPIST_UPGRADE_MEMORY_ENABLED: 'Phase 1 — structured memory layer (retrieveTherapistMemory / writeTherapistMemory).',
  THERAPIST_UPGRADE_WORKFLOW_ENABLED: 'Phase 3 — therapist workflow engine (context injection + session phases).',
};

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('adminFeatureFlags', { action: 'get' });
    setFlags(res.data.flags);
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const inSync = flags
    ? FLAG_KEYS.every(k => flags[k] === TARGET_STATE[k])
    : false;

  const diffKeys = flags ? FLAG_KEYS.filter(k => flags[k] !== TARGET_STATE[k]) : [];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Therapist Feature Flags</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare production flag settings against the target sandbox configuration.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading flags…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {flags && (
        <>
          {/* Sync Status Banner */}
          <Card className={inSync ? 'border-green-400/60 bg-green-50 dark:bg-green-950/20' : 'border-amber-400/60 bg-amber-50 dark:bg-amber-950/20'}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              {inSync
                ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                : <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />}
              <div>
                <p className="font-semibold text-sm">
                  {inSync ? 'Production matches target (sandbox) settings.' : `${diffKeys.length} flag(s) differ from sandbox target.`}
                </p>
                {!inSync && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Flags out of sync: {diffKeys.join(', ')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flag Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current vs Target</CardTitle>
              <CardDescription className="text-xs">
                "Production" = current server-side env vars. "Target (Sandbox)" = expected fully-upgraded state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FLAG_KEYS.map(key => {
                const prod = flags[key];
                const target = TARGET_STATE[key];
                const diff = prod !== target;
                return (
                  <div key={key} className={`rounded-lg border p-3 ${diff ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/10' : 'border-border'}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-foreground">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Production:</span>
                        {prod
                          ? <Badge className="bg-green-100 text-green-800 border-green-300">true</Badge>
                          : <Badge variant="outline" className="text-red-600 border-red-300">false</Badge>}
                        <span className="text-xs text-muted-foreground">Target:</span>
                        {target
                          ? <Badge className="bg-green-100 text-green-800 border-green-300">true</Badge>
                          : <Badge variant="outline" className="text-red-600 border-red-300">false</Badge>}
                        {diff
                          ? <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          : <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{FLAG_DESCRIPTIONS[key]}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={fetchFlags} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {!inSync && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                To sync production, set the differing flags to their target values in the Base44 dashboard → Settings → Environment Variables.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}