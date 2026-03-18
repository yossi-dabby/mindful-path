import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const USER_OWNED_ENTITIES = [
  'Goal',
  'GoalReminder',
  'MoodEntry',
  'ThoughtJournal',
  'JournalTemplate',
  'JournalReminder',
  'Conversation',
  'CoachingSession',
  'HealthMetric',
  'SavedResource',
  'ProactiveReminder',
  'AppNotification',
  'UserDeletedConversations',
  'ForumPost',
  'ForumComment',
  'CommunityGroup',
  'GroupMembership',
  'SharedProgress',
  'UserPoints',
  'Subscription',
  'VideoProgress',
  'Playlist',
  'PlaylistVideo',
  'UserJourneyProgress',
  'ExerciseRecommendationFeedback',
  'SessionSummary',
  'CompanionMemory',
  'TherapyFeedback',
  'CrisisAlert',
  'CaseFormulation',
  'MindGameActivity'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'admin') {
      return Response.json(
        { error: 'Admin or app-owner accounts cannot be deleted from inside the app.' },
        { status: 403 }
      );
    }

    for (const entityName of USER_OWNED_ENTITIES) {
      const entityApi = base44.asServiceRole.entities[entityName];
      if (!entityApi) continue;

      const records = await entityApi.filter({ created_by: user.email });
      for (const record of records) {
        await entityApi.delete(record.id);
      }
    }

    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});