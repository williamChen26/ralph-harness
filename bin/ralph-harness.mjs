#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = join(root, 'templates');
const skillsDir = join(root, 'skills');
const agentsDir = join(root, 'agents');

const help = `ralph-harness

Usage:
  ralph-harness init [target] [--force] [--agents-only] [--claude-only] [--docs-only]
  ralph-harness doctor [target]

Commands:
  init     Install the full harness scaffold: AGENTS.md, exec-plan docs, skills, and subagents.
  doctor   Check whether a repository has the expected full scaffold.

Options:
  --force        Overwrite existing files.
  --agents-only  Install Codex-style .agents assets and docs, skip .claude.
  --claude-only  Install Claude-style .claude assets and docs, skip .agents.
  --docs-only    Install docs/exec-plans files only.

Standalone skills:
  Use the standard skills CLI instead:
  npx skills add <owner>/<repo> --skill harness -a claude-code
`;

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
  const includeCodex = !options.flags.has('--claude-only') && !options.flags.has('--docs-only');
  const includeClaude = !options.flags.has('--agents-only') && !options.flags.has('--docs-only');
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

  if (includeCodex) {
    installAssets(target, '.agents', force, result);
  }
  if (includeClaude) {
    installAssets(target, '.claude', force, result);
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

function installAssets(target, adapterRoot, force, result) {
  for (const skill of listDirectories(skillsDir)) {
    copyPath(join(skillsDir, skill), join(target, adapterRoot, 'skills', skill), force, result);
  }

  for (const file of readdirSync(agentsDir)) {
    if (!file.endsWith('.md') || file === 'README.md') continue;
    copyPath(join(agentsDir, file), join(target, adapterRoot, 'agents', file), force, result);
  }
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
