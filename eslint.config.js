import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
  {
    ignores: [
      '**/.sanity/**',
      '**/.svelte-kit/**',
      '**/.vercel/**',
      '**/build/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.vscode/**',
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
    },
  },
  svelte.configs.prettier,
  eslintConfigPrettier,
)
