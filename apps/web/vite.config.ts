import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  envDir: '../..',
  plugins: [
    sveltekit({
      alias: {
        '@grande/content': '../../packages/content/src/index.ts',
      },
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },
      adapter: adapter(),
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
