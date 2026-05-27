# Architecture

Ralph Harness has three layers.

## Asset Library

Canonical reusable assets live at the repository root:

- `skills/<name>/SKILL.md` for reusable workflows.
- `agents/<name>.md` for specialized subagents.
- `.claude-plugin/plugin.json` so Claude Code can treat the repository as a plugin-style package.

This is the source of truth. Adapter-specific project folders are generated from these assets.

## Install Paths

### Skills-Only

Standalone skill installation is delegated to the open `skills` CLI:

```sh
npx skills add <owner>/ralph-harness --skill harness -a claude-code
npx skills add <owner>/ralph-harness --skill harness -a codex
```

Ralph Harness does not implement a competing skill package manager. The repository is compatible with that ecosystem by exposing skills at `skills/<name>/SKILL.md`.

### Full Scaffold

`bin/ralph-harness.mjs` is a zero-dependency Node CLI for installing the full harness scaffold:

```sh
ralph-harness init
```

It composes:

- `templates/AGENTS.md`
- `templates/docs`
- canonical `skills/`
- canonical `agents/`

into target project paths:

| Adapter | Skills | Subagents |
| --- | --- | --- |
| `codex` | `.agents/skills/<name>/` | `.agents/agents/<name>.md` |
| `claude` | `.claude/skills/<name>/` | `.claude/agents/<name>.md` |

Scaffold install roots:

- `.agents`
- `.claude`
- `docs`
- `AGENTS.md`

## Scaffold Protocol

The installed files define a filesystem protocol for long-running agent work:

- Agent definitions live in `.agents/agents` and `.claude/agents`.
- User-invocable skills live in `.agents/skills` and `.claude/skills`.
- Run state lives in `docs/exec-plans`.
- Repository validation commands live in `docs/exec-plans/quality-commands.md`.

The harness does not assume a package manager, language, or test runner. Generator and Evaluator infer commands from the target repository when `quality-commands.md` has not been filled in.

## Why Canonical Assets Are Outside Templates

Mainstream skill repositories expose skills directly at `skills/<name>/SKILL.md`. Ralph Harness follows that convention so users can install or reference a single skill without taking the full scaffold.

The `templates/` directory is reserved for scaffold-only files such as `AGENTS.md` and `docs/exec-plans`. The installer copies canonical skills and agents into adapter-specific scaffold paths at install time, avoiding duplicated source files.

This keeps the project both:

- a skills/subagents collection, and
- a full harness scaffold installer.

## Extension Points

- Add more target adapter directories under `templates/`.
- Add examples under `docs/` rather than making the default prompts more specific.
- Keep the state machine stable so existing run histories remain readable.
