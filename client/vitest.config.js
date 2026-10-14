import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

// Tests unitaires du site (Vitest + Testing Library) : fonctions et composants testés seuls,
// dans un faux navigateur (jsdom). Les tests de parcours complets restent dans e2e/ (Playwright).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
      setupFiles: ['./src/__tests__/setup.js'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/__tests__/**', 'src/main.jsx'],
        reporter: ['text', 'html'],
        reportsDirectory: './coverage',
      },
    },
  })
);
