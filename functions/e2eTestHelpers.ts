/**
 * E2E Test Helper - Shared utilities for Playwright tests
 * 
 * Helps diagnose and prevent page closure issues
 */

export const testHelpers = {
  /**
   * Safe page interaction with closure detection
   */
  async safePageAction(page, action, label = 'action') {
    if (page.isClosed?.()) {
      throw new Error(`[PAGE CLOSED] Cannot perform ${label} - page already closed`);
    }
    
    try {
      return await action();
    } catch (error) {
      if (error.message?.includes('closed') || error.message?.includes('Target page')) {
        throw new Error(`[PAGE CLOSED] ${label} failed: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Setup page closure diagnostics
   */
  setupClosureDiagnostics(page) {
    const diagnostics = {
      closedAt: null,
      closeReason: null,
      lastUrl: page.url(),
      errors: [],
      navigationEvents: []
    };

    page.on('close', () => {
      diagnostics.closedAt = new Date().toISOString();
      diagnostics.closeReason = 'Page closed event fired';
      console.error('[PAGE CLOSED]', diagnostics);
    });

    page.on('error', (err) => {
      diagnostics.errors.push({ time: Date.now(), message: err.message });
      console.error('[PAGE ERROR]', err.message);
    });

    page.on('framenavigated', () => {
      const newUrl = page.url();
      if (newUrl !== diagnostics.lastUrl) {
        diagnostics.navigationEvents.push({
          from: diagnostics.lastUrl,
          to: newUrl,
          time: Date.now()
        });
        diagnostics.lastUrl = newUrl;
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('[APP ERROR]', msg.text());
      }
    });

    return diagnostics;
  },

  /**
   * Wait for chat input to be ready and interactable
   */
  async waitForChatReady(page, timeout = 10000) {
    if (page.isClosed?.()) {
      throw new Error('Page closed before chat ready check');
    }

    await page.waitForSelector('[data-testid="therapist-chat-input"]', { timeout });
    
    if (page.isClosed?.()) {
      throw new Error('Page closed while waiting for chat input');
    }

    const input = page.locator('[data-testid="therapist-chat-input"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });

    if (page.isClosed?.()) {
      throw new Error('Page closed after locating chat input');
    }

    return input;
  },

  /**
   * Safely send chat message with fallback
   */
  async sendChatMessage(page, message, timeout = 10000) {
    if (page.isClosed?.()) {
      throw new Error('Page closed before send');
    }

    const input = page.locator('[data-testid="therapist-chat-input"]');
    const sendBtn = page.locator('[data-testid="therapist-chat-send"]');

    // Fill input
    await input.fill(message);
    
    if (page.isClosed?.()) {
      throw new Error('Page closed after filling input');
    }

    // Try button click first
    let sent = false;
    try {
      if (!page.isClosed?.()) {
        await sendBtn.click({ timeout: 5000 });
        sent = true;
      }
    } catch (e) {
      console.warn('[BUTTON CLICK FAILED]', e.message);
      // Fallback to Enter
      if (!page.isClosed?.()) {
        await input.press('Enter');
        sent = true;
      }
    }

    if (!sent) {
      throw new Error('Could not send message');
    }

    if (page.isClosed?.()) {
      throw new Error('Page closed after sending message');
    }

    return sent;
  },

  /**
   * Verify page health after action
   */
  async verifyPageHealth(page) {
    if (page.isClosed?.()) {
      return false;
    }

    try {
      const root = page.locator('[data-testid="chat-root"]');
      return await root.isVisible({ timeout: 1000 }).catch(() => false);
    } catch {
      return false;
    }
  }
};

export default testHelpers;