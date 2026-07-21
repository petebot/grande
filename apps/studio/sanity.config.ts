import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { loadStudioEnvironment } from './environment'
import { schemaTypes } from './schemaTypes'

const { projectId, dataset } = loadStudioEnvironment(process.env)

export default defineConfig({
  name: 'default',
  title: 'Grande Burrito',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
