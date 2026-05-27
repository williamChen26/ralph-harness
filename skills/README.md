# Skills

Ralph Harness skills follow the common `skills/<name>/SKILL.md` layout used by Agent Skills repositories.

## Direct Use

Point your agent at a specific skill:

```text
Follow skills/harness/SKILL.md to run the Ralph loop for this feature.
```

## Install With The Standard Skills CLI

```sh
# Install one skill into Claude Code
npx skills add <owner>/ralph-harness --skill harness -a claude-code

# Install one skill into Codex
npx skills add <owner>/ralph-harness --skill harness -a codex

# Install all skills
npx skills add <owner>/ralph-harness --skill '*' -a claude-code
```

## Manual Fallback

```sh
# Codex-style project skills
cp -R skills/* .agents/skills/

# Claude Code-style project skills
cp -R skills/* .claude/skills/
```
