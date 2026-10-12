# Redundant visual layer audit — main app

Paused Google Play packaging for this UI correction. Main preview only; no Publish.

Root cause: /Chat padded teal wrapper always rendered even when ProactiveCheckIn returned null. Removed outer wrappers in both empty/new and initial active conversation branches. Spacing is now owned by the nonempty suggestion component. Summary remains a readable card without a second full-width painted band. Root chat backdrop wash, stale overridden teal message background and welcome-shell gradient removed.

Other cleanup:
- Home: removed six legacy decorative viewport layers/glows and page-container color/blur override.
- Progress and Exercises: removed full-page wash and blur around the existing readable cards.
- CoachingChat: removed painted message-scroll canvas; preserved header, composer, consent/risk panels and message bubbles.
- PersonalizedFeed, Playlists, StarterPath (loading/error/content), VideoPlayer (loading/content): removed legacy inline full-page gradients.
- TherapeuticForms: removed two outer teal washes. No form content changed.
- Exercises empty state: removed saturated teal nested CardContent fill.

Kept functional card surfaces, input fields, fixed navigation/composer surfaces, modal backdrops, media controls, safety/consent messages and the approved shared watercolor garden. Source review distinguishes decoration from functional layering; automated page checks do not constitute clinical or pixel-perfect visual review.

Validation: lint and build passed. 66 browser cases passed (44 route layouts at 360/768/1440; seven-language MyPath; Home actions; journal overlays; coaching wizards; chat welcome; three empty-band regressions and a real-suggestion dismissal regression). Existing environment needed Playwright browser dependencies reinstalled before the successful run.

Restore checkpoint before changes: 6accf2e6b797ead68776dc25.
