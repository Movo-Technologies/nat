import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
mkdirSync('work/tests', { recursive: true });
for (const [source, target] of [
  ['lib/validation/early-access.ts', 'validation'],
  ['lib/submission.ts', 'submission'],
]) {
  const text = readFileSync(source, 'utf8').replace(
    "'./validation/early-access'",
    "'./validation.mjs'",
  );
  writeFileSync(
    `work/tests/${target}.mjs`,
    ts.transpileModule(text, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
      },
    }).outputText,
  );
}
const result = spawnSync(
  process.execPath,
  ['--test', 'tests/submission.test.mjs'],
  { stdio: 'inherit' },
);
process.exitCode = result.status ?? 1;
