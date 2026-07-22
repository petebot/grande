import { randomUUID } from 'node:crypto'
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@sanity/client'

import { generatePublishedSnapshot } from '../packages/content/src/snapshot.js'

const DEFAULT_OUTPUT = 'apps/web/src/lib/content/public-content.snapshot.json'
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function outputPath(args: readonly string[]): string {
  if (args.length === 0) return resolve(REPOSITORY_ROOT, DEFAULT_OUTPUT)
  if (args.length === 2 && args[0] === '--output' && args[1]) {
    return resolve(REPOSITORY_ROOT, args[1])
  }

  throw new Error('Usage: pnpm content:snapshot [--output <path>]')
}

async function writeAtomically(path: string, contents: string): Promise<void> {
  const directory = dirname(path)
  const temporaryPath = resolve(directory, `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`)

  await mkdir(directory, { recursive: true })

  try {
    await writeFile(temporaryPath, contents, { encoding: 'utf8', flag: 'wx' })
    await rename(temporaryPath, path)
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

async function main(): Promise<void> {
  const projectId = requiredEnvironment('PUBLIC_SANITY_PROJECT_ID')
  const dataset = requiredEnvironment('PUBLIC_SANITY_DATASET')
  const apiVersion = requiredEnvironment('PUBLIC_SANITY_API_VERSION')
  const path = outputPath(process.argv.slice(2))
  const token = process.env.SANITY_VIEWER_TOKEN?.trim() || undefined
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    perspective: 'published',
    useCdn: false,
    ...(token ? { token } : {}),
  })

  const result = await generatePublishedSnapshot({
    now: new Date().toISOString(),
    fetchContent: ({ query, params, perspective }) => client.fetch(query, params, { perspective }),
  })

  await writeAtomically(path, result.serialized)
  console.info(JSON.stringify({ output: path, ...result.summary }))
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown snapshot generation error'
  console.error(`Content snapshot generation failed: ${message}`)
  process.exitCode = 1
})
