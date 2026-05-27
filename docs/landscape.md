# Agent Harness Landscape

Ralph Harness is designed for teams that want a portable, repo-local agent workflow without adopting a full agent runtime.

## Useful Signals

- OpenAI's harness engineering writeup emphasizes repository-local knowledge, small maps instead of giant instruction files, and feedback loops that make agents more reliable.
- Anthropic's long-running app harness describes the same failure modes Ralph targets: context drift, premature wrap-up, and the need for structured artifacts between context resets.
- anthropics/skills is the reference pattern for a skill library: each skill is a folder with `SKILL.md`, and Claude Code can install skill sets through plugin marketplace flows.
- revfactory/harness shows a harness can be distributed as a meta-skill and Claude plugin, with direct global skill installation as an alternate path.
- Agent Almanac uses `skills/`, `agents/`, `teams/`, and guides as a reusable asset library, with plugin and symlink install paths.
- Agent Skills Hub shows the NPX-first installer pattern for mapping the same skill collection into multiple agent environments.
- AgentOpen and harnext show the open-source market wants terminal-native, inspectable, no-lock-in harnesses.
- Open Harness points at a different but related need: portable APIs across agent runtimes.
- OpenHands demonstrates the heavier end of the spectrum: a full software-agent platform with sandboxing, command line, browser interaction, multi-agent coordination, and benchmarks.

## Ralph Harness Positioning

Ralph Harness is deliberately below those runtimes. It does not provide a model, sandbox, browser, CI runner, or provider router. It gives any capable coding agent a disciplined workflow:

1. Planner expands intent into a feature-sliced spec.
2. Generator proposes one contract and implements only that contract.
3. Evaluator grades with evidence and hard thresholds.
4. The filesystem stores memory, decisions, and recovery state.

This makes it easy to adopt in existing repos because the harness is just files.

Ralph supports two install shapes:

- Skills-only: `npx skills add <owner>/ralph-harness --skill harness -a claude-code`
- Full scaffold: `ralph-harness init`
