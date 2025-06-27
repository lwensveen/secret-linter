#!/usr/bin/env node
import { program } from 'commander';
import { render } from 'ink';
import React from 'react';
import { lintSecrets, findingsToSarif } from './index.js';
import { LintUI } from './ui.js';

program
  .argument('[dir]', 'directory to scan (ignored with --staged)', '.')
  .option('--staged', 'scan only git staged changes')
  .option('-f, --fix', 'redact secrets in-place (non-interactive)')
  .option('--format <fmt>', 'plain | sarif', 'plain')
  .option('--ui', 'interactive Ink UI')
  .option('-q, --quiet', 'no console output, exit code only')
  .parse();

const opts = program.opts<{
  staged: boolean;
  fix: boolean;
  format: string;
  ui: boolean;
  quiet: boolean;
}>();
const [dir] = program.args;

if (opts.ui) {
  render((<LintUI dir={dir} staged={opts.staged} />) as unknown as React.ReactElement);
} else {
  const findings = lintSecrets(dir, { fix: opts.fix, staged: opts.staged });
  if (!opts.quiet) {
    if (opts.format === 'sarif') console.log(JSON.stringify(findingsToSarif(findings), null, 2));
    else findings.forEach(f => console.log(`🚨 ${f.file}:${f.line}  ${f.text}`));
  }
  process.exit(findings.length ? 1 : 0);
}
