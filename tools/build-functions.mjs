import { mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const esbuildBin = path.join(root, 'node_modules', '.bin', 'esbuild');
const distRoot = path.join(root, 'dist', 'services');

const builds = [
  {
    entry: path.join(root, 'services', 'contact-api', 'src', 'handler.ts'),
    outdir: path.join(distRoot, 'contact-api'),
  },
  {
    entry: path.join(root, 'services', 'trading212-api', 'src', 'handler.ts'),
    outdir: path.join(distRoot, 'trading212-api'),
  },
];

rmSync(distRoot, { recursive: true, force: true });

for (const build of builds) {
  mkdirSync(build.outdir, { recursive: true });
  const result = spawnSync(
    esbuildBin,
    [
      build.entry,
      '--bundle',
      '--platform=node',
      '--target=node20',
      '--format=cjs',
      '--outfile=' + path.join(build.outdir, 'index.js'),
    ],
    {
      stdio: 'inherit',
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
