const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

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
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue !== undefined) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	// __TEST_APP_ID__ may be injected by Playwright addInitScript to prevent
	// undefined from propagating into API URLs when no env var is present.
	const envAppId = (!isNode && windowObj.__TEST_APP_ID__) || import.meta.env.VITE_BASE44_APP_ID || import.meta.env.BASE44_APP_ID;
	const envFunctionsVersion = import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || import.meta.env.BASE44_FUNCTIONS_VERSION;
	const resolvedAppId = getAppParamValue("app_id", { defaultValue: envAppId });

	// Diagnostic: missing VITE_BASE44_APP_ID causes requests to use
	// /api/apps/undefined/... which produces 404 API responses.
	// Warn in dev, error in all other environments so the issue is visible in logs.
	if (!isNode && !resolvedAppId) {
		const message =
			'[app-params] VITE_BASE44_APP_ID is not set. ' +
			'API requests will target /api/apps/undefined/... and will fail. ' +
			'Set this variable in your .env file or as a GitHub Actions secret.';
		if (import.meta.env.DEV) {
			console.warn(message);
		} else {
			console.error(message);
		}
	}

	return {
		appId: resolvedAppId,
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.pathname + window.location.search }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: envFunctionsVersion }),
	}
}

export const appParams = {
	...getAppParams()
}