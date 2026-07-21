import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Grande Burrito',
  projectId: 'w6vleqf7',
  dataset: 'development',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
