import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface Finding {
  file: string;
  line: number;
  text: string;
}

export const secretPatterns = [
  /API[_-]?KEY\s*=\s*["']?[A-Za-z0-9\-_/+=]{16,}["']?/i,
  /SECRET\s*=\s*["']?.{12,}["']?/i,
  /password\s*[:=]\s*["']?.+["']?/i,
  /jwt\s*[:=]\s*["']?.+["']?/i,
  /bcrypt\(\s*(\d{1,2})\s*\)/, // rounds < 10
];

export function lintSecrets(
  dir: string,
  { fix = false, staged = false }: { fix?: boolean; staged?: boolean } = {}
): Finding[] {
  return staged ? lintStaged() : lintDir(dir, { fix });
}

function lintDir(dir: string, { fix }: { fix: boolean }): Finding[] {
  const findings: Finding[] = [];
  walk(dir, fullPath => {
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    let mutated = false;
    lines.forEach((line, idx) => {
      if (secretPatterns.some(p => p.test(line))) {
        findings.push({ file: fullPath, line: idx + 1, text: line.trim() });
        if (fix) {
          lines[idx] = line.replace(/=.*/, '=•••REDACTED•••');
          mutated = true;
        }
      }
    });
    if (fix && mutated) fs.writeFileSync(fullPath, lines.join('\n'));
  });
  return findings;
}

function lintStaged(): Finding[] {
  /** unified=0 → no context lines */
  const diff = execSync('git diff --cached --unified=0 --no-color', {
    encoding: 'utf8',
  });
  const findings: Finding[] = [];
  let currentFile = '';
  let newLineNum = 0;
  diff.split('\n').forEach(line => {
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6);
    } else if (line.startsWith('@@')) {
      // @@ -a,b +c,d @@  -> capture c
      const m = /\+([0-9]+)/.exec(line);
      newLineNum = m ? parseInt(m[1], 10) - 1 : 0;
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      newLineNum++;
      const content = line.slice(1);
      if (secretPatterns.some(p => p.test(content))) {
        findings.push({ file: currentFile, line: newLineNum, text: content.trim() });
      }
    }
  });
  return findings;
}

function walk(dir: string, cb: (file: string) => void) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, cb);
    else if (/\.(env|ya?ml|json|[tj]s)$/.test(entry)) cb(p);
  }
}

export function findingsToSarif(findings: Finding[]) {
  return {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'secret-linter',
            informationUri: 'https://github.com/YOUR_HANDLE/secret-linter',
          },
        },
        results: findings.map(f => ({
          ruleId: 'possible-secret',
          level: 'error',
          message: { text: 'Possible secret detected' },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: f.file },
                region: { startLine: f.line },
              },
            },
          ],
        })),
      },
    ],
  };
}
