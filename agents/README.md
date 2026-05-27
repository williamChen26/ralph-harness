# Agents

Ralph Harness agent prompts live in `agents/<name>.md` as canonical assets.

Install them with the full scaffold:

```sh
ralph-harness init
```

For skills-only installs, prefer `npx skills add ...`; skills installers usually do not install custom agents.

Target layouts:

| Adapter | Destination | Notes |
| --- | --- | --- |
| Portable shared copy | `.agents/agents/<name>.md` | Plain Markdown reference copy |
| Claude Code | `.claude/agents/<name>.md` | Plain Markdown agent prompt |
| Cursor | `.cursor/agents/<name>.md` | Markdown with generated `name` and `description` frontmatter |
| Codex | `.codex/agents/<name>.toml` | TOML custom-agent config with `developer_instructions` |

Skills are the most portable surface. Custom agents are installed only where the target tool has a compatible project-level agent format.
