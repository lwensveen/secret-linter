import React, { useEffect, useState } from 'react';
import { Box as InkBox, Text as InkText, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { lintSecrets, Finding } from './index.js';
import path from 'path';

const Box = InkBox as unknown as React.FC<React.ComponentProps<typeof InkBox>>;
const Text = InkText as unknown as React.FC<React.ComponentProps<typeof InkText>>;

export function LintUI({ dir, staged }: { dir: string; staged: boolean }) {
  const [state, setState] = useState<'scanning' | 'done'>('scanning');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [cursor, setCursor] = useState(0);
  const { exit } = useApp();

  useEffect(() => {
    const f = lintSecrets(dir, { staged });
    setFindings(f);
    setState('done');
  }, [dir, staged]);

  useInput((input, key) => {
    if (state !== 'done') return;
    if (key.upArrow) setCursor(c => Math.max(0, c - 1));
    if (key.downArrow) setCursor(c => Math.min(findings.length - 1, c + 1));
    if (key.return) openInEditor(findings[cursor]);
    if (key.escape || input === 'q') exit();
  });

  if (state === 'scanning') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Scanning…
        </Text>
      </Box>
    );
  }

  if (!findings.length) {
    return <Text color="green">✅ No secrets found!</Text>;
  }

  return (
    <Box flexDirection="column">
      <Text color="red">
        {findings.length} potential secrets found (↑/↓ to navigate, ⏎ to open, q to quit)
      </Text>
      {findings.map((f, idx) => (
        <Text key={idx} inverse={idx === cursor} wrap="truncate-end">
          {path.relative(process.cwd(), f.file)}:{f.line} {f.text}
        </Text>
      ))}
    </Box>
  );
}

async function openInEditor(f: Finding) {
  const editor = process.env.EDITOR || 'vim';
  const { spawnSync } = await import('node:child_process');
  spawnSync(editor, [`+${f.line}`, f.file], { stdio: 'inherit' });
}
