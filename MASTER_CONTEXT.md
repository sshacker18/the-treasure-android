# Master Context Protocol

Read this file and then `PROJECT_STATE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, and `NEXT_ACTION.md` before substantive work.

## Sources of truth
- Repository code/configuration is authoritative for implementation.
- Git history, PRs, CI logs, test output, and device/runtime results are authoritative for execution status.
- Context summaries never override fresh evidence. Mark unknowns explicitly; never invent success.

## Required workflow
1. Inspect current branch, recent commits, working tree, relevant source, open PRs/issues, and CI.
2. State the immediate goal and constraints.
3. Make the smallest focused change; preserve existing work.
4. Run relevant checks and label results verified, attempted, or not run.
5. Update all context files after meaningful work with state, decisions, issues, checks, and one exact next action.
6. Do not claim a push, build, test, or device action succeeded unless confirmed by tool output.

## Safety
- Never commit secrets, credentials, private keys, or personal identification documents.
- Avoid destructive operations without explicit scope, preview, and safeguards.
- Preserve repository-specific branch/release policy and user data.
- Prefer concise, beginner-friendly commands and a single entrypoint where practical.

## End-of-task contract
Record what changed, commit/branch, checks and results, unresolved issues, rationale for decisions, and next action. If working from a device clone, pull first without overwriting uncommitted changes, and push verified updates.
