import React, { useEffect, useMemo } from 'react';
import { appParams } from '@/lib/app-params';

const DEFAULT_BASE44_AUTH_BASE_URL = 'https://base44.app';
const FORWARDED_LOGIN_QUERY_KEYS = new Set([
  'app_id',
  'functions_version',
  'next',
  'nextUrl',
]);

function resolveSafeReturnUrl(rawValue) {
  const fallback = `${window.location.origin}/`;
  if (typeof rawValue !== 'string' || !rawValue.trim()) return fallback;

  try {
    const parsed = new URL(rawValue, window.location.origin);
    if (parsed.origin !== window.location.origin) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

function buildExternalLoginUrl() {
  const authBase = import.meta.env.VITE_BASE44_AUTH_BASE_URL || DEFAULT_BASE44_AUTH_BASE_URL;
  const externalLoginUrl = new URL('/login', authBase);
  const incoming = new URLSearchParams(window.location.search);

  incoming.forEach((value, key) => {
    if (!FORWARDED_LOGIN_QUERY_KEYS.has(key)) return;
    externalLoginUrl.searchParams.set(key, value);
  });

  const requestedReturn =
    incoming.get('returnUrl') ||
    incoming.get('from_url') ||
    incoming.get('next') ||
    incoming.get('nextUrl');
  const safeReturnUrl = resolveSafeReturnUrl(requestedReturn);
  externalLoginUrl.searchParams.set('returnUrl', safeReturnUrl);
  externalLoginUrl.searchParams.set('from_url', safeReturnUrl);

  setParamIfNotPresent(externalLoginUrl.searchParams, 'app_id', appParams.appId);
  setParamIfNotPresent(externalLoginUrl.searchParams, 'functions_version', appParams.functionsVersion);

  return externalLoginUrl.toString();
}

function setParamIfNotPresent(searchParams, key, value) {
  if (!value || searchParams.get(key)) return;
  searchParams.set(key, value);
}

export default function Login() {
  const loginUrl = useMemo(() => buildExternalLoginUrl(), []);

  useEffect(() => {
    // Replace the bridge URL to avoid an immediate back-navigation bounce to /login.
    window.location.replace(loginUrl);
  }, [loginUrl]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Redirecting to sign in"
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgb(var(--bg, 248 248 246))' }}
    >
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}
