import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { performLogout } from '@/lib/platform';
import { AlertTriangle, ChevronRight, Trash2 } from 'lucide-react';

export default function DeleteAccountFlow({ userRole }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [confirmationText, setConfirmationText] = useState('');

  const resetFlow = () => {
    setStep(0);
    setConfirmationText('');
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('deleteMyAccount', {});
      return response.data;
    },
    onSuccess: () => {
      performLogout();
    },
    onError: (error) => {
      toast({
        title: 'Could not delete account',
        description: error?.response?.data?.error,
        variant: 'destructive',
      });
    }
  });

  if (userRole === 'admin') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">Admin and app-owner accounts can’t be deleted from inside the app.</p>
        <p className="mt-1 text-xs text-amber-800">Use a non-admin account for self-service deletion.</p>
      </div>
    );
  }

  if (step === 0) {
    return (
      <Button
        variant="outline"
        onClick={() => setStep(1)}
        className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete account
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-red-900">Delete your account</h4>
          <p className="mt-1 text-sm text-red-800">This permanently removes your account and you will lose access immediately.</p>
        </div>
      </div>

      <div className="rounded-lg bg-white/70 p-3">
        <p className="text-sm font-medium text-gray-900">This will permanently delete:</p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Your profile and preferences</li>
          <li>Mood tracking history</li>
          <li>Journal entries and reminders</li>
          <li>Goals, progress, and coaching data</li>
          <li>Saved items and app activity</li>
        </ul>
      </div>

      {step === 1 && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetFlow} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">Type DELETE to confirm</label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="rounded-xl bg-white"
            />
            <p className="mt-2 text-xs text-gray-600">This action cannot be undone.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} disabled={deleteAccountMutation.isPending} className="flex-1 rounded-xl">Back</Button>
            <Button
              onClick={() => deleteAccountMutation.mutate()}
              disabled={confirmationText.trim() !== 'DELETE' || deleteAccountMutation.isPending}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteAccountMutation.isPending ? 'Deleting…' : 'Permanently delete'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}