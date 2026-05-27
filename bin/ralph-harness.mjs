#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = join(root, 'templates');
const skillsDir = join(root, 'skills');
const agentsDir = join(root, 'agents');

const help = `ralph-harness

Usage:
  ralph-harness init [target] [--force] [--shared-only] [--claude-only] [--cursor-only] [--codex-only] [--docs-only]
  ralph-harness doctor [target]

Commands:
  init     Install the full harness scaffold: AGENTS.md, exec-plan docs, skills, and agents.
  doctor   Check whether a repository has the expected full scaffold.

Options:
  --force        Overwrite existing files.
  --shared-only  Install portable .agents assets and docs.
  --agents-only  Alias for --shared-only.
  --claude-only  Install Claude Code .claude assets and docs.
  --cursor-only  Install Cursor .cursor assets and docs.
  --codex-only   Install Codex-ready skills plus .codex custom agents and docs.
  --docs-only    Install docs/exec-plans files only.

Standalone skills:
  Use the standard skills CLI instead:
  npx skills@latest add williamChen26/ralph-harness
`;

const adapterGroups = {
  shared: {
    flag: '--shared-only',
    skillRoot: '.agents/skills',
    agentRoot: '.agents/agents',
    agentFormat: 'markdown'
  },
  claude: {
    flag: '--claude-only',
    skillRoot: '.claude/skills',
    agentRoot: '.claude/agents',
    agentFormat: 'markdown'
  },
  cursor: {
    flag: '--cursor-only',
    skillRoot: '.cursor/skills',
    agentRoot: '.cursor/agents',
    agentFormat: 'cursor-markdown'
  },
  codex: {
    flag: '--codex-only',
    skillRoot: '.agents/skills',
    agentRoot: '.codex/agents',
    agentFormat: 'codex-toml'
  }
};

function main(argv) {
  const [command = 'help', ...rest] = argv;

  if (command === 'help' || command === '--help' || command === '-h') {
    process.stdout.write(help);
    return;
  }

  if (command === 'init') {
    runInit(rest);
    return;
  }

  if (command === 'doctor') {
    runDoctor(rest);
    return;
  }

  fail(`Unknown command: ${command}\n\n${help}`);
}

function runInit(args) {
  const options = parseOptions(args);
  const target = resolve(options.positionals[0] ?? process.cwd());
  const includeAdapters = selectedAdapters(options.flags);
  const includeDocs = true;
  const force = options.flags.has('--force');
  const result = createResult();

  mkdirSync(target, { recursive: true });

  if (includeDocs) {
    copyPath(join(templatesDir, 'docs'), join(target, 'docs'), force, result);
  }

  if (!options.flags.has('--docs-only')) {
    copyPath(join(templatesDir, 'AGENTS.md'), join(target, 'AGENTS.md'), force, result);
  }

  const installedSkillRoots = new Set();
  for (const adapterName of includeAdapters) {
    installAssets(target, adapterGroups[adapterName], force, result, installedSkillRoots);
  }

  printResult(`Installed Ralph Harness scaffold into ${target}`, result);
}

function runDoctor(args) {
  const options = parseOptions(args);
  const target = resolve(options.positionals[0] ?? process.cwd());
  const required = [
    'AGENTS.md',
    '.agents/skills/harness/SKILL.md',
    '.agents/skills/planner/SKILL.md',
    '.agents/skills/generator/SKILL.md',
    '.agents/skills/evaluator/SKILL.md',
    '.agents/agents/planner.md',
    '.agents/agents/generator.md',
    '.agents/agents/evaluator.md',
    '.claude/skills/harness/SKILL.md',
    '.claude/agents/planner.md',
    '.cursor/skills/harness/SKILL.md',
    '.cursor/agents/planner.md',
    '.codex/agents/planner.toml',
    'docs/exec-plans/index.md',
    'docs/exec-plans/quality-commands.md',
    'docs/exec-plans/active/README.md',
    'docs/exec-plans/completed/README.md'
  ];

  const missing = required.filter((file) => !existsSync(join(target, file)));
  if (missing.length > 0) {
    process.stdout.write(`Ralph Harness is incomplete in ${target}\nMissing:\n`);
    process.stdout.write(missing.map((file) => `- ${file}`).join('\n'));
    process.stdout.write('\n');
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Ralph Harness looks ready in ${target}\n`);
}

function installAssets(target, adapter, force, result, installedSkillRoots) {
  if (!installedSkillRoots.has(adapter.skillRoot)) {
    for (const skill of listDirectories(skillsDir)) {
      copyPath(join(skillsDir, skill), join(target, adapter.skillRoot, skill), force, result);
    }
    installedSkillRoots.add(adapter.skillRoot);
  }

  for (const file of readdirSync(agentsDir)) {
    if (!file.endsWith('.md') || file === 'README.md') continue;
    installAgentFile(join(agentsDir, file), target, adapter, force, result);
  }
}

function installAgentFile(source, target, adapter, force, result) {
  const name = basename(source, '.md');

  if (adapter.agentFormat === 'markdown') {
    copyPath(source, join(target, adapter.agentRoot, `${name}.md`), force, result);
    return;
  }

  const sourceText = readFileSync(source, 'utf8');
  const metadata = agentMetadata(name, sourceText);
  if (adapter.agentFormat === 'cursor-markdown') {
    writeGeneratedFile(
      join(target, adapter.agentRoot, `${name}.md`),
      cursorAgentMarkdown(metadata, sourceText),
      force,
      result
    );
    return;
  }

  if (adapter.agentFormat === 'codex-toml') {
    writeGeneratedFile(
      join(target, adapter.agentRoot, `${name}.toml`),
      codexAgentToml(metadata, sourceText),
      force,
      result
    );
    return;
  }

  fail(`Unknown agent format: ${adapter.agentFormat}`);
}

function selectedAdapters(flags) {
  if (flags.has('--docs-only')) return [];

  const normalized = new Set(flags);
  if (normalized.has('--agents-only')) normalized.add('--shared-only');

  const explicit = Object.entries(adapterGroups)
    .filter(([, adapter]) => normalized.has(adapter.flag))
    .map(([name]) => name);

  return explicit.length > 0 ? explicit : Object.keys(adapterGroups);
}

function agentMetadata(name, sourceText) {
  const fallbackTitle = `${titleCase(name)} Agent`;
  const title = sourceText.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallbackTitle;
  const description = firstParagraph(sourceText)
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    name,
    title,
    description: description || `${title} for the Ralph Harness workflow.`
  };
}

function firstParagraph(sourceText) {
  const withoutHeading = sourceText.replace(/^#\s+.+\n+/, '');
  return withoutHeading
    .split(/\n\s*\n/)
    .find((block) => block.trim() && !block.trim().startsWith('##')) ?? '';
}

function cursorAgentMarkdown(metadata, sourceText) {
  return `---\nname: ${metadata.name}\ndescription: ${yamlQuote(metadata.description)}\n---\n\n${sourceText}`;
}

function codexAgentToml(metadata, sourceText) {
  return [
    `name = ${tomlString(metadata.name)}`,
    `description = ${tomlString(metadata.description)}`,
    `developer_instructions = ${tomlString(sourceText)}`,
    ''
  ].join('\n');
}

function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function yamlQuote(value) {
  return JSON.stringify(value);
}

function tomlString(value) {
  return JSON.stringify(value);
}

function parseOptions(args) {
  const flags = new Set();
  const positionals = [];
  for (const arg of args) {
    if (arg.startsWith('--')) flags.add(arg);
    else positionals.push(arg);
  }
  return { flags, positionals };
}

function createResult() {
  return { created: [], skipped: [], overwritten: [] };
}

function printResult(title, result) {
  const summary = [
    title,
    `created: ${result.created.length}`,
    `overwritten: ${result.overwritten.length}`,
    `skipped: ${result.skipped.length}`
  ];

  if (result.skipped.length > 0) {
    summary.push('Run with --force to overwrite skipped files.');
  }

  process.stdout.write(`${summary.join('\n')}\n`);
}

function copyPath(source, destination, force, result) {
  if (!existsSync(source)) {
    fail(`Missing source asset: ${source}`);
  }

  const stats = statSync(source);
  if (stats.isDirectory()) {
    for (const child of walk(source)) {
      copyPath(child, join(destination, relative(source, child)), force, result);
    }
    return;
  }

  mkdirSync(dirname(destination), { recursive: true });
  if (existsSync(destination) && !force) {
    result.skipped.push(destination);
    return;
  }

  const existed = existsSync(destination);
  writeFileSync(destination, readFileSync(source));
  result[existed ? 'overwritten' : 'created'].push(destination);
}

function writeGeneratedFile(destination, content, force, result) {
  mkdirSync(dirname(destination), { recursive: true });
  if (existsSync(destination) && !force) {
    result.skipped.push(destination);
    return;
  }

  const existed = existsSync(destination);
  writeFileSync(destination, content);
  result[existed ? 'overwritten' : 'created'].push(destination);
}

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const child = join(dir, name);
    const stats = statSync(child);
    if (stats.isDirectory()) entries.push(...walk(child));
    else entries.push(child);
  }
  return entries;
}

function listDirectories(dir) {
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .sort();
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

main(process.argv.slice(2));
