import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Send an in-app notification (and optionally an email) to a user.
 * 
 * Payload:
 *   user_email: string       - recipient email
 *   title: string            - notification title
 *   message: string          - notification body
 *   type: string             - notification type (goal_reminder | progress_update | etc.)
 *   priority?: string        - low | normal | high | critical (default: normal)
 *   action_url?: string      - optional in-app link
 *   reference_id?: string    - related entity ID
 *   send_email?: boolean     - force email even if not a critical type (default: false)
 */

// Types that always trigger an email regardless of user prefs override
const ALWAYS_EMAIL_TYPES = ['mention', 'system'];

// Maps notification type → user preference key
const TYPE_TO_PREF = {
  goal_reminder: 'goalReminders',
  exercise_reminder: 'exerciseReminders',
  daily_checkin: 'dailyReminders',
  progress_update: 'progressUpdates',
  streak_alert: 'progressUpdates',
  session_summary: 'progressUpdates',
  mention: 'emailMentions',
  system: 'emailCritical'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      user_email,
      title,
      message,
      type = 'system',
      priority = 'normal',
      action_url,
      reference_id,
      send_email = false
    } = body;

    if (!user_email || !title || !message) {
      return Response.json({ error: 'user_email, title and message are required' }, { status: 400 });
    }

    // Create the in-app notification (service role so it works for any user)
    const notification = await base44.asServiceRole.entities.AppNotification.create({
      title,
      message,
      type,
      priority,
      action_url: action_url || null,
      reference_id: reference_id || null,
      is_read: false,
      email_sent: false
    });

    // Determine whether to send email
    // Fetch target user's notification preferences
    let shouldSendEmail = send_email || ALWAYS_EMAIL_TYPES.includes(type) || priority === 'critical';

    if (!shouldSendEmail) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
        const targetUser = users?.[0];
        const prefs = targetUser?.preferences?.notifications || {};
        const emailPrefs = targetUser?.preferences?.emailNotifications || {};

        const prefKey = TYPE_TO_PREF[type];
        // Check if user has enabled email for this notification type
        if (prefKey && emailPrefs[prefKey]) {
          shouldSendEmail = true;
        }
      } catch (_e) {
        // non-blocking
      }
    }

    if (shouldSendEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user_email,
          subject: `[MindCompanion] ${title}`,
          body: `
<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f8fffe; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #26A69A; margin: 0; font-weight: 600;">MindCompanion</h2>
  </div>
  <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h3 style="color: #1A3A34; margin-top: 0;">${title}</h3>
    <p style="color: #5A7A72; line-height: 1.6;">${message}</p>
    ${action_url ? `<a href="${action_url}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #26A69A; color: white; text-decoration: none; border-radius: 24px; font-weight: 500;">Open App</a>` : ''}
  </div>
  <p style="text-align: center; color: #9AA8A4; font-size: 12px; margin-top: 24px;">
    You're receiving this because you enabled email notifications in your MindCompanion settings.<br/>
    <a href="#" style="color: #26A69A;">Manage preferences</a>
  </p>
</div>`
        });

        // Mark email as sent
        await base44.asServiceRole.entities.AppNotification.update(notification.id, { email_sent: true });
      } catch (emailErr) {
        console.error('[sendNotification] Email failed:', emailErr.message);
      }
    }

    return Response.json({ success: true, notification_id: notification.id, email_sent: shouldSendEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});