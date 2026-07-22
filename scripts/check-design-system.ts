import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const tokenPath = join(root, 'apps/web/src/lib/design/tokens.css')
const sourceRoot = join(root, 'apps/web/src')
const requiredFiles = [
  'DESIGN_SYSTEM_CONTRACT.md',
  'docs/design-system.md',
  'AGENTS.md',
  'apps/web/src/routes/system/+page.svelte',
  'apps/web/src/routes/system/+page.server.ts',
] as const

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return sourceFiles(path)
      return ['.css', '.svelte'].includes(extname(entry.name)) ? [path] : []
    }),
  )

  return nested.flat()
}

function matches(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].map((match) => match[1] ?? match[0])
}

const failures: string[] = []

for (const requiredFile of requiredFiles) {
  try {
    await readFile(join(root, requiredFile), 'utf8')
  } catch {
    failures.push(`Missing required design-system file: ${requiredFile}`)
  }
}

const contract = await readFile(join(root, 'DESIGN_SYSTEM_CONTRACT.md'), 'utf8')
const guide = await readFile(join(root, 'docs/design-system.md'), 'utf8')
const contractVersion = contract.match(/\*\*Version:\*\*\s*([\d.]+)/)?.[1]
const adoptedVersion = guide.match(/Design System Contract\s+([\d.]+)/)?.[1]

if (!contractVersion || contractVersion !== adoptedVersion) {
  failures.push(
    `Contract version mismatch: local=${contractVersion ?? 'missing'} guide=${adoptedVersion ?? 'missing'}`,
  )
}

const tokenSource = await readFile(tokenPath, 'utf8')
const systemTokens = new Set(matches(tokenSource, /--[\w-]+(?=\s*:)/g))

const rawColorPattern = /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(/gi
const primitiveReferencePattern = /var\((--primitive-[\w-]+)/g

for (const file of await sourceFiles(sourceRoot)) {
  const content = await readFile(file, 'utf8')
  const projectPath = relative(root, file)

  if (file !== tokenPath && rawColorPattern.test(content)) {
    failures.push(`Raw color value outside tokens.css: ${projectPath}`)
  }
  rawColorPattern.lastIndex = 0

  if (file !== tokenPath && primitiveReferencePattern.test(content)) {
    failures.push(`Product UI consumes a primitive token directly: ${projectPath}`)
  }
  primitiveReferencePattern.lastIndex = 0

  const localDefinitions = new Set(matches(content, /--[\w-]+(?=\s*:)/g))
  for (const reference of matches(content, /var\((--[\w-]+)/g)) {
    if (!systemTokens.has(reference) && !localDefinitions.has(reference)) {
      failures.push(`Undefined CSS custom property ${reference} in ${projectPath}`)
    }
  }
}

if (failures.length > 0) {
  console.error(`Design-system check failed:\n- ${failures.join('\n- ')}`)
  process.exitCode = 1
} else {
  console.log(`Design-system contract ${contractVersion} and semantic-token boundaries are valid.`)
}
