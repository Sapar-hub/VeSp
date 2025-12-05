import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: [...configDefaults.exclude, 'dist/**'],
    deps: {
      inline: ['@prisma/client'],
      external: ['bcryptjs']
    },
    setupFiles: './tests/setup.ts'
  },
});
