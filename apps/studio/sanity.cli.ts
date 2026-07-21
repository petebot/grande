import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

import { defineCliConfig } from 'sanity/cli'

import { loadStudioEnvironment } from './environment'

const localEnvironmentFile = fileURLToPath(new URL('../../.env.local', import.meta.url))

if (existsSync(localEnvironmentFile)) {
  loadEnvFile(localEnvironmentFile)
}

const { projectId, dataset } = loadStudioEnvironment(process.env)

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  vite: {
    envDir: '../..',
  },
})
