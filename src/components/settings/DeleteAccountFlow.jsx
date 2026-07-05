import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { deleteAccount } from '@/lib/platform';
import { Trash2, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DeleteAccountFlow({ userRole }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState('');
  const [open, setOpen] = useState(false);
  const isAdmin = userRole === 'admin';

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await deleteAccount();
    },
    // onSuccess is a no-op: deleteAccount() calls performLogout() which
    // triggers a full page reload before this callback would run.
    onError: (error) => {
      toast({
        title: t('settings.account.delete_error'),
        description: error?.response?.data?.error || error?.message || t('common.retry'),
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
          data-account-deletion="trigger"
          aria-label={t('settings.account.delete_account')}
          className="w-full rounded-xl border-red-300 text-red-600 active:bg-red-100"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('settings.account.delete_account')}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {t('settings.account.delete_confirm_title')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {isAdmin ? (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    {t('settings.account.delete_admin_blocked')}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700">
                    {t('settings.account.delete_confirm_description')}
                  </p>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-900">
                      {t('settings.account.delete_confirm_label')}
                    </label>
                    <Input
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={t('settings.account.delete_confirm_placeholder')}
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
          <AlertDialogCancel data-testid="delete-account-cancel-button" className="rounded-xl">{t('common.cancel')}</AlertDialogCancel>
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
              {deleteAccountMutation.isPending
                ? t('settings.account.delete_deleting')
                : t('settings.account.delete_confirm_button')}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}