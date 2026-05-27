# Contributing

Ralph Harness is mostly prompts, templates, and a tiny installer. Contributions should keep it portable.

## Principles

- Prefer repository-local files over services.
- Keep runtime dependencies at zero unless there is a strong reason.
- Keep templates model-agnostic and tool-agnostic.
- Add project-specific opinions to examples, not core prompts.
- Preserve the hard quality gate: one failed criterion fails a sprint.

## Before Opening a PR

```sh
npm run check
node --check ./bin/ralph-harness.mjs
node ./bin/ralph-harness.mjs init /tmp/ralph-harness-smoke --force
node ./bin/ralph-harness.mjs doctor /tmp/ralph-harness-smoke
```
