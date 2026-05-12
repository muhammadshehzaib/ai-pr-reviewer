import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    env: {
      JWT_SECRET: 'unit-test-secret-DO-NOT-USE-IN-PROD',
      ENCRYPTION_KEY: 'unit-test-encryption-key-DO-NOT-USE-IN-PROD',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/index.ts', 'src/app.ts'],
    },
  },
});
