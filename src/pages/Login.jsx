import React, { useEffect, useMemo } from 'react';
import { appParams } from '@/lib/app-params';

const APP_SPECIFIC_BASE44_HOST_SUFFIX = '.base44.app';
const GENERIC_BASE44_AUTH_HOST = 'base44.app';
const FORWARDED_LOGIN_QUERY_KEYS = new Set([
  'app_id',
  'functions_version',
  'next',
  'nextUrl',
]);

function normalizeOrigin(rawValue) {
  if (typeof rawValue !== 'string' || !rawValue.trim()) return null;

  try {
    return new URL(rawValue).origin;
  } catch {
    return null;
  }
}

function isAppSpecificBase44AuthOrigin(rawValue) {
  if (typeof rawValue !== 'string' || !rawValue.trim()) return false;

  try {
    const { hostname, origin } = new URL(rawValue);
    return hostname.endsWith(APP_SPECIFIC_BASE44_HOST_SUFFIX) && hostname !== GENERIC_BASE44_AUTH_HOST && origin !== 'null';
  } catch {
    return false;
  }
}

export function resolveSafeReturnUrl(
  rawValue,
  currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
) {
  const fallback = new URL('/', currentOrigin).toString();
  if (typeof rawValue !== 'string' || !rawValue.trim()) return fallback;

  try {
    const parsed = new URL(rawValue, currentOrigin);
    if (parsed.origin !== currentOrigin) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export function resolveAuthBaseUrl(
  env = import.meta.env,
  location = typeof window !== 'undefined' ? window.location : undefined,
) {
  const configuredAuthBase = normalizeOrigin(env?.VITE_BASE44_AUTH_BASE_URL);
  if (isAppSpecificBase44AuthOrigin(configuredAuthBase)) {
    return configuredAuthBase;
  }

  const configuredAppBase = normalizeOrigin(env?.VITE_BASE44_APP_BASE_URL);
  if (isAppSpecificBase44AuthOrigin(configuredAppBase)) {
    return configuredAppBase;
  }

  const currentOrigin = normalizeOrigin(location?.origin);
  if (isAppSpecificBase44AuthOrigin(currentOrigin)) {
    return currentOrigin;
  }

  return null;
}

export function buildExternalLoginUrl(
  env = import.meta.env,
  location = typeof window !== 'undefined' ? window.location : undefined,
) {
  const authBase = resolveAuthBaseUrl(env, location);
  if (!authBase || !location?.origin) return null;

  const externalLoginUrl = new URL('/login', authBase);
  const incoming = new URLSearchParams(location.search || '');

  incoming.forEach((value, key) => {
    if (!FORWARDED_LOGIN_QUERY_KEYS.has(key)) return;
    externalLoginUrl.searchParams.set(key, value);
  });

  const requestedReturn =
    incoming.get('returnUrl') ||
    incoming.get('from_url') ||
    incoming.get('next') ||
    incoming.get('nextUrl');
  const safeReturnUrl = resolveSafeReturnUrl(requestedReturn, location.origin);
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
