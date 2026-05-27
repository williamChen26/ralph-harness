# Agents

Ralph Harness subagents live in `agents/<name>.md` as canonical assets.

Install them with the full scaffold:

```sh
ralph-harness init
```

For skills-only installs, prefer `npx skills add ...`; most skills installers do not install subagents.

Target layouts:

| Adapter | Destination |
| --- | --- |
| Codex-style | `.agents/agents/<name>.md` |
| Claude Code-style | `.claude/agents/<name>.md` |
| Generic | `agents/<name>.md` |

Skills are the most portable surface. Subagents are installed for tools that support project-level specialized agents.
