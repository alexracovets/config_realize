import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@configurator': path.resolve(__dirname, './src/configurator'),
      '@configurator/mappers': path.resolve(__dirname, './src/configurator/mappers'),
      '@configurator/constants': path.resolve(__dirname, './src/configurator/constants'),
      '@configurator/utils/render': path.resolve(__dirname, './src/configurator/utils/render'),
      '@configurator/utils': path.resolve(__dirname, './src/configurator/utils'),
      '@configurator/types': path.resolve(__dirname, './src/configurator/types'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
