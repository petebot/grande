import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const canonicalUrl =
  'https://raw.githubusercontent.com/petebot/portfolio26/main/DESIGN_SYSTEM_CONTRACT.md'
const apiUrl = 'https://api.github.com/repos/petebot/portfolio26/contents/DESIGN_SYSTEM_CONTRACT.md'
const localContract = await readFile(
  resolve(import.meta.dirname, '../DESIGN_SYSTEM_CONTRACT.md'),
  'utf8',
)
const localVersion = localContract.match(/\*\*Version:\*\*\s*([\d.]+)/)?.[1]
const token = process.env.DESIGN_SYSTEM_CONTRACT_TOKEN

if (!localVersion) throw new Error('The local design-system contract has no declared version')

const response = await fetch(token ? apiUrl : canonicalUrl, {
  headers: {
    accept: token ? 'application/vnd.github.raw+json' : 'text/plain',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    'user-agent': 'grande-burrito-design-system-check',
  },
})

if (!response.ok) {
  throw new Error(
    `Could not read the canonical contract (${response.status}). If the source is private, configure DESIGN_SYSTEM_CONTRACT_TOKEN with read access.`,
  )
}

const upstream = await response.text()
const upstreamVersion = upstream.match(/\*\*Version:\*\*\s*([\d.]+)/)?.[1]

if (!upstreamVersion)
  throw new Error('The canonical design-system contract has no declared version')
if (upstreamVersion !== localVersion) {
  throw new Error(
    `Design-system contract review required: adopted ${localVersion}, canonical ${upstreamVersion}.`,
  )
}

console.log(`Design-system contract ${localVersion} matches the canonical source.`)
