# Ralph Harness

Ralph Harness is a portable multi-agent scaffold for long-running software work. It turns a vague requirement into a written plan, executes one feature slice at a time, and forces every handoff through reviewable files.

It does not ship a model runtime or hosted service. The package is a small collection of Agent Skills, specialized agent prompts, and repo-local planning docs that can be installed into an existing project.

Repository: [williamChen26/ralph-harness](https://github.com/williamChen26/ralph-harness)

## What It Installs

`ralph-harness init` installs the full harness:

- `AGENTS.md` with repo-level operating instructions
- `docs/exec-plans/*` for resumable specs, sprint contracts, build logs, and evaluations
- Agent Skills for supported coding agents
- Planner, Generator, and Evaluator agent definitions where the target tool supports custom agents

Default install targets:

| Tool surface | Skills | Agents |
| --- | --- | --- |
| Portable / Codex skill discovery | `.agents/skills/*` | `.agents/agents/*` |
| Claude Code | `.claude/skills/*` | `.claude/agents/*` |
| Cursor | `.cursor/skills/*` | `.cursor/agents/*` |
| Codex custom agents | Uses `.agents/skills/*` | `.codex/agents/*.toml` |

Codex currently discovers repo skills from `.agents/skills`, so Ralph keeps that as the shared skill location. Codex custom agents use `.codex/agents/*.toml`, while Cursor uses `.cursor/skills` and `.cursor/agents`.

## Install

```sh
npm install -g ralph-harness
cd your-repo
ralph-harness init
```

For local development from this checkout:

```sh
node ./bin/ralph-harness.mjs init ../some-repo
```

## Commands

```sh
ralph-harness init [target] [--force]
ralph-harness doctor [target]
```

`doctor` checks whether the full scaffold is present.

Install only one adapter surface:

```sh
ralph-harness init --shared-only
ralph-harness init --claude-only
ralph-harness init --cursor-only
ralph-harness init --codex-only
ralph-harness init --docs-only
```

`--agents-only` remains as a backward-compatible alias for `--shared-only`.

## Skills-Only Install

For standalone skill installs, use the standard `skills` CLI instead of the scaffold installer:

```sh
npx skills@latest add williamChen26/ralph-harness
```

The installer will let you choose which skills and target coding agents to install into. This installs skills only; it does not install Ralph's Planner, Generator, or Evaluator custom agents. Use `ralph-harness init` when you want the full scaffold with skills, agents, `AGENTS.md`, and `docs/exec-plans`.

The skills CLI works here because every skill lives at the standard path `skills/<name>/SKILL.md`.

## The Ralph Loop

```text
Planner(requirement) -> spec.md

while features remain:
  Generator -> sprint contract
  Evaluator -> approve or revise contract
  Generator -> tests, implementation, build log
  Evaluator -> pass or fail with evidence
  if fail: revise, up to max rounds

archive completed run
```

## Why This Exists

Modern coding agents can build large features, but long tasks still drift. Ralph Harness adds the thin layer that survives across tools: written contracts, progressive disclosure, hard evaluation, and repo-local memory.

The result is a small "agent operating system" for repositories where humans steer and agents execute.

## Project Shape

```text
bin/                    zero-dependency installer CLI
skills/                 canonical skill library: skills/<name>/SKILL.md
agents/                 canonical agent prompts: agents/<name>.md
.claude-plugin/         Claude Code plugin metadata
templates/              scaffold-only docs and AGENTS.md
  docs/exec-plans/      state machine and audit trail
docs/
  architecture.md       design notes for this package
  landscape.md          notes from public harness projects
```

## License

MIT
