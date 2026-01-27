/**
 * PROMPT TESTING GUIDE - Using Golden Scenarios
 * 
 * Shows how to integrate golden scenarios into Playwright tests
 * for eval-driven prompt improvements across all 3 surfaces
 */

import { GOLDEN_SCENARIOS, validateScenario } from './goldenScenarios.js';

/**
 * Example 1: Test Hard Refusal for Medical Questions
 * Applies to: therapist_chat, ai_companion, coach_chat
 */
export const testMedicalRefusal = async ({ page, surface }) => {
  const scenario = Object.values(GOLDEN_SCENARIOS).find(
    s => s.name === "Medical/Diagnostic Refusal"
  );

  for (const input of scenario.inputs) {
    // Send message to the appropriate surface
    if (surface === 'therapist_chat') {
      await page.goto('/Chat');
      await page.locator('[data-testid="therapist-chat-input"]').fill(input);
      await page.locator('[data-testid="therapist-chat-send"]').click();
    } else if (surface === 'ai_companion') {
      await page.locator('[data-testid="ai-companion-input"]').fill(input);
      await page.locator('[data-testid="ai-companion-send"]').click();
    } else if (surface === 'coach_chat') {
      await page.goto('/Coach');
      await page.locator('[data-testid="coach-chat-input"]').fill(input);
      await page.locator('[data-testid="coach-chat-send"]').click();
    }

    // Get AI response
    await page.waitForTimeout(1000); // Wait for response
    const responseText = await page.locator('[data-testid*="messages"]')
      .last()
      .textContent();

    // Validate using scenario expectations
    const result = validateScenario(input, scenario.name, {
      content: responseText,
      ui_state: {},
      blocked_send: false
    });

    console.assert(result.passed, `Failed for "${input}": ${result.failures.join(', ')}`);
  }
};

/**
 * Example 2: Test Crisis Detection Blocks Send
 * Applies to: therapist_chat, ai_companion, coach_chat
 */
export const testCrisisDetection = async ({ page, surface }) => {
  const scenario = Object.values(GOLDEN_SCENARIOS).find(
    s => s.name === "Crisis/Safety Detection"
  );

  for (const input of scenario.inputs) {
    // Navigate to surface
    if (surface === 'therapist_chat') {
      await page.goto('/Chat');
    } else if (surface === 'ai_companion') {
      // AI Companion is global, so it's accessible from any page
      await page.goto('/');
    } else if (surface === 'coach_chat') {
      await page.goto('/Coach');
    }

    // Try to send crisis message
    const inputSelector = surface === 'therapist_chat' 
      ? '[data-testid="therapist-chat-input"]'
      : surface === 'ai_companion'
      ? '[data-testid="ai-companion-input"]'
      : '[data-testid="coach-chat-input"]';

    const sendSelector = surface === 'therapist_chat'
      ? '[data-testid="therapist-chat-send"]'
      : surface === 'ai_companion'
      ? '[data-testid="ai-companion-send"]'
      : '[data-testid="coach-chat-send"]';

    await page.locator(inputSelector).fill(input);
    
    // Risk panel should appear
    const riskPanel = page.locator('[data-testid="inline-risk-panel"]');
    
    // Message should be blocked (send button disabled)
    const sendBtn = page.locator(sendSelector);
    expect(await sendBtn.isDisabled()).toBe(true);
    
    // Risk panel should be visible
    expect(await riskPanel.isVisible()).toBe(true);
    
    // Panel should contain helpline
    const panelText = await riskPanel.textContent();
    expect(panelText).toContain('988');
  }
};

/**
 * Example 3: Test Therapy Mode Activation
 * Applies to: therapist_chat
 */
export const testThoughtWorkMode = async ({ page }) => {
  const scenario = Object.values(GOLDEN_SCENARIOS).find(
    s => s.name === "Thought Work Mode Activation"
  );

  await page.goto('/Chat');

  for (const input of scenario.inputs) {
    await page.locator('[data-testid="therapist-chat-input"]').fill(input);
    await page.locator('[data-testid="therapist-chat-send"]').click();

    // Get response
    await page.waitForTimeout(1000);
    const response = await page.locator('[data-testid="chat-messages"]')
      .last()
      .textContent();

    // Validate single question
    const questionCount = (response.match(/\?/g) || []).length;
    expect(questionCount).toBe(1);

    // Should follow thought work structure
    expect(response).toContain('thought');
    expect(response).toContain('?');
  }
};

/**
 * Example 4: Test Session Summary Override
 * Applies to: therapist_chat, coach_chat
 */
export const testSessionSummaryOverride = async ({ page, surface }) => {
  const scenario = Object.values(GOLDEN_SCENARIOS).find(
    s => s.name === "Session Summary Override (Highest Priority)"
  );

  // Navigate to surface
  if (surface === 'therapist_chat') {
    await page.goto('/Chat');
  } else if (surface === 'coach_chat') {
    await page.goto('/Coach');
  }

  // Send multiple messages to build up conversation
  const warmupMessages = [
    "I've been feeling anxious lately",
    "It's about work stress",
    "I worry about making mistakes"
  ];

  for (const msg of warmupMessages) {
    const inputSelector = surface === 'therapist_chat'
      ? '[data-testid="therapist-chat-input"]'
      : '[data-testid="coach-chat-input"]';
    const sendSelector = surface === 'therapist_chat'
      ? '[data-testid="therapist-chat-send"]'
      : '[data-testid="coach-chat-send"]';

    await page.locator(inputSelector).fill(msg);
    await page.locator(sendSelector).click();
    await page.waitForTimeout(500);
  }

  // Now send summary request
  const summaryInput = "Can you give me a summary?";
  const inputSelector = surface === 'therapist_chat'
    ? '[data-testid="therapist-chat-input"]'
    : '[data-testid="coach-chat-input"]';
  const sendSelector = surface === 'therapist_chat'
    ? '[data-testid="therapist-chat-send"]'
    : '[data-testid="coach-chat-send"]';

  await page.locator(inputSelector).fill(summaryInput);
  await page.locator(sendSelector).click();

  // Wait for summary response
  await page.waitForTimeout(2000);

  // Validate summary content
  const response = await page.locator('[data-testid*="messages"]')
    .last()
    .textContent();

  expect(response.toLowerCase()).toContain('summary');
  expect(response).toMatch(/takeaway|key|insight/i);
};

/**
 * Example 5: Test No Blocking Overlays
 * Applies to: therapist_chat, ai_companion, coach_chat
 */
export const testNoBlockingOverlays = async ({ page, surface }) => {
  // Navigate to surface
  if (surface === 'therapist_chat') {
    await page.goto('/Chat');
  } else if (surface === 'ai_companion') {
    await page.goto('/');
  } else if (surface === 'coach_chat') {
    await page.goto('/Coach');
  }

  // Get viewport size
  const viewport = page.viewportSize();

  // Find all input and button elements
  const inputSelectors = [
    '[data-testid="therapist-chat-input"]',
    '[data-testid="ai-companion-input"]',
    '[data-testid="coach-chat-input"]'
  ];

  for (const selector of inputSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      // Element should have valid bounding box (not covered)
      const box = await element.boundingBox();
      expect(box).not.toBeNull();
      
      // Should be clickable
      expect(await element.isEnabled()).toBe(true);
      
      // Should not be behind full-screen overlay
      if (viewport && viewport.width < 1000) {
        // Mobile: check it's not pushed off screen
        expect(box.y + box.height).toBeLessThan(viewport.height);
      }
    }
  }

  // Verify no modal dialogs
  const modalCount = await page.locator('dialog').count();
  expect(modalCount).toBe(0);
};

/**
 * Example 6: Validate Consent Banner is Non-Blocking
 * Applies to: therapist_chat, ai_companion, coach_chat
 */
export const testConsentBannerNonBlocking = async ({ page, surface }) => {
  // Clear consent to force banner
  await page.context().clearCookies();
  localStorage.removeItem('chat_consent_accepted');

  // Navigate
  if (surface === 'therapist_chat') {
    await page.goto('/Chat');
  } else if (surface === 'ai_companion') {
    await page.goto('/');
  } else if (surface === 'coach_chat') {
    await page.goto('/Coach');
  }

  // Banner should be visible
  const banner = page.locator('[data-testid="consent-banner"]');
  expect(await banner.isVisible()).toBe(true);

  // Input should still be accessible
  const inputSelectors = [
    '[data-testid="therapist-chat-input"]',
    '[data-testid="ai-companion-input"]',
    '[data-testid="coach-chat-input"]'
  ];

  for (const selector of inputSelectors) {
    const input = page.locator(selector).first();
    if (await input.isVisible()) {
      expect(await input.isEnabled()).toBe(true);
    }
  }

  // Accept button should work
  const acceptBtn = page.locator('[data-testid="consent-accept"]');
  expect(await acceptBtn.isEnabled()).toBe(true);
  
  await acceptBtn.click();

  // Banner should disappear
  expect(await banner.isVisible()).toBe(false);
};

export default {
  testMedicalRefusal,
  testCrisisDetection,
  testThoughtWorkMode,
  testSessionSummaryOverride,
  testNoBlockingOverlays,
  testConsentBannerNonBlocking
};