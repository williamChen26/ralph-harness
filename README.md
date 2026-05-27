# Ralph Harness

Ralph Harness is a portable multi-agent workflow for long-running software work. Planner turns a requirement into a spec, Generator proposes and implements one sprint contract at a time, and Evaluator acts as a hard quality gate.

It is intentionally light. There is no model runtime, no hosted service, and no lock-in. The package is both a skills collection and a harness scaffold.

- Use the `skills/` and `agents/` library when you only want reusable skills or subagents.
- Use `ralph-harness init` when you want the full harness: skills, subagents, `AGENTS.md`, and `docs/exec-plans`.

## Why This Exists

Modern coding agents are strong enough to build whole features, but long tasks still drift. Ralph Harness makes the work legible by forcing every handoff through files:

- `spec.md` captures the product blueprint.
- `contract.md` defines exactly one sprint slice.
- `build-log.md` records implementation evidence.
- `evaluation.md` records independent review.
- `meta.json` is the resumable state machine.

The result is a small "agent operating system" for repos where humans steer and agents execute.

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

`init` installs:

- `.agents/agents/*` and `.agents/skills/*`
- `.claude/agents/*` and `.claude/skills/*`
- `AGENTS.md`
- `docs/exec-plans/*`

Use `--agents-only`, `--claude-only`, or `--docs-only` if you want a smaller install.

## Skills-Only Install

For standalone skill installs, use the standard `skills` CLI rather than the `ralph-harness` scaffold installer:

```sh
# Install one skill into Claude Code
npx skills add <owner>/ralph-harness --skill harness -a claude-code

# Install one skill into Codex
npx skills add <owner>/ralph-harness --skill harness -a codex

# Install all Ralph skills
npx skills add <owner>/ralph-harness --skill '*' -a claude-code
```

This works because every skill lives at the mainstream path `skills/<name>/SKILL.md`.

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

## What Makes It Different

Many open agent harnesses focus on model routing, a universal runtime API, CI runners, or sandboxed software agents. Ralph Harness focuses on the thin layer that survives across tools: written contracts, progressive disclosure, hard evaluation, and repo-local memory.

That makes it useful when you already like your agent but want it to behave better on multi-hour or multi-day work.

## Project Shape

```text
bin/                    zero-dependency installer CLI
skills/                 canonical skill library: skills/<name>/SKILL.md
agents/                 canonical subagent library: agents/<name>.md
.claude-plugin/         Claude Code plugin metadata
templates/              scaffold-only docs and AGENTS.md
  docs/exec-plans/      state machine and audit trail
docs/
  landscape.md          notes from public harness projects
```

## License

MIT
