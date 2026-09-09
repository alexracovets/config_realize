import { readFileSync } from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'vitest/config';

/* Load .env into process.env (no dotenv dependency in this project). */
const loadEnvFile = () => {
  try {
    readFileSync(path.resolve(__dirname, '.env'), 'utf8')
      .split(/\r?\n/)
      .forEach((line) => {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i.exec(line);
        if (!match) return;
        const [, key, rawValue] = match;
        if (process.env[key]) return;
        process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '');
      });
  } catch {
    /* no .env — rely on the ambient environment */
  }
};

loadEnvFile();

/* Mirror tsconfig `paths` so the runner resolves the same module aliases as Next. */
const buildAliases = () => {
  const tsconfigRaw = readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const { compilerOptions } = JSON.parse(tsconfigRaw) as { compilerOptions: { paths: Record<string, string[]> } };

  return Object.entries(compilerOptions.paths)
    .map(([alias, [target]]) => ({
      find: alias.endsWith('/*') ? new RegExp(`^${alias.slice(0, -2)}/`) : alias,
      replacement: alias.endsWith('/*') ? `${path.resolve(__dirname, target.slice(0, -2))}/` : path.resolve(__dirname, target),
    }))
    .sort((a, b) => (typeof a.find === 'string' ? 0 : -1) - (typeof b.find === 'string' ? 0 : -1));
};

export default defineConfig({
  test: {
    include: ['scripts/regenerate-order-pdfs/**/*.test.tsx'],
    testTimeout: 300000,
    hookTimeout: 300000,
  },
  resolve: {
    alias: buildAliases(),
  },
});
