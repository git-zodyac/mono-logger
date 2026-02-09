import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.(test|spec).ts'],
    setupFiles: ['./src/setup.vitest.ts'],
    coverage: {
      enabled: true,
      reporter: ['json-summary', 'text'],
      reportsDirectory: 'artifacts/coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{d,types}.ts',
        'src/**/types.ts',
        'src/**/index.ts'
      ]
    },
  },
});
