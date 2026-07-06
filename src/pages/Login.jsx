import React, { useEffect } from 'react';
import { appParams } from '@/lib/app-params';
import { buildExternalLoginUrl } from '@/lib/loginBridge';

export default function Login() {
  const loginUrl = buildExternalLoginUrl({ appConfig: appParams });

  useEffect(() => {
    if (!loginUrl) return;
    // Replace the bridge URL to avoid an immediate back-navigation bounce to /login.
    window.location.replace(loginUrl);
  }, [loginUrl]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={loginUrl ? 'Redirecting to sign in' : 'Sign in configuration unavailable'}
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgb(var(--bg, 248 248 246))' }}
    >
      {loginUrl ? (
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" aria-hidden="true" />
      ) : (
        <p className="max-w-sm px-6 text-center text-sm text-slate-700">
          Sign-in is temporarily unavailable because the Base44 auth host is not configured.
        </p>
      )}
    </div>
  );
}
