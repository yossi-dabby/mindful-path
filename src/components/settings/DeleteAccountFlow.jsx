import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { performLogout } from '@/lib/platform';
import { Trash2, ShieldAlert } from 'lucide-react';

export default function DeleteAccountFlow({ userRole }) {
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState('');
  const [open, setOpen] = useState(false);
  const isAdmin = userRole === 'admin';

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('deleteMyAccount', {});
      return response.data;
    },
    onSuccess: () => performLogout(),
    onError: (error) => {
      toast({
        title: 'Could not delete account',
        description: error?.response?.data?.error || 'Please try again later.',
        variant: 'destructive',
      });
      setOpen(false);
      setConfirmationText('');
    },
  });

  const handleOpenChange = (val) => {
    setOpen(val);
    if (!val) setConfirmationText('');
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          data-testid="delete-account-button"
          className="w-full rounded-xl border-red-300 text-red-600 active:bg-red-100"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete account &amp; all data
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete your account
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {isAdmin ? (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Admin accounts cannot be deleted from inside the app. Please contact support.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700">
                    This will permanently delete your account and all associated data including journals,
                    goals, mood history, and coaching sessions. <strong>This cannot be undone.</strong>
                  </p>
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
                      autoComplete="off"
                      data-testid="delete-account-input"
                    />
                  </div>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          {!isAdmin && (
            <AlertDialogAction
              data-testid="delete-account-confirm-button"
              onClick={(e) => {
                e.preventDefault();
                deleteAccountMutation.mutate();
              }}
              disabled={confirmationText.trim() !== 'DELETE' || deleteAccountMutation.isPending}
              className="rounded-xl bg-red-600 text-white active:bg-red-700"
            >
              {deleteAccountMutation.isPending ? 'Deleting…' : 'Permanently delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}