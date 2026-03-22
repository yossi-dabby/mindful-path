import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { performLogout } from '@/lib/platform';
import { AlertTriangle, ChevronRight, Trash2, X } from 'lucide-react';

export default function DeleteAccountFlow({ userRole }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [confirmationText, setConfirmationText] = useState('');

  const reset = () => { setStep(0); setConfirmationText(''); };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('deleteMyAccount', {});
      return response.data;
    },
    onSuccess: () => performLogout(),
    onError: (error) => {
      toast({
        title: 'Could not delete account',
        description: error?.response?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  });

  if (userRole === 'admin') {
    return (
      <p className="text-xs text-amber-800 mt-1">
        Admin accounts can't be deleted from inside the app.
      </p>
    );
  }

  // Step 0: just the trigger button
  if (step === 0) {
    return (
      <Button
        variant="outline"
        onClick={() => setStep(1)}
        className="w-full rounded-xl border-red-300 text-red-600 active:bg-red-100"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete account &amp; all data
      </Button>
    );
  }

  // Step 1: warning + confirm / cancel
  if (step === 1) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">
            This permanently deletes your profile, all journals, goals, mood history, and coaching data.
            <strong> This cannot be undone.</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="flex-1 rounded-xl">
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button
            onClick={() => setStep(2)}
            className="flex-1 rounded-xl bg-red-600 text-white active:bg-red-700"
          >
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: type DELETE to confirm
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          Type <span className="font-mono font-bold">DELETE</span> to confirm
        </label>
        <Input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="DELETE"
          className="rounded-xl bg-white"
          autoCapitalize="characters"
        />
        <p className="mt-1 text-xs text-gray-500">This action cannot be undone.</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          disabled={deleteAccountMutation.isPending}
          className="flex-1 rounded-xl"
        >
          Back
        </Button>
        <Button
          onClick={() => deleteAccountMutation.mutate()}
          disabled={confirmationText.trim() !== 'DELETE' || deleteAccountMutation.isPending}
          className="flex-1 rounded-xl bg-red-600 text-white active:bg-red-700"
        >
          {deleteAccountMutation.isPending ? 'Deleting…' : 'Permanently delete'}
        </Button>
      </div>
    </div>
  );
}