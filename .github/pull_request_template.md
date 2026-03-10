## Description
<!-- Provide a brief description of the changes in this PR -->

## Type of Change
<!-- Mark the relevant option with an 'x' -->
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Other (please describe)

## Assumptions Made
<!-- Document every assumption you made about how a function, entity, or agent works -->
<!-- If you assumed something you could not directly verify, write it here -->

## Safety Impact
<!-- Answer each question; if any answer is Yes, a human reviewer must sign off before merge -->
- Does this change affect any safety-critical file (`postLlmSafetyFilter`, `sanitizeAgentOutput`, `sanitizeConversation`, `backfillKnowledgeIndex`, `agentWiring`)? **Yes / No**
- Does this change expand retrieval scope (add an entity to any pipeline)? **Yes / No**
- Does this change affect private user entity access (`ThoughtJournal`, `Conversation`, `CaseFormulation`, `MoodEntry`, `CompanionMemory`, `UserDeletedConversations`)? **Yes / No**
- Does this change alter agent tool access or agent boundaries? **Yes / No**
- Does this change affect any UI, route, layout, or navigation? **Yes / No**
- Does this change modify any Base44 entity schema? **Yes / No**

## Testing Checklist
<!-- Mark completed items with an 'x' -->
- [ ] Unit tests pass locally (`npm test`)
- [ ] E2E tests pass locally (`npm run test:e2e`)
- [ ] Lint checks pass (`npm run lint`)
- [ ] Type checks pass (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)

## E2E Testing
<!-- For E2E test instructions, see the "Running E2E Tests" section in README.md -->
- [ ] E2E tests have been reviewed/updated for this change
- [ ] Tests pass with default configuration (Vite preview server)
- [ ] Tests pass against custom BASE_URL (if applicable)

## Human Review Required
<!-- Check all that apply; checked items require a human reviewer to sign off -->
- [ ] This PR modifies a safety-critical backend function
- [ ] This PR modifies entity schemas or agent wiring
- [ ] This PR expands retrieval or indexing scope
- [ ] This PR touches more than one high-scrutiny path
- [ ] I am uncertain about the safety impact of this change

## Additional Notes
<!-- Any additional context, screenshots, or information -->
