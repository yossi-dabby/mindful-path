const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// Strings that localStorage may contain as serialized null/undefined — treat as missing.
const _INVALID_STORED_VALUES = new Set(['null', 'undefined', '']);

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam && !_INVALID_STORED_VALUES.has(searchParam)) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	// Only use defaultValue when it is a non-empty, non-null meaningful string.
	if (typeof defaultValue === 'string' && defaultValue !== '' && !_INVALID_STORED_VALUES.has(defaultValue)) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue && !_INVALID_STORED_VALUES.has(storedValue)) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	const envAppId = import.meta.env.VITE_BASE44_APP_ID || import.meta.env.BASE44_APP_ID;
	const envFunctionsVersion = import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || import.meta.env.BASE44_FUNCTIONS_VERSION;
	const resolvedAppId = getAppParamValue("app_id", { defaultValue: envAppId });

	// Dev-only diagnostic: log the resolved appId and its source so it is
	// visible in the browser console on every cold-start.
	if (import.meta.env.DEV && !isNode) {
		const urlParam = new URLSearchParams(window.location.search).get('app_id');
		const lsRaw = storage.getItem('base44_app_id');
		const lsValue = lsRaw && !_INVALID_STORED_VALUES.has(lsRaw) ? lsRaw : null;
		const source = urlParam   ? 'URL param (app_id)'
		             : envAppId   ? 'env var (VITE_BASE44_APP_ID / BASE44_APP_ID)'
		             : lsValue    ? 'localStorage (base44_app_id)'
		             : 'none';
		if (resolvedAppId) {
			// eslint-disable-next-line no-console
			console.debug(`[app-params] appId resolved: "${resolvedAppId}" (source: ${source})`);
		} else {
			// eslint-disable-next-line no-console
			console.warn(
				`[app-params] appId is null — checked ${source}. ` +
				'Set VITE_BASE44_APP_ID at build time (Vite requires build-time env vars). ' +
				'API requests will target /api/apps/null/... and will fail.'
			);
		}
	}

	return {
		appId: resolvedAppId,
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: envFunctionsVersion }),
	}
}

export const appParams = {
	...getAppParams()
}