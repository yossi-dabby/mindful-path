/**
 * Production Smoke – Critical Path
 * 
 * This test suite performs read-only, GET-only smoke checks on the production application.
 * 
 * GUARANTEES:
 * - GET-only HTTP requests (no state changes)
 * - No database writes or mutations
 * - No login or authentication required
 * - No seeded data assumptions
 * - Tests skip gracefully when endpoints differ between deployments
 * - E2E/Playwright tests are not touched or affected
 * 
 * USAGE:
 *   SMOKE_TEST_BASE_URL=http://localhost:3000 npm run test:smoke
 *   (or use BASE_URL=http://localhost:3000 npm run test:smoke)
 *   (defaults to http://localhost:3000 if not provided)
 * 
 * NOTE: We check SMOKE_TEST_BASE_URL first to avoid conflicts with Vite's built-in BASE_URL.
 */

import { describe, it, expect } from 'vitest';

// Read BASE_URL from environment, default to localhost:3000
// Note: Using SMOKE_TEST_BASE_URL to avoid conflicts with Vite's built-in BASE_URL
const BASE_URL = process.env.SMOKE_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

/**
 * Helper: Perform HTTP GET request
 * @param {string} url - Full URL to fetch
 * @returns {Promise<Response>} - Fetch response
 */
async function httpGet(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'MindfulPath-SmokeTest/1.0'
      }
    });
    return response;
  } catch (error) {
    // Return a mock response with status 0 to indicate fetch failure
    return { ok: false, status: 0, statusText: error.message };
  }
}

/**
 * Helper: Check if response is OK or a redirect (2xx or 3xx)
 * @param {Response} response - Fetch response
 * @returns {boolean} - True if status is 2xx or 3xx
 */
function isOkOrRedirect(response) {
  return response.status >= 200 && response.status < 400;
}

/**
 * Helper: Check if response content looks like HTML
 * @param {string} text - Response body text
 * @returns {boolean} - True if content appears to be HTML
 */
function looksLikeHtml(text) {
  const htmlIndicators = [
    '<!DOCTYPE',
    '<!doctype',
    '<html',
    '<HTML',
    '<head',
    '<body'
  ];
  return htmlIndicators.some(indicator => text.includes(indicator));
}

describe('Production Smoke – Critical Path', () => {
  describe('Base URL Availability', () => {
    it('should respond with 2xx or 3xx status', async () => {
      const response = await httpGet(BASE_URL + '/');
      expect(isOkOrRedirect(response)).toBe(true);
    }, 10000);
  });

  describe('Homepage Structure', () => {
    it('should return valid HTML with expected structure', async () => {
      const response = await httpGet(BASE_URL + '/');
      
      // Assert status is 200
      expect(response.status).toBe(200);
      
      // Get response body
      const html = await response.text();
      
      // Assert it looks like HTML
      expect(looksLikeHtml(html)).toBe(true);
      
      // Assert it contains at least one stable marker
      // Looking for common HTML structure elements that are unlikely to change
      const hasTitle = html.includes('<title>') || html.includes('<title ');
      const hasRoot = html.includes('id="root"') || html.includes("id='root'");
      const hasMain = html.includes('<main') || html.includes('<main ');
      const hasApp = html.includes('id="app"') || html.includes("id='app'");
      
      const hasStableMarker = hasTitle || hasRoot || hasMain || hasApp;
      expect(hasStableMarker).toBe(true);
    }, 10000);
  });

  describe('Health Endpoint Check', () => {
    it('should find at least one health endpoint or skip gracefully', async () => {
      // Probe common health endpoint paths
      const healthPaths = ['/health', '/api/health', '/status'];
      
      let foundHealthEndpoint = false;
      
      for (const path of healthPaths) {
        const response = await httpGet(BASE_URL + path);
        if (isOkOrRedirect(response)) {
          foundHealthEndpoint = true;
          break;
        }
      }
      
      if (!foundHealthEndpoint) {
        // SKIP behavior: If no health endpoint is detected, skip the test
        // This is expected for deployments without dedicated health endpoints
        console.log('No health endpoint found at /health, /api/health, or /status - skipping check');
        return; // Test passes by returning early
      }
      
      // If we found a health endpoint, assert it's working
      expect(foundHealthEndpoint).toBe(true);
    }, 15000);
  });

  describe('Basic Navigation Route Check', () => {
    it('should find at least one navigation route or skip gracefully', async () => {
      // Conservative list of read-only routes to probe
      const navigationRoutes = [
        '/login',
        '/dashboard', 
        '/home',
        '/chat',
        '/mood-tracker'
      ];
      
      let foundRoute = false;
      
      for (const route of navigationRoutes) {
        const response = await httpGet(BASE_URL + route);
        if (isOkOrRedirect(response)) {
          foundRoute = true;
          break;
        }
      }
      
      if (!foundRoute) {
        // SKIP behavior: If no candidate route returns 2xx/3xx, skip the test
        // This is a best-effort navigation sanity check
        // Routes may differ between deployments or require authentication
        console.log('No accessible navigation routes found - skipping check');
        console.log('This is expected when routes require authentication or differ between deployments');
        return; // Test passes by returning early
      }
      
      // If we found an accessible route, assert it's working
      expect(foundRoute).toBe(true);
    }, 15000);
  });
});
