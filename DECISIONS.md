# Decisions Log

## 2026-10-15 — Repository-local persistent context
- Decision: Keep context files in each repository so a new conversation/agent can recover state.
- Rationale: Avoid reliance on long chat history alone.
- Impact: Update state, decisions, issues, and next action after each meaningful task.
- Status: Adopted.
