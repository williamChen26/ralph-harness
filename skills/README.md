# Skills

Ralph Harness skills follow the standard `skills/<name>/SKILL.md` Agent Skills layout.

## Direct Use

Point your agent at a specific skill:

```text
Follow skills/harness/SKILL.md to run the Ralph loop for this feature.
```

## Install With The Standard Skills CLI

```sh
npx skills@latest add williamChen26/ralph-harness
```

The installer will let you choose which skills and target coding agents to install into. It installs skills only, not custom agents; use `ralph-harness init` for the full scaffold.

## Scaffold Install Targets

`ralph-harness init` copies these canonical skills into tool-specific project locations:

| Target | Destination |
| --- | --- |
| Portable / Codex | `.agents/skills/<name>/SKILL.md` |
| Claude Code | `.claude/skills/<name>/SKILL.md` |
| Cursor | `.cursor/skills/<name>/SKILL.md` |

Codex uses `.agents/skills` for repo-scoped skill discovery, so there is no separate `.codex/skills` copy in the scaffold.

## Manual Fallback

```sh
cp -R skills/* .agents/skills/
cp -R skills/* .claude/skills/
cp -R skills/* .cursor/skills/
```
