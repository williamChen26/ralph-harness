# Changelog

## 0.1.1

- Added first-class Cursor scaffold support with `.cursor/skills` and `.cursor/agents`.
- Added Codex custom-agent output under `.codex/agents` while keeping Codex skills in `.agents/skills`.
- Updated README and install docs with the current GitHub repository and adapter matrix.
- Simplified skills-only install docs to use the interactive `skills` CLI flow.

## 0.1.0

- Initial public harness workflow release.
- Added Planner, Generator, Evaluator, Harness, and Hotfix templates.
- Added zero-dependency `ralph-harness init` and `doctor` commands.
- Added exec-plan state machine docs and quality command template.
- Added canonical `skills/` and `agents/` library layout.
- Documented standard `npx skills add` usage for standalone skill installs.
- Added Claude plugin metadata.
