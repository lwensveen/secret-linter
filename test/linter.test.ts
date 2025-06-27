import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { lintSecrets, findingsToSarif } from '../src/index.js';

const fx = (...p: string[]) => path.join(__dirname, '..', '__fixtures__', ...p);

describe('secret-linter', () => {
  it('flags a secret in a directory', () => {
    const findings = lintSecrets(fx('bad-case'));
    expect(findings).toHaveLength(1);
    expect(findings[0].file).toMatch(/bad\.env$/);
  });

  it('ignores a safe directory', () => {
    const findings = lintSecrets(fx('good-case'));
    expect(findings).toHaveLength(0);
  });

  it('redacts in fix mode', () => {
    const tmpDir = fx('tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.copyFileSync(fx('bad-case', 'bad.env'), path.join(tmpDir, 'copy.env'));

    const findings = lintSecrets(tmpDir, { fix: true });
    const redacted = fs.readFileSync(path.join(tmpDir, 'copy.env'), 'utf8');

    expect(findings).toHaveLength(1);
    expect(redacted).toContain('=•••REDACTED•••');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects secrets only in staged diff', async () => {
    vi.mock('child_process', async () => {
      const mod = await vi.importActual<typeof import('child_process')>('child_process');
      return {
        ...mod,
        execSync: vi.fn(() => fs.readFileSync(fx('staged.patch'), 'utf8')),
      };
    });

    const { lintSecrets: stagedLint } = await import('../src/index.js');
    const findings = stagedLint('.', { staged: true });

    expect(findings).toHaveLength(1);
    expect(findings[0].text).toMatch(/API_KEY/);
  });

  it('builds a SARIF skeleton', () => {
    const findings = lintSecrets(fx('bad-case'));
    const sarif = findingsToSarif(findings);

    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].results).toHaveLength(1);
  });
});
